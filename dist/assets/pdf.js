import { fields, validate } from './fields.js';
import { siteConfig } from './config.js';

// Offset-preserving layout: visual wrapping never changes the stored answer.
export function layoutLines(value, font, size, width) {
  const lines=[];
  if(!value)return [{text:'',start:0,end:0}];
  let offset=0;
  for(const paragraph of value.split('\n')){
    const hasNewline=offset+paragraph.length<value.length;
    if(!paragraph){lines.push({text:'',start:offset,end:offset+(hasNewline?1:0)});offset+=hasNewline?1:0;continue;}
    let consumed=0;
    const chars=[...paragraph];
    let remaining=chars;
    while(remaining.length){
      let low=1,high=remaining.length,count=1;
      while(low<=high){
        const mid=Math.floor((low+high)/2);
        if(font.widthOfTextAtSize(remaining.slice(0,mid).join('').replace(/\t/g,'    '),size)<=width){count=mid;low=mid+1;}else high=mid-1;
      }
      if(count<remaining.length){let split=-1;for(let i=0;i<count;i++)if(/\s/.test(remaining[i]))split=i;if(split>0)count=split+1;}
      const raw=remaining.slice(0,count).join('');
      const last=count===remaining.length;
      lines.push({text:raw.replace(/\t/g,'    '),start:offset+consumed,end:offset+consumed+raw.length+(last&&hasNewline?1:0)});
      consumed+=raw.length;remaining=remaining.slice(count);
    }
    offset+=paragraph.length+(hasNewline?1:0);
  }
  return lines;
}
export function wrapText(text,font,size,width){return layoutLines(text,font,size,width).map(line=>line.text);}

