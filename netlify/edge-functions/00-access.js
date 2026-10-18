import {accessPage} from '../lib/login-view.js';
import {readSettings,validHost,hasSession,sameOrigin,clearCookie,redirect,privateResponse} from '../lib/security.js';
// Exact allowlist. No project content, applications, PDFs or vendor scripts are public.
const PUBLIC=new Set(['/impressum.html','/impressum','/datenschutz.html','/datenschutz','/robots.txt','/assets/styles.css','/assets/pferd-original.jpg',
  ...['inter-latin-400-normal','inter-latin-ext-400-normal','inter-latin-500-normal','inter-latin-ext-500-normal','cormorant-garamond-latin-600-normal','cormorant-garamond-latin-ext-600-normal'].map(name=>`/assets/fonts/${name}.woff2`)]);
export default async function access(request,context){
  try{
    const url=new URL(request.url),method=request.method;
    if(PUBLIC.has(url.pathname)&&['GET','HEAD'].includes(method))return privateResponse(await context.next(),method);
    const settings=readSettings(globalThis.Netlify?.env);
    if(!validHost(request,settings))return accessPage({status:503,message:'Der Zugang ist derzeit nicht verfügbar.',available:false,method});
    if(url.pathname==='/abmelden'){
      if(method!=='POST')return privateResponse(new Response('Bitte nutze den Abmeldebutton.',{status:405,headers:{Allow:'POST'}}),method);
      if(!sameOrigin(request))return privateResponse(new Response('Diese Anfrage ist nicht zulässig.',{status:403}));
      const response=redirect('/zugang',clearCookie());response.headers.set('Clear-Site-Data','"cache"');return response;
    }
    if(url.pathname==='/anmelden'&&method==='POST')return privateResponse(await context.next());
    if(!['GET','HEAD'].includes(method))return privateResponse(new Response('Methode nicht erlaubt.',{status:405,headers:{Allow:'GET, HEAD'}}));
    const loggedIn=await hasSession(request,settings);
    if(url.pathname==='/zugang')return loggedIn?redirect('/index.html'):accessPage({method});
    if(url.pathname==='/anmelden')return redirect('/zugang');
    if(!loggedIn)return redirect('/zugang',clearCookie());
    return privateResponse(await context.next(),method);
  }catch{return accessPage({status:503,message:'Der Zugang ist derzeit nicht verfügbar.',available:false,method:request.method});}
}
// Never use `bypass`, excludedPath or cache:"manual" on this security boundary.
export const config={path:'/*',cache:'off',onError:'fail'};
