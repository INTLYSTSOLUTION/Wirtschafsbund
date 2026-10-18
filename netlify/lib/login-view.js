import {access} from '../../src/data/access.js';
import {privateResponse} from './security.js';
const esc=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export function accessPage({status=200,message='',available=true,method='GET'}={}) {
  const handle=access.tiktokHandle.replace(/^@/,'');
  const contact=/^[a-zA-Z0-9._]{1,30}$/.test(handle)
    ? `Geschlossenes Netzwerk. Zugangsschlüssel per Anfrage via TikTok: <a href="https://www.tiktok.com/@${encodeURIComponent(handle)}" rel="noreferrer">@${esc(handle)}</a>`
    : 'Geschlossenes Netzwerk. Zugangsschlüssel per persönlicher Einladung.';
  const html=`<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow"><meta name="theme-color" content="#071436"><title>Zugang</title><link rel="icon" href="data:,"><link rel="stylesheet" href="/assets/access.css"></head><body><main class="access-main"><h1 class="visually-hidden">Zugang</h1>${message?`<p id="access-feedback" class="access-feedback" role="alert">${esc(message)}</p>`:''}${available?`<form action="/anmelden" method="post"><label class="visually-hidden" for="access-password">Zugangsschlüssel</label><input id="access-password" name="password" type="password" autocomplete="current-password" required maxlength="256" autocapitalize="none" spellcheck="false" ${message?'aria-describedby="access-feedback"':''} ${status===401?'aria-invalid="true"':''}><button type="submit">Bestätigen</button></form><p class="access-note">${contact}</p>`:''}</main></body></html>`;
  return privateResponse(new Response(html,{status,headers:{'Content-Type':'text/html; charset=utf-8'}}),method);
}
