// Runs Netlify's actual local edge runtime. Does not create a site or deploy.
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import net from 'node:net';
import {spawn,execFileSync} from 'node:child_process';
import {randomBytes,createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {chromium,expect} from '@playwright/test';
const temporary=await fs.mkdtemp(path.join(os.tmpdir(),'wb-netlify-'));
const freePort=()=>new Promise(resolve=>{const server=net.createServer();server.listen(0,'127.0.0.1',()=>{const port=server.address().port;server.close(()=>resolve(port));});});
const port=await freePort(),target=await freePort();const base=`https://localhost:${port}`;
// Synthetic loopback-only fixtures; no production credentials are used.
const password=randomBytes(32).toString('base64url'),secret=randomBytes(48).toString('base64url');let child,browser,logs='';
try{
 for(const name of ['dist','netlify','src','scripts','package.json','package-lock.json'])await fs.cp(name,path.join(temporary,name),{recursive:true});

 // Synthetic key digest exercises the new multi-key path in the real edge runtime.
 await fs.writeFile(path.join(temporary,'netlify/lib/access-keys.js'),`export const ACCESS_KEY_DIGESTS=Object.freeze(['${createHash('sha256').update(password).digest('hex')}']);\n`);
 await fs.symlink(path.resolve('node_modules'),path.join(temporary,'node_modules'));
 const config=(await fs.readFile('netlify.toml','utf8')).replaceAll('4176',String(target)).replace('port=8888',`port=${port}`).replace('port = 8888',`port = ${port}`);
 await fs.writeFile(path.join(temporary,'netlify.toml'),config+'\n[dev.https]\ncertFile="cert.pem"\nkeyFile="key.pem"\n');
 execFileSync('openssl',['req','-x509','-newkey','rsa:2048','-nodes','-keyout','key.pem','-out','cert.pem','-days','1','-subj','/CN=localhost'],{cwd:temporary,stdio:'ignore'});
 await fs.writeFile(path.join(temporary,'.env'),`ACCESS_PASSWORD=\nACCESS_SESSION_SECRET=${secret}\nACCESS_ALLOWED_HOSTS=localhost:${port}\n`,{mode:0o600});
 child=spawn(path.resolve('node_modules/.bin/netlify'),['dev','--offline','--no-open','--port',String(port)],{cwd:temporary,env:{...process.env,ACCESS_PASSWORD:'',ACCESS_SESSION_SECRET:secret,ACCESS_ALLOWED_HOSTS:`localhost:${port}`,NETLIFY_CLI_TELEMETRY_DISABLED:'1',BROWSER:'none'},detached:true,stdio:['ignore','pipe','pipe']});
 for(const stream of [child.stdout,child.stderr])stream.on('data',data=>{logs+=data;});
 browser=await chromium.launch();const context=await browser.newContext({ignoreHTTPSErrors:true});const page=await context.newPage();
 let ready=false;for(let attempt=0;attempt<90;attempt++){if(child.exitCode!==null)break;try{const response=await context.request.get(base+'/zugang',{timeout:1000});if(response.status()===200){ready=true;break;}}catch{}await new Promise(resolve=>setTimeout(resolve,500));}
 if(!ready)throw Error('Netlify local runtime did not become ready. '+logs.replaceAll(password,'[redacted]').replaceAll(secret,'[redacted]').slice(-6000));
 for(const route of ['/index.html','/projekte.html','/assets/Wirtschaftsbund_Aufnahmeanfrage_Vorlage.pdf']){const response=await context.request.get(base+route,{maxRedirects:0});assert.equal(response.status(),303);assert.equal(response.headers().location,'/zugang');assert.equal((await response.body()).length,0);}
 await page.goto(base+'/zugang');await page.locator('#access-password').fill('wrong');await page.getByRole('button',{name:'Bestätigen'}).click();await expect(page.getByRole('alert')).toContainText('stimmt nicht');await page.locator('#access-password').fill(password);await page.getByRole('button',{name:'Bestätigen'}).click();await expect(page.locator('h1')).toContainText('Unternehmerisch');
 const pdf=await context.request.get(base+'/assets/Wirtschaftsbund_Aufnahmeanfrage_Vorlage.pdf');assert.equal(pdf.status(),200);assert.equal((await pdf.body()).subarray(0,5).toString(),'%PDF-');assert.match(pdf.headers()['cache-control'],/no-store/);
 await page.getByRole('button',{name:'Abmelden',exact:true}).click();await expect(page).toHaveURL(/\/zugang$/);assert.equal((await context.request.get(base+'/aufnahme.html',{maxRedirects:0})).status(),303);
 console.log('Passed: actual Netlify CLI HTTPS edge runtime, direct route/PDF denial, wrong/correct password, protected PDF, logout. Platform rate limit remains a live-deployment check.');
 await fs.mkdir('../tmp/netlify',{recursive:true});await fs.writeFile('../tmp/netlify/cli-results.json',JSON.stringify({passed:true,cli:'27.13.0',actualLocalNetlifyEdgeRuntime:true,liveDeployment:false,platformRateLimitTested:false},null,2));
}finally{if(browser)await browser.close();if(child&&child.exitCode===null){process.kill(-child.pid,'SIGTERM');await new Promise(resolve=>{child.once('exit',resolve);setTimeout(resolve,3000);});}await fs.rm(temporary,{recursive:true,force:true});}
