import {startProtectedServer} from './helpers/protected-server.mjs';
import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const protectedServer=await startProtectedServer();const base=protectedServer.base;
const output='../tmp/v2';await fs.mkdir(`${output}/screenshots`,{recursive:true});
const browser=await chromium.launch({headless:true});const results=[];
const routes=['index.html','bund.html','projekte.html','aufnahme.html','impressum.html','datenschutz.html','404.html'];
for(const width of [360,390,768,1440]){
 const page=await browser.newPage({viewport:{width,height:1000},deviceScaleFactor:1,ignoreHTTPSErrors:true});await protectedServer.signIn(page.context());const errors=[],failed=[];page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>failed.push(r.url()));
 for(const route of routes){
  const response=await page.goto(new URL(route,base).href);await page.evaluate(()=>document.fonts.ready);
  const state=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,h1:document.querySelectorAll('h1').length,fonts:[document.fonts.check('600 40px Cormorant'),document.fonts.check('400 18px Inter')],brokenImages:[...document.images].some(i=>!i.complete||!i.naturalWidth)}));
  results.push({width,route,status:response.status(),...state,errors:[...errors],failed:[...failed]});
  if(width!==360)await page.screenshot({path:`${output}/screenshots/${route.replace('.html','')}-${width}.png`,fullPage:true});
  if(route==='index.html'&&[390,1440].includes(width))await page.screenshot({path:`${output}/screenshots/hero-${width}.png`});
 }
 await page.close();
}
await browser.close();await fs.writeFile(`${output}/visual-results.json`,JSON.stringify(results,null,2));
console.log(JSON.stringify({pages:results.length,failures:results.filter(r=>r.status!==200||r.overflow||r.h1!==1||!r.fonts.every(Boolean)||r.brokenImages||r.errors.length||r.failed.length)},null,2));
if(results.some(r=>r.status!==200||r.overflow||r.h1!==1||!r.fonts.every(Boolean)||r.brokenImages||r.errors.length||r.failed.length))process.exitCode=1;

await protectedServer.close();
