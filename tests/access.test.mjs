import test from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes,createHash} from 'node:crypto';
import access,{config as gateConfig} from '../netlify/edge-functions/00-access.js';
import login,{config as loginConfig} from '../netlify/edge-functions/10-login.js';
import {COOKIE,SESSION_SECONDS,readSettings,issueSession,hasSession,sessionCookie,passwordMatches} from '../netlify/lib/security.js';
const origin='https://protected.example.test';
const credentials={ACCESS_PASSWORD:randomBytes(32).toString('base64url'),ACCESS_SESSION_SECRET:randomBytes(48).toString('base64url'),ACCESS_ALLOWED_HOSTS:'protected.example.test'};
const environment=values=>({get:name=>values[name]});
const settings=readSettings(environment(credentials));
const req=(path='/',options={})=>new Request(origin+path,options);
const post=(body,extra={})=>req('/anmelden',{method:'POST',headers:{Origin:origin,'Sec-Fetch-Site':'same-origin','Content-Type':'application/x-www-form-urlencoded',...extra},body});
const body=password=>new URLSearchParams({password}).toString();
const setEnv=(values=credentials)=>{globalThis.Netlify={env:environment(values)};};
setEnv();
async function guard(request){let calls=0;const response=await access(request,{next:async()=>{calls++;return new Response('PRIVATE CONTENT',{headers:{ETag:'test','Last-Modified':'test'}});}});return {response,calls};}
function privateHeaders(response){for(const name of ['Cache-Control','CDN-Cache-Control','Netlify-CDN-Cache-Control'])assert.match(response.headers.get(name),/no-store/);assert.match(response.headers.get('X-Robots-Tag'),/noindex/);assert.equal(response.headers.get('ETag'),null);}

