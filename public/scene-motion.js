// Orbits, stars and nebulae always start moving. The visitor can pause them for
// the current page from the scene footer; `?motion=off` opens a link paused.
const requested=new URLSearchParams(location.search).get('motion');
const initialEnabled=()=>requested!=='off';
let enabled=initialEnabled();
class SceneMotion extends EventTarget{
 get matches(){return !enabled;}
 setEnabled(value){enabled=value;this.dispatchEvent(new Event('change'));}
}
export const sceneMotion=new SceneMotion();
// A page restored from the back/forward cache starts moving again, like a new visit.
window.addEventListener('pageshow',event=>{if(event.persisted)sceneMotion.setEnabled(initialEnabled());});