export async function createApplicationPdf(data, assets, libs, config=siteConfig) {
  const {PDFDocument,rgb,PDFName,PDFString,PDFHexString,drawTextField,pushGraphicsState,popGraphicsState,rectangle,clip,endPath}=libs.PDFLib;
  const validation=validate(data,false);
  if(Object.keys(validation).length)throw new Error(Object.values(validation)[0]);
  const doc=await PDFDocument.create();doc.registerFontkit(libs.fontkit);
  const sans=await doc.embedFont(assets.sans,{subset:false,features:{liga:false,clig:false}});
  const serif=await doc.embedFont(assets.serif,{subset:false,features:{liga:false,clig:false,calt:false}});
  const logo=await doc.embedJpg(assets.logo);
  const supported=new Set(sans.getCharacterSet());
  for(const f of fields){const missing=[...new Set([...(data[f.id]||'')].filter(char=>!['\n','\r','\t'].includes(char)&&!supported.has(char.codePointAt(0))))];if(missing.length){const error=new Error(`Bitte ersetze folgende Zeichen, die in der PDF nicht dargestellt werden können: ${missing.join(' ')}`);error.field=f.id;throw error;}}
  doc.setTitle('Anfrage zur Aufnahme');doc.setAuthor(config.name);doc.setCreator(config.name);doc.setSubject('Unverbindliche persönliche Vorstellung');doc.setLanguage('de-DE');
  const form=doc.getForm();
  const navy=rgb(7/255,20/255,54/255),ink=rgb(21/255,32/255,58/255),muted=rgb(.35,.38,.40),stone=rgb(.79,.78,.74),paper=rgb(.995,.993,.985);
  const W=595.28,H=841.89,M=52,C=W-M*2,size=10.5,leading=15.2,bottom=80;
  const blank=Object.values(data).every(value=>!value);
  let page,y,pageHasField=false;
  const draw=(text,x,at,fontSize=10,font=sans,color=ink)=>page.drawText(text,{x,y:at,size:fontSize,font,color});
  function newPage(first=false){
    page=doc.addPage([W,H]);pageHasField=false;
    page.pushOperators(pushGraphicsState(),rectangle(M,747,58,58),clip(),endPath());
    page.drawImage(logo,{x:M-26,y:721,width:110,height:110});page.pushOperators(popGraphicsState());
    draw(config.name,M+76,781,23,serif,navy);
    draw(config.subtitle,M+76,760,9.5,sans,muted);
    draw(config.applicationEmail,M+76,744,9,sans,muted);
    page.drawLine({start:{x:M,y:722},end:{x:W-M,y:722},thickness:.6,color:stone});
    draw('Anfrage zur Aufnahme',M,678,34,serif,navy);
    if(first){draw('Eine unverbindliche Anfrage. Bitte sende die ausgefüllte PDF selbst per E-Mail.',M,651,9,sans,muted);if(blank)draw('Für längere Antworten ergänzt das Online-Formular automatisch weitere Seiten.',M,636,9,sans,muted);y=607;}else y=638;
  }
  function appearance(field,lines){field.updateAppearances(sans,(f,widget,font)=>{
    const rect=widget.getRectangle();f.acroField.setDefaultAppearance(`0.082 0.125 0.227 rg\n/${font.name} ${size} Tf`);
    return drawTextField({x:0,y:0,width:rect.width,height:rect.height,borderWidth:.5,borderColor:stone,color:paper,textColor:ink,font:font.name,fontSize:size,padding:5,textLines:lines.map((line,i)=>({text:line.text,encoded:font.encodeText(line.text),width:font.widthOfTextAtSize(line.text,size),height:font.heightAtSize(size),x:10,y:rect.height-10-font.heightAtSize(size,{descender:false})-i*leading}))});
  });}
  function fieldMetrics(f,value,minHeight){
    const lines=layoutLines(value,sans,size,C-20);const labels=wrapText(f.label,sans,9.5,C-100);
    return {lines,labels,labelHeight:labels.length*13,height:Math.max(minHeight,lines.length*leading+20)};
  }
  function section(title,reserve){if(y-42-reserve<bottom)newPage();y-=8;draw(title,M,y,23,serif,navy);y-=34;}
  function addField(f,minHeight){
    const raw=(data[f.id]||'').replace(/\r\n?/g,'\n');
    const metrics=fieldMetrics(f,raw,minHeight);
    let remaining=metrics.lines,part=1;
    do{
      let label=f.label+(part>1?` (Fortsetzung ${part})`:'');
      let labels=wrapText(label,sans,9.5,C-100),labelHeight=labels.length*13;
      const desired=Math.max(minHeight,remaining.length*leading+20);
      // Move whole fields when possible; split only answers taller than a fresh A4 page.
      if(y-labelHeight-8-desired<bottom&&pageHasField)newPage();
      const capacity=Math.max(1,Math.floor((y-labelHeight-8-bottom-20)/leading));
      const taken=remaining.slice(0,capacity);
      const fieldHeight=Math.max(Math.min(minHeight,y-labelHeight-8-bottom),taken.length*leading+20);
      const piece=raw.slice(taken[0]?.start||0,taken.at(-1)?.end||0);
      labels.forEach((line,i)=>draw(line,M,y-i*13,9.5));
      const note=`${f.required?'':'optional · '}${f.max} Zeichen`;
      draw(note,W-M-sans.widthOfTextAtSize(note,7.2),y,7.2,sans,muted);
      y-=labelHeight+8;const fieldY=y-fieldHeight;
      const name=part===1?f.id:`${f.id}__${part}`;
      const field=form.createTextField(name);field.enableMultiline();field.disableScrolling();field.setMaxLength(f.max);field.setText(piece);
      if(f.required)field.enableRequired();
      field.acroField.dict.set(PDFName.of('TU'),PDFHexString.fromText(label));
      field.addToPage(page,{x:M,y:fieldY,width:C,height:fieldHeight,borderWidth:.5,borderColor:stone,backgroundColor:paper,textColor:ink,font:sans});field.setFontSize(size);
      appearance(field,taken);y=fieldY-17;pageHasField=true;
      remaining=remaining.slice(capacity);part++;
      if(remaining.length)newPage();
    }while(remaining.length);
  }
  newPage(true);section('Zur Person',80);
  for(const f of fields.filter(f=>f.group==='person'))addField(f,f.id==='school'?42:35);
  const intro=fields.filter(f=>f.group==='introduction');
  const initialMin=blank?210:130;
  section('Deine Vorstellung',fieldMetrics(intro[0],data[intro[0].id]||'',initialMin).height+40);
  for(const f of intro)addField(f,blank?210:130);
  const optional=fields.filter(f=>f.group==='optional');
  section('Ergänzende Angaben',fieldMetrics(optional[0],data[optional[0].id]||'',65).height+35);
  for(const f of optional)addField(f,f.id==='link'?65:50);
  doc.getPages().forEach((p,i)=>{
    p.drawLine({start:{x:M,y:56},end:{x:W-M,y:56},thickness:.6,color:stone});
    p.drawText('Die Anfrage begründet keine Mitgliedschaft und schließt keinen Vertrag ab.',{x:M,y:38,size:7.8,font:sans,color:muted});
    p.drawText(`${i+1} / ${doc.getPageCount()}`,{x:W-M-25,y:38,size:8,font:sans,color:muted});
  });
  form.acroForm.dict.set(PDFName.of('DR'),doc.context.obj({Font:{[sans.name]:sans.ref}}));
  form.acroForm.dict.set(PDFName.of('DA'),PDFString.of(`/${sans.name} ${size} Tf 0.082 0.125 0.227 rg`));
  form.acroForm.dict.delete(PDFName.of('NeedAppearances'));
  return doc.save({updateFieldAppearances:false});
}
let assetsPromise,libraryPromise;
function loadScript(name,globalName){
  if(globalThis[globalName])return Promise.resolve();
  return new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=new URL(`./vendor/${name}`,import.meta.url).href;script.onload=resolve;script.onerror=()=>{script.remove();reject(new Error('Die PDF-Bibliothek konnte nicht geladen werden. Bitte versuche es erneut oder nutze die leere Vorlage.'));};document.head.append(script);});
}
export async function browserPdf(data){
  libraryPromise ||= Promise.all([loadScript('pdf-lib.min.js','PDFLib'),loadScript('fontkit.umd.min.js','fontkit')]).catch(error=>{libraryPromise=undefined;throw error;});
  assetsPromise ||= Promise.all(['fonts/Inter-Regular.ttf','fonts/CormorantGaramond-Semibold.ttf','pferd-original.jpg'].map(async file=>{const response=await fetch(new URL(`./${file}`,import.meta.url),{credentials:'same-origin'});if(!response.ok)throw new Error('Die PDF-Dateien konnten nicht geladen werden. Bitte versuche es erneut.');return new Uint8Array(await response.arrayBuffer());})).catch(error=>{assetsPromise=undefined;throw error;});
  const[,loaded]=await Promise.all([libraryPromise,assetsPromise]);const[sans,serif,logo]=loaded;
  return createApplicationPdf(data,{sans,serif,logo},{PDFLib:globalThis.PDFLib,fontkit:globalThis.fontkit});
}
export function pdfFilename(name){const safe=name.normalize('NFC').replace(/[^\p{L}\p{N}\s_-]/gu,'').trim().replace(/\s+/g,'_').slice(0,100);return `Wirtschaftsbund_Aufnahmeanfrage_${safe||'Anfrage'}.pdf`;}
