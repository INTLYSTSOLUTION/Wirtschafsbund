// Run manually with the private delivery file. Never logs key values.
import fs from 'node:fs/promises';
import {randomBytes,createHash} from 'node:crypto';
import access from '../netlify/edge-functions/00-access.js';
import login from '../netlify/edge-functions/10-login.js';
import {ACCESS_KEY_DIGESTS} from '../netlify/lib/access-keys.js';
const file=process.argv[2];if(!file)throw Error('Provide the private access-key file path.');
const text=await fs.readFile(file,'utf8');
const entries=[...text.matchAll(/^([0-9]{3}): ([A-Za-z0-9_-]{32})$/gm)];
if(entries.length!==100||new Set(entries.map(e=>e[2])).size!==100||ACCESS_KEY_DIGESTS.length!==100)throw Error('Key count or uniqueness mismatch.');
const origin='https://keys.example.test';
const values={ACCESS_SESSION_SECRET:randomBytes(48).toString('base64url'),ACCESS_ALLOWED_HOSTS:'keys.example.test'};
const previous=globalThis.Netlify;globalThis.Netlify={env:{get:name=>values[name]}};
try{
 for(const [index,entry] of entries.entries()){
  const key=entry[2];if(Number(entry[1])!==index+1||createHash('sha256').update(key).digest('hex')!==ACCESS_KEY_DIGESTS[index])throw Error(`Digest mismatch for key number ${index+1}.`);
  const response=await login(new Request(origin+'/anmelden',{method:'POST',headers:{Origin:origin,'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({password:key})}));
  if(response.status!==303||!response.headers.get('Set-Cookie'))throw Error(`Login failed for key number ${index+1}.`);
  const cookie=response.headers.get('Set-Cookie').split(';')[0];let called=false;
  const protectedResponse=await access(new Request(origin+'/index.html',{headers:{Cookie:cookie}}),{next:async()=>{called=true;return new Response('protected');}});
  if(!called||protectedResponse.status!==200)throw Error(`Session failed for key number ${index+1}.`);
 }
 console.log('Passed: 100 unique delivered keys, every digest matches, all 100 logins and signed sessions accepted by the real handlers. No key values logged. Platform rate limit not exercised.');
}finally{globalThis.Netlify=previous;}
