// Shared by the edge handlers and security tests. No credentials are bundled.
export const COOKIE = '__Host-wb_session';
export const SESSION_SECONDS = 8 * 60 * 60;
const enc = new TextEncoder();
const securityHeaders = {
  'Cache-Control':'private, no-store, max-age=0',
  'CDN-Cache-Control':'no-store',
  'Netlify-CDN-Cache-Control':'no-store',
  'Pragma':'no-cache',
  'X-Robots-Tag':'noindex, nofollow, noarchive',
  'X-Content-Type-Options':'nosniff',
  'Referrer-Policy':'same-origin',
  'X-Frame-Options':'DENY',
  'Permissions-Policy':'camera=(), microphone=(), geolocation=(), payment=()',
  'Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
};
export function privateResponse(response, method='GET') {
  const headers = new Headers(response.headers);
  for (const [name,value] of Object.entries(securityHeaders)) headers.set(name,value);
  headers.delete('etag'); headers.delete('last-modified');
  const vary=new Set((headers.get('Vary')||'').split(',').map(s=>s.trim()).filter(Boolean));vary.add('Cookie');headers.set('Vary',[...vary].join(', '));
  return new Response(method==='HEAD'?null:response.body,{status:response.status,headers});
}
export function redirect(path, cookie) {
  const headers = new Headers({Location:path});
  if(cookie)headers.set('Set-Cookie',cookie);
  return privateResponse(new Response(null,{status:303,headers}));
}
export function clearCookie(){return `${COOKIE}=; Path=/; Max-Age=0; Secure; HttpOnly; SameSite=Strict`;}
export function readSettings(env) {
  const password=env?.get('ACCESS_PASSWORD')||'';
  const secret=env?.get('ACCESS_SESSION_SECRET')||'';
  const hosts=(env?.get('ACCESS_ALLOWED_HOSTS')||'').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean);
  // Fail closed on missing or weak configuration. Hosts are exact, never wildcards.
  if(password.length<20||password.length>256||secret.length<43||secret.length>256||password===secret||!hosts.length)return null;
  if(hosts.some(h=>h.includes('://')||h.includes('/')||h.includes('*')||h.includes('@')||!/^([a-z0-9-]+\.)*[a-z0-9-]+(?::\d{1,5})?$/.test(h)))return null;
  return {password,secret,hosts};
}
export function validHost(request,settings) {
  const url=new URL(request.url);
  return Boolean(settings && url.protocol==='https:' && settings.hosts.includes(url.host.toLowerCase()));
}
export function sameOrigin(request) {
  return request.headers.get('Origin')===new URL(request.url).origin && !['cross-site','same-site'].includes(request.headers.get('Sec-Fetch-Site'));
}
function b64(bytes){return btoa(String.fromCharCode(...bytes)).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');}
function bytes(text){if(!/^[A-Za-z0-9_-]+$/.test(text))throw Error('Invalid encoding');return Uint8Array.from(atob(text.replaceAll('-','+').replaceAll('_','/')),c=>c.charCodeAt(0));}
async function key(settings){
  // Deriving the signing key from BOTH secrets revokes sessions after either changes.
  const base=await crypto.subtle.importKey('raw',enc.encode(settings.secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  const derived=await crypto.subtle.sign('HMAC',base,enc.encode('wirtschaftsbund-session-v1\0'+settings.password));
  return crypto.subtle.importKey('raw',derived,{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);
}
export async function passwordMatches(candidate,settings) {
  if(typeof candidate!=='string'||candidate.length>256)return false;
  const [a,b]=await Promise.all([candidate,settings.password].map(v=>crypto.subtle.digest('SHA-256',enc.encode(v))));
  const left=new Uint8Array(a),right=new Uint8Array(b);let diff=0;
  for(let i=0;i<left.length;i++)diff|=left[i]^right[i];return diff===0;
}
export async function issueSession(settings,origin,now=Math.floor(Date.now()/1000)) {
  const payload=b64(enc.encode(JSON.stringify({v:1,aud:origin,iat:now,exp:now+SESSION_SECONDS,nonce:b64(crypto.getRandomValues(new Uint8Array(16)))})));
  const signature=b64(new Uint8Array(await crypto.subtle.sign('HMAC',await key(settings),enc.encode(payload))));
  return `${payload}.${signature}`;
}
export function sessionCookie(token){return `${COOKIE}=${token}; Path=/; Max-Age=${SESSION_SECONDS}; Secure; HttpOnly; SameSite=Strict`;}
export async function hasSession(request,settings,now=Math.floor(Date.now()/1000)) {
  try{
    if(!settings)return false;
    const matches=(request.headers.get('Cookie')||'').split(';').map(s=>s.trim()).filter(s=>s.startsWith(COOKIE+'='));
    if(matches.length!==1)return false;
    const token=matches[0].slice(COOKIE.length+1);if(token.length>2048)return false;
    const [payload,signature,...extra]=token.split('.');if(!payload||!signature||extra.length)return false;
    if(!await crypto.subtle.verify('HMAC',await key(settings),bytes(signature),enc.encode(payload)))return false;
    const p=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes(payload)));
    return p.v===1&&p.aud===new URL(request.url).origin&&Number.isInteger(p.iat)&&Number.isInteger(p.exp)&&p.iat<=now+30&&p.exp>now&&p.exp>p.iat&&p.exp-p.iat<=SESSION_SECONDS&&typeof p.nonce==='string';
  }catch{return false;}
}
export async function boundedBody(request,max=2048){
  const length=request.headers.get('Content-Length');if(length!==null&&(!/^\d+$/.test(length)||Number(length)>max))throw Error('Too large');
  const reader=request.body?.getReader();if(!reader)return '';
  const chunks=[];let size=0;
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>max){await reader.cancel();throw Error('Too large');}chunks.push(value);}
  const all=new Uint8Array(size);let offset=0;for(const chunk of chunks){all.set(chunk,offset);offset+=chunk.length;}
  return new TextDecoder('utf-8',{fatal:true}).decode(all);
}