test('missing or weak settings fail closed, including direct PDF',async()=>{
 for(const values of [{},{...credentials,ACCESS_PASSWORD:'short'},{...credentials,ACCESS_SESSION_SECRET:'short'},{...credentials,ACCESS_ALLOWED_HOSTS:'*.example.test'},{...credentials,ACCESS_ALLOWED_HOSTS:''}]){
  assert.equal(readSettings(environment(values)),null);setEnv(values);
  for(const path of ['/','/aufnahme.html','/assets/Wirtschaftsbund_Aufnahmeanfrage_Vorlage.pdf','/anmelden']){const {response,calls}=await guard(req(path));assert.equal(response.status,503);assert.equal(calls,0);assert.doesNotMatch(await response.text(),/PRIVATE CONTENT|<form/);privateHeaders(response);}
 }setEnv();
});
test('exact HTTPS host allowlist blocks aliases, previews and HTTP',async()=>{
 for(const host of ['https://deploy-preview-1--protected.netlify.app','https://old-deploy--protected.netlify.app','https://attacker.test','http://protected.example.test']){const {response,calls}=await guard(new Request(host+'/index.html'));assert.equal(response.status,503);assert.equal(calls,0);}
});
test('every protected page, script and direct download requires authentication',async()=>{
 for(const path of ['/','/index.html','/bund','/bund.html','/projekte.html','/aufnahme.html','/404.html','/assets/config.js','/assets/site.js','/assets/vendor/pdf-lib.min.js','/assets/fonts/Inter-Regular.ttf','/assets/Wirtschaftsbund_Aufnahmeanfrage_Vorlage.pdf','/assets/Wirtschaftsbund_Aufnahmeanfrage_Vorlage.pdf?download=1','/unknown/path']){
  for(const method of ['GET','HEAD']){const {response,calls}=await guard(req(path,{method}));assert.equal(response.status,303,path);assert.equal(response.headers.get('Location'),'/zugang');assert.equal(calls,0);assert.equal(await response.text(),'');privateHeaders(response);}
 }
});
test('public allowlist is small and remains readable without configuration',async()=>{
 setEnv({});for(const path of ['/impressum.html','/datenschutz.html','/robots.txt','/assets/styles.css','/assets/access.css','/assets/pferd-original.jpg','/assets/fonts/inter-latin-400-normal.woff2']){const {response,calls}=await guard(req(path));assert.equal(response.status,200);assert.equal(calls,1);privateHeaders(response);}setEnv();
});
test('access page is minimal and does not contain protected data or credentials',async()=>{
 const {response,calls}=await guard(req('/zugang'));const text=await response.text();assert.equal(response.status,200);assert.equal(calls,0);assert.match(text,/<title>Zugang<\/title>/);assert.match(text,/>Bestätigen<\/button>/);assert.doesNotMatch(text,/Der Wirtschaftsbund|pferd-original|wordmark|<img|<header|<footer|Persönlicher Zugang/);assert.match(text,/type="password"/);assert.match(text,/https:\/\/www.tiktok.com\/@der_wirtschaftsbund/);assert.doesNotMatch(text,/Instagram/);assert.match(text,/action="\/anmelden"/);assert.doesNotMatch(text,/PRIVATE CONTENT|projekte.html|aufnahme.html/);for(const value of [credentials.ACCESS_PASSWORD,credentials.ACCESS_SESSION_SECRET])assert.ok(!text.includes(value));privateHeaders(response);
});
test('wrong password does not issue cookie or echo submitted value',async()=>{
 const wrong=randomBytes(24).toString('base64url');const response=await login(post(body(wrong)));assert.equal(response.status,401);assert.equal(response.headers.get('Set-Cookie'),null);assert.ok(!(await response.text()).includes(wrong));privateHeaders(response);assert.equal(await passwordMatches(wrong,settings),false);
});
test('correct password issues signed, secure, bounded cookie; session gates content',async()=>{
 const response=await login(post(body(credentials.ACCESS_PASSWORD)));assert.equal(response.status,303);assert.equal(response.headers.get('Location'),'/index.html');const cookie=response.headers.get('Set-Cookie');for(const flag of ['Secure','HttpOnly','SameSite=Strict','Path=/','Max-Age=28800'])assert.ok(cookie.includes(flag));assert.ok(!cookie.includes('Domain='));assert.ok(!cookie.includes(credentials.ACCESS_PASSWORD));privateHeaders(response);
 const request=req('/assets/Wirtschaftsbund_Aufnahmeanfrage_Vorlage.pdf',{headers:{Cookie:cookie.split(';')[0]}});assert.equal(await hasSession(request,settings),true);const result=await guard(request);assert.equal(result.calls,1);assert.equal(await result.response.text(),'PRIVATE CONTENT');privateHeaders(result.response);
 const head=await guard(req('/index.html',{method:'HEAD',headers:{Cookie:cookie.split(';')[0]}}));assert.equal(await head.response.text(),'');
});
test('tampering, duplicate cookies, expiry, other origins and rotations revoke access',async()=>{
 const now=Math.floor(Date.now()/1000);const token=await issueSession(settings,origin,now);const valid=req('/',{headers:{Cookie:`${COOKIE}=${token}`}});assert.equal(await hasSession(valid,settings,now+SESSION_SECONDS-1),true);assert.equal(await hasSession(valid,settings,now+SESSION_SECONDS),false);assert.equal(await hasSession(valid,{...settings,password:randomBytes(32).toString('hex')},now),false);assert.equal(await hasSession(valid,{...settings,secret:randomBytes(48).toString('hex')},now),false);
 for(const cookie of [`${COOKIE}=${token}x`,`${COOKIE}=x${token}`,`${COOKIE}=${token}; ${COOKIE}=${token}`,`${COOKIE}=broken`,`${COOKIE}=${'a'.repeat(2100)}`])assert.equal(await hasSession(req('/',{headers:{Cookie:cookie}}),settings,now),false);
 assert.equal(await hasSession(new Request('https://preview.example.test/',{headers:{Cookie:`${COOKIE}=${token}`}}),settings,now),false);
 const future=await issueSession(settings,origin,now+120);assert.equal(await hasSession(req('/',{headers:{Cookie:`${COOKIE}=${future}`}}),settings,now),false);
 const expired=await issueSession(settings,origin,now-SESSION_SECONDS);const {response,calls}=await guard(req('/',{headers:{Cookie:`${COOKIE}=${expired}`}}));assert.equal(response.status,303);assert.equal(calls,0);
 setEnv({...credentials,ACCESS_PASSWORD:randomBytes(32).toString('hex')});assert.equal((await guard(valid)).calls,0);setEnv();
});
test('login rejects cross-origin, missing Origin, wrong type and oversized/ambiguous body',async()=>{
 for(const originHeader of ['https://attacker.test','null',''])assert.equal((await login(post(body(credentials.ACCESS_PASSWORD),{Origin:originHeader}))).status,403);
 assert.equal((await login(post(body(credentials.ACCESS_PASSWORD),{'Sec-Fetch-Site':'same-site'}))).status,403);
 assert.equal((await login(post('{}',{'Content-Type':'application/json'}))).status,415);
 assert.equal((await login(post('password='+'a'.repeat(2050)))).status,413);
 for(const value of ['','password=a&password=b','password=a&extra=b'])assert.equal((await login(post(value))).status,400);
 assert.equal((await login(req('/anmelden'))).status,405);
});
test('logout requires same-origin POST and clears the cookie',async()=>{
 assert.equal((await guard(req('/abmelden'))).response.status,405);
 assert.equal((await guard(req('/abmelden',{method:'POST',headers:{Origin:'https://attacker.test'}}))).response.status,403);
 const {response,calls}=await guard(req('/abmelden',{method:'POST',headers:{Origin:origin,'Sec-Fetch-Site':'same-origin'}}));assert.equal(response.status,303);assert.equal(calls,0);assert.match(response.headers.get('Set-Cookie'),/Max-Age=0/);assert.match(response.headers.get('Clear-Site-Data'),/cache/);privateHeaders(response);
});
test('unexpected runtime and upstream errors remain closed',async()=>{
 globalThis.Netlify={env:{get(){throw Error('simulated config error');}}};assert.equal((await guard(req('/'))).response.status,503);setEnv();
 const token=await issueSession(settings,origin);const result=await access(req('/',{headers:{Cookie:sessionCookie(token)}}),{next(){throw Error('upstream error');}});assert.equal(result.status,503);assert.doesNotMatch(await result.text(),/upstream error/);
});
test('deployment declarations enforce uncached all-path gate and platform rate limit',()=>{
 assert.deepEqual(gateConfig,{path:'/*',cache:'off',onError:'fail'});assert.equal(loginConfig.path,'/anmelden');assert.equal(loginConfig.method,'POST');assert.equal(loginConfig.onError,'fail');assert.equal(loginConfig.cache,'off');assert.deepEqual(loginConfig.rateLimit,{windowLimit:8,windowSize:180,aggregateBy:['ip','domain']});
});

const hash=value=>createHash('sha256').update(value).digest('hex');
test('independent key digests work without a shared password; malformed lists fail closed',async()=>{
 const keys=Array.from({length:3},()=>randomBytes(24).toString('base64url'));
 const values={...credentials,ACCESS_PASSWORD:''};const keySettings=readSettings(environment(values),keys.map(hash));
 assert.ok(keySettings);for(const value of keys)assert.equal(await passwordMatches(value,keySettings),true);
 for(const value of ['',null,'wrong',keys[0]+'x',keys[0].slice(1),keys[0]+' '])assert.equal(await passwordMatches(value,keySettings),false);
 for(const list of [[],['bad'],[keys[0]],[hash(keys[0]),hash(keys[0])],null])assert.equal(readSettings(environment(values),list),null);
 const token=await issueSession(keySettings,origin);const request=req('/',{headers:{Cookie:`${COOKIE}=${token}`}});
 const changed=readSettings(environment(values),keys.slice(1).map(hash));
 assert.equal(await hasSession(request,keySettings),true);assert.equal(await hasSession(request,changed),false);
 assert.equal(await passwordMatches(keys[0],changed),false);assert.equal(await passwordMatches(keys[1],changed),true);
});
