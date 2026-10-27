// Explicit visitor choices take precedence; otherwise respect the OS preference.
const systemMotion=matchMedia('(prefers-reduced-motion: reduce)');
let choice;
try{choice=sessionStorage.getItem('orbital-motion')||undefined;}catch{}
const requested=new URLSearchParams(location.search).get('motion');
if(['on','off'].includes(requested)){choice=requested;try{sessionStorage.setItem('orbital-motion',choice);}catch{}}
class SceneMotion extends EventTarget{
 get matches(){return choice==='off'||(!choice&&systemMotion.matches);}
 setEnabled(enabled){choice=enabled?'on':'off';try{sessionStorage.setItem('orbital-motion',choice);}catch{}this.dispatchEvent(new Event('change'));}
}
export const sceneMotion=new SceneMotion();
systemMotion.addEventListener('change',()=>{if(!choice)sceneMotion.dispatchEvent(new Event('change'));});
