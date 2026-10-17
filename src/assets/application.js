import { fields, validate } from './fields.js';
import { browserPdf, pdfFilename } from './pdf.js';
import { siteConfig } from './config.js';
import { hasEmail, emailMessage, mailtoFor } from './email.js';

const form = document.querySelector('#application-form');
let currentData = {}, lastPdf;
const $ = id => document.getElementById(id);
function showStep(step) {
  for (const name of ['edit','review','done']) $(`${name}-panel`).hidden = step !== name;
  for (const item of document.querySelectorAll('[data-step]')) {
    if (item.dataset.step === step) item.setAttribute('aria-current','step');
    else item.removeAttribute('aria-current');
  }
  if (step === 'edit') $('name').focus();
  else $(`${step}-title`).focus({preventScroll:true});
  document.querySelector('.steps').scrollIntoView({block:'start'});
}
function getData() { return Object.fromEntries(fields.map(f=>[f.id,$(f.id).value.replace(/\r\n?/g,'\n')])); }
function markError(id, error) {
  $(`${id}-error`).textContent = error || '';
  if (error) $(id).setAttribute('aria-invalid','true');
  else $(id).removeAttribute('aria-invalid');
}
for (const field of fields) $(field.id).addEventListener('input',()=>{
  markError(field.id,'');
  const counter=document.querySelector(`[data-count="${field.id}"]`);
  if(counter) counter.textContent=`${$(field.id).value.length} / ${field.max}`;
  $('form-feedback').textContent='';
  lastPdf=undefined;
});
form.addEventListener('submit',event=>{
  event.preventDefault();
  const data=getData();
  const errors=validate(data);
  for(const field of fields) markError(field.id,errors[field.id]);
  if(Object.keys(errors).length){
    $('form-feedback').textContent='Bitte überprüfe die markierten Angaben.';
    $(Object.keys(errors)[0]).focus();return;
  }
  currentData=data;lastPdf=undefined;
  const summary=$('summary');summary.replaceChildren();
  for(const [group,title] of [['person','Zur Person'],['introduction','Persönliche Vorstellung'],['optional','Ergänzende Angaben']]){
    const section=document.createElement('section');section.className='summary-group';
    const heading=document.createElement('h3');heading.textContent=title;section.append(heading);
    const list=document.createElement('dl');
    for(const field of fields.filter(f=>f.group===group)){
      const label=document.createElement('dt');label.textContent=field.label;
      const value=document.createElement('dd');value.textContent=data[field.id] || 'Nicht angegeben';
      list.append(label,value);
    }
    section.append(list);summary.append(section);
  }
  $('pdf-feedback').textContent='';showStep('review');
});
for(const id of ['edit-button','revise-button'])$(id).addEventListener('click',()=>showStep('edit'));

function download(bytes){
  const blob=new Blob([bytes],{type:'application/pdf'});
  const url=URL.createObjectURL(blob);const anchor=document.createElement('a');
  anchor.href=url;anchor.download=pdfFilename(currentData.name);document.body.append(anchor);anchor.click();anchor.remove();
  setTimeout(()=>URL.revokeObjectURL(url),60000);
}
function prepareEmail(){
  $('message-preview').textContent=emailMessage(currentData.name);
  $('copy-status').textContent='';
  if(hasEmail()){
    $('prepare-email').href=mailtoFor(currentData.name);
    $('prepare-email').hidden=false;
    
    $('copy-email').disabled=false;
  }
}
$('download-button').addEventListener('click',async()=>{
  const button=$('download-button');button.disabled=true;button.textContent='PDF wird erstellt …';
  $('pdf-feedback').textContent='';
  try {lastPdf=await browserPdf(currentData);download(lastPdf);prepareEmail();showStep('done');}
  catch(error){
    if(error.field){showStep('edit');markError(error.field,error.message);$(error.field).focus();}
    else $('pdf-feedback').textContent=error.message || 'Die PDF konnte nicht erstellt werden. Deine Angaben bleiben erhalten. Bitte versuche es erneut.';
  }finally{button.disabled=false;button.textContent='PDF erstellen und herunterladen ↓';}
});
$('download-again').addEventListener('click',()=>{if(lastPdf)download(lastPdf);});
// A mailto invocation cannot establish that an external program opened or sent mail.
$('prepare-email').addEventListener('click',()=>{
  $('copy-status').textContent='E-Mail-Programm angefordert. Bitte prüfe den Entwurf und füge die PDF als Anhang hinzu.';
});
async function copy(value,label){
  try{await navigator.clipboard.writeText(value);$('copy-status').textContent=`${label} kopiert.`;}
  catch{
    $('copy-status').textContent='Das Kopieren ist hier nicht verfügbar. Du kannst den Text markieren und selbst kopieren.';
    $('copy-fallback').hidden=false;
    $('copy-fallback-label').textContent=`${label} manuell kopieren`;
    $('copy-fallback-text').value=value;
    $('copy-fallback-text').focus();$('copy-fallback-text').select();
  }
}
$('copy-email').addEventListener('click',()=>{if(hasEmail())copy(siteConfig.applicationEmail,'E-Mail-Adresse');});
$('copy-message').addEventListener('click',()=>copy(emailMessage(currentData.name),'Nachricht'));

// Enable only after every handler is attached; no-script and load failure remain safe.
$('form-controls').disabled=false;
$('application-interactive').hidden=false;
$('script-fallback').hidden=true;
