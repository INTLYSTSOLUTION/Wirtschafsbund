import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
const args=process.argv.slice(2);const option=(flag,fallback)=>{const index=args.indexOf(flag);return index<0?fallback:args[index+1];};
const root=path.resolve(option('--dir','dist'));const port=Number(option('--port','4173'));const base=option('--base','/').replace(/\/$/,'');
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.jpg':'image/jpeg','.pdf':'application/pdf','.woff2':'font/woff2','.ttf':'font/ttf','.txt':'text/plain; charset=utf-8','.xml':'application/xml; charset=utf-8'};
const csp="default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'";
const headers={'Cache-Control':'no-store','Content-Security-Policy':csp,'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','X-Frame-Options':'DENY','Permissions-Policy':'camera=(), microphone=(), geolocation=(), payment=()'};
const server=http.createServer(async(req,res)=>{
 try{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{...headers,Allow:'GET, HEAD'});res.end();return;}
  const requested=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(base&&!requested.startsWith(base+'/'))throw Error();
  const pathname=base?requested.slice(base.length):requested;
  let file=path.resolve(root,'.'+pathname);
  if(file!==root&&!file.startsWith(root+path.sep))throw Error();
  if(pathname.split('/').some(part=>part.startsWith('.'))||path.basename(file)==='_headers')throw Error();
  let stat=await fs.stat(file).catch(()=>null);
  if(!stat&&!path.extname(file)){file+='.html';stat=await fs.stat(file).catch(()=>null);}
  if(!stat)throw Error();if(stat.isDirectory())file=path.join(file,'index.html');
  const data=await fs.readFile(file);res.writeHead(200,{...headers,'Content-Type':mime[path.extname(file)]||'application/octet-stream'});res.end(req.method==='HEAD'?undefined:data);
 }catch{
  const data=await fs.readFile(path.join(root,'404.html')).catch(()=>Buffer.from('Seite nicht gefunden.'));
  res.writeHead(404,{...headers,'Content-Type':'text/html; charset=utf-8'});res.end(req.method==='HEAD'?undefined:data);
 }
});
server.listen(port,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${port}${base}/`));
