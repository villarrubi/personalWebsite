// Follow the OS unless this URL explicitly chooses a motion preference.
const requested=new URLSearchParams(location.search).get('motion');
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
const initialEnabled=()=>requested==='on'||(requested!=='off'&&!reducedMotion.matches);
let enabled=initialEnabled();
class SceneMotion extends EventTarget{
 get matches(){return !enabled;}
 setEnabled(value){enabled=value;this.dispatchEvent(new Event('change'));}
}
export const sceneMotion=new SceneMotion();
reducedMotion.addEventListener('change',()=>sceneMotion.setEnabled(initialEnabled()));
window.addEventListener('pageshow',event=>{if(event.persisted)sceneMotion.setEnabled(initialEnabled());});
