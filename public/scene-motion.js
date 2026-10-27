// Each visit starts with motion on; a pause only affects the current page.
const requested=new URLSearchParams(location.search).get('motion');
let enabled=requested!=='off';
class SceneMotion extends EventTarget{
 get matches(){return !enabled;}
 setEnabled(value){enabled=value;this.dispatchEvent(new Event('change'));}
}
export const sceneMotion=new SceneMotion();
window.addEventListener('pageshow',event=>{if(event.persisted)sceneMotion.setEnabled(requested!=='off');});
