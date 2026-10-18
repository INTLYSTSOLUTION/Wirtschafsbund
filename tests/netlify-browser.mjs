import {chromium,webkit,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {startProtectedServer} from './helpers/protected-server.mjs';
import {COOKIE,issueSession,readSettings,SESSION_SECONDS} from '../netlify/lib/security.js';
const server=await startProtectedServer();const out='../tmp/netlify';await fs.mkdir(`${out}/screenshots`,{recursive:true});const results=[];
try{
 for(const [engine,browserType] of [['Chromium',chromium],['WebKit',webkit]]){
 const browser=await browserType.launch();
 try{
  const context=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:390,height:844}});const page=await context.newPage();const errors=[],external=[],unexpected=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!r.url().startsWith(server.base))external.push(r.url());});page.on('response',r=>{if(r.status()>=400&&!['/anmelden','/index.html','/missing.html'].includes(new URL(r.url()).pathname))unexpected.push([r.url(),r.status()]);});
  for(const route of ['index.html','bund.html','projekte.html','aufnahme.html','assets/Wirtschaftsbund_Aufnahmeanfrage_Vorlage.pdf','assets/application.js']){const response=await context.request.get(new URL(route,server.base).href,{maxRedirects:0});assert.equal(response.status(),303);assert.equal(response.headers().location,'/zugang');assert.equal((await response.body()).length,0);}
  await page.goto(server.base);await expect(page).toHaveURL(/\/zugang$/);await expect(page.locator('h1')).toHaveText('GeschützterBereich.');
  for(const width of [360,390,768,1440]){await page.setViewportSize({width,height:900});await page.evaluate(()=>document.fonts.ready);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:`${out}/screenshots/access-${engine}-${width}.png`,fullPage:true});}
  await page.setViewportSize({width:390,height:844});
  await page.locator('#access-password').fill('definitely-wrong');await page.getByRole('button',{name:'Anmelden'}).click();await expect(page.getByRole('alert')).toContainText('stimmt nicht');await expect(page.locator('#access-password')).toHaveValue('');
  await page.locator('#access-password').fill(server.values.ACCESS_PASSWORD);await page.getByRole('button',{name:'Anmelden'}).click();await expect(page).toHaveURL(/index.html$/);await expect(page.locator('h1')).toContainText('Unternehmerisch');
  const cookies=await context.cookies();assert.equal(cookies.length,1);assert.equal(cookies[0].name,COOKIE);assert.equal(cookies[0].secure,true);assert.equal(cookies[0].httpOnly,true);assert.equal(cookies[0].sameSite,'Strict');assert.equal(await page.evaluate(()=>document.cookie),'');
  const pdf=await context.request.get(new URL('assets/Wirtschaftsbund_Aufnahmeanfrage_Vorlage.pdf',server.base).href);assert.equal(pdf.status(),200);assert.equal((await pdf.body()).subarray(0,5).toString(),'%PDF-');assert.match(pdf.headers()['cache-control'],/no-store/);
  await page.getByRole('button',{name:'Abmelden',exact:true}).click();await expect(page).toHaveURL(/\/zugang$/);assert.equal((await context.cookies()).length,0);await page.goBack();await expect(page).toHaveURL(/\/zugang$/);await page.goto(new URL('aufnahme.html',server.base).href);await expect(page).toHaveURL(/\/zugang$/);
  await page.goBack();await page.reload();await expect(page.locator('h1')).toHaveText('GeschützterBereich.');
  // Browser-rejected cookie expiry is not sufficient: server also rejects a signed expired token.
  const settings=readSettings({get:name=>server.values[name]});const expired=await issueSession(settings,new URL(server.base).origin,Math.floor(Date.now()/1000)-SESSION_SECONDS);
  await context.addCookies([{name:COOKIE,value:expired,url:server.base,httpOnly:true,secure:true,sameSite:'Strict'}]);await page.goto(server.base);await expect(page).toHaveURL(/\/zugang$/);
  await server.signIn(context);const previous=server.values.ACCESS_PASSWORD;server.values.ACCESS_PASSWORD=previous+'changed';await page.goto(server.base);await expect(page).toHaveURL(/\/zugang$/);server.values.ACCESS_PASSWORD=previous;
  delete server.values.ACCESS_SESSION_SECRET;const denied=await page.goto(new URL('index.html',server.base).href);assert.equal(denied.status(),503);await expect(page.locator('form')).toHaveCount(0);await expect(page.locator('h1')).toHaveText('GeschützterBereich.');server.values.ACCESS_SESSION_SECRET=settings.secret;
  for(const route of ['impressum.html','datenschutz.html']){const response=await page.goto(new URL(route,server.base).href);assert.equal(response.status(),200);await expect(page.locator('h1')).toBeVisible();}
  const nojs=await browser.newContext({ignoreHTTPSErrors:true,javaScriptEnabled:false});const np=await nojs.newPage();await np.goto(server.base);await np.locator('#access-password').fill(server.values.ACCESS_PASSWORD);await np.getByRole('button',{name:'Anmelden'}).click();await expect(np).toHaveURL(/index.html$/);await np.getByRole('button',{name:'Abmelden',exact:true}).click();await expect(np).toHaveURL(/zugang$/);await nojs.close();
  assert.deepEqual(errors,[]);assert.deepEqual(external,[]);assert.deepEqual(unexpected,[]);results.push({engine,passed:true,noJavaScript:true,directPdfProtected:true,rotationAndExpiry:true,externalRequests:0,consoleErrors:0});
 }finally{await browser.close();}
 }
 await fs.writeFile(`${out}/browser-results.json`,JSON.stringify({localHttpsRealHandlers:results,netlifyPlatformRateLimitTested:false,liveNetlifyDeploymentTested:false},null,2));console.log(JSON.stringify(results,null,2));
}finally{await server.close();}
