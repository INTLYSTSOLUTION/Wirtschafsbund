import {accessPage} from '../lib/login-view.js';
import {readSettings,validHost,sameOrigin,boundedBody,passwordMatches,issueSession,sessionCookie,redirect,privateResponse} from '../lib/security.js';
export default async function login(request){
  try{
    const settings=readSettings(globalThis.Netlify?.env);
    if(!validHost(request,settings))return accessPage({status:503,message:'Der Zugang ist derzeit nicht verfügbar.',available:false});
    if(request.method!=='POST'||new URL(request.url).pathname!=='/anmelden')return privateResponse(new Response('Methode nicht erlaubt.',{status:405}));
    if(!sameOrigin(request))return accessPage({status:403,message:'Bitte melde dich direkt über diese Website an.'});
    if(request.headers.get('Content-Type')?.split(';')[0].trim()!=='application/x-www-form-urlencoded')return accessPage({status:415,message:'Bitte verwende das Passwortfeld zur Anmeldung.'});
    let body;try{body=await boundedBody(request);}catch{return accessPage({status:413,message:'Die Anfrage ist zu groß. Bitte versuche es erneut.'});}
    const fields=new URLSearchParams(body);
    if(fields.getAll('password').length!==1||[...fields.keys()].some(k=>k!=='password'))return accessPage({status:400,message:'Bitte verwende das Passwortfeld zur Anmeldung.'});
    if(!await passwordMatches(fields.get('password'),settings))return accessPage({status:401,message:'Das Passwort stimmt nicht. Bitte überprüfe deine Eingabe.'});
    const token=await issueSession(settings,new URL(request.url).origin);
    return redirect('/index.html',sessionCookie(token));
  }catch{return accessPage({status:503,message:'Der Zugang ist derzeit nicht verfügbar.',available:false});}
}
// Netlify enforces this before invocation. It is not a per-isolate memory counter.
export const config={path:'/anmelden',method:'POST',cache:'off',onError:'fail',rateLimit:{windowLimit:8,windowSize:180,aggregateBy:['ip','domain']}};
