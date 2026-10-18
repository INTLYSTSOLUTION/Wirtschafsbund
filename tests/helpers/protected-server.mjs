// Local HTTPS integration harness: runs the real handlers, not the Netlify CDN.
// Credentials are random and memory-only. Netlify's platform rate limit is NOT simulated.
import https from 'node:https';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {execFileSync} from 'node:child_process';
import {randomBytes} from 'node:crypto';
import access from '../../netlify/edge-functions/00-access.js';
import login from '../../netlify/edge-functions/10-login.js';
export async function startProtectedServer(){
 const temporary=await fs.mkdtemp(path.join(os.tmpdir(),'wb-test-'));
 execFileSync('openssl',['req','-x509','-newkey','rsa:2048','-nodes','-keyout',path.join(temporary,'key.pem'),'-out',path.join(temporary,'cert.pem'),'-days','1','-subj','/CN=localhost'],{stdio:'ignore'});
 const root=path.resolve('dist');const oldNetlify=globalThis.Netlify;
 const values={ACCESS_PASSWORD:randomBytes(32).toString('base64url'),ACCESS_SESSION_SECRET:randomBytes(48).toString('base64url')};
 globalThis.Netlify={env:{get:name=>values[name]}};
 const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.jpg':'image/jpeg','.pdf':'application/pdf','.woff2':'font/woff2','.ttf':'font/ttf','.txt':'text/plain; charset=utf-8'};
 async function staticFile(request){
  let file=path.resolve(root,'.'+decodeURIComponent(new URL(request.url).pathname));let status=200;
  if(!file.startsWith(root+path.sep)&&file!==root)return new Response('Not found',{status:404});
  if(path.basename(file).startsWith('.')||path.basename(file)==='_headers')return new Response('Not found',{status:404});
  let stat=await fs.stat(file).catch(()=>null);if(stat?.isDirectory())file=path.join(file,'index.html');else if(!stat&&!path.extname(file))file+='.html';
  let data=await fs.readFile(file).catch(()=>null);if(!data){file=path.join(root,'404.html');data=await fs.readFile(file);status=404;}
  return new Response(request.method==='HEAD'?null:data,{status,headers:{'Content-Type':mime[path.extname(file)]||'application/octet-stream'}});
 }
 let base;
 const server=https.createServer({key:await fs.readFile(path.join(temporary,'key.pem')),cert:await fs.readFile(path.join(temporary,'cert.pem'))},async(input,output)=>{
  try{
   const chunks=[];for await(const chunk of input)chunks.push(chunk);
   const request=new Request(new URL(input.url,base),{method:input.method,headers:input.headers,...(!['GET','HEAD'].includes(input.method)?{body:Buffer.concat(chunks)}:{})});
   const response=await access(request,{next:()=>new URL(request.url).pathname==='/anmelden'&&request.method==='POST'?login(request):staticFile(request)});
   output.writeHead(response.status,Object.fromEntries(response.headers));output.end(Buffer.from(await response.arrayBuffer()));
  }catch{output.writeHead(503);output.end('Unavailable');}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));base=`https://127.0.0.1:${server.address().port}/`;values.ACCESS_ALLOWED_HOSTS=new URL(base).host;
 const signIn=async context=>{const response=await context.request.post(new URL('anmelden',base).href,{form:{password:values.ACCESS_PASSWORD},headers:{Origin:new URL(base).origin,'Sec-Fetch-Site':'same-origin'},maxRedirects:0});if(response.status()!==303)throw Error('Local test login failed');};
 return {base,values,signIn,close:async()=>{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));globalThis.Netlify=oldNetlify;await fs.rm(temporary,{recursive:true,force:true});}};
}
