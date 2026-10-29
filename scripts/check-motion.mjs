import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';

const source=(await readFile(new URL('../public/scene-motion.js',import.meta.url),'utf8'))
 .replace('export const sceneMotion=', 'const sceneMotion=globalThis.motion=');
function visit({reduced=false,saved='off',search=''}={}){
 const preference=new EventTarget();preference.matches=reduced;
 const listeners=new Map(),context={
  location:{search},URLSearchParams,EventTarget,Event,
  matchMedia:()=>preference,
  sessionStorage:{getItem:()=>saved,setItem(){}},
  window:{addEventListener:(type,listener)=>listeners.set(type,listener)},
 };
 runInNewContext(source,context);
 return {motion:context.motion,restore:()=>listeners.get('pageshow')?.({persisted:true}),changePreference:value=>{preference.matches=value;preference.dispatchEvent(new Event('change'));}};
}
for(const reduced of [false,true])for(const saved of [null,'on','off']){
 const {motion,restore}=visit({reduced,saved});
 assert.equal(motion.matches,reduced,'Normal visits follow the OS preference');
 let changes=0;motion.addEventListener('change',()=>changes++);
 motion.setEnabled(false);
 assert.equal(motion.matches,true,'Visitors can pause the current page');
 motion.setEnabled(true);
 assert.equal(motion.matches,false,'Visitors can resume the current page');
 assert.equal(changes,2,'Controls and renderer are notified of both changes');
 motion.setEnabled(false);restore();
 assert.equal(motion.matches,reduced,'Returning from history follows the OS preference');
 assert.equal(visit({reduced,saved:'off'}).motion.matches,reduced,'Reloading follows the OS rather than a stale saved choice');
}
const optOut=visit({search:'?motion=off'});
assert.equal(optOut.motion.matches,true,'An explicit URL opt-out remains available');
optOut.motion.setEnabled(true);optOut.restore();
assert.equal(optOut.motion.matches,true,'Restoring an explicit opt-out preserves that URL');
const live=visit();
live.changePreference(true);
assert.equal(live.motion.matches,true,'Changing the OS preference pauses motion immediately');
live.motion.setEnabled(true);
assert.equal(live.motion.matches,false,'A visitor can explicitly resume the current page');
live.restore();
assert.equal(live.motion.matches,true,'History restoration still honours reduced motion');
live.changePreference(false);
assert.equal(live.motion.matches,false,'Motion follows the updated OS preference');
for(const requested of ['on','off']){
 const explicit=visit({reduced:true,search:`?motion=${requested}`});
 assert.equal(explicit.motion.matches,requested==='off','Explicit URLs take precedence over the OS');
 explicit.changePreference(false);explicit.changePreference(true);explicit.restore();
 assert.equal(explicit.motion.matches,requested==='off','Explicit URLs remain effective after OS changes and history restoration');
}
console.log('PASS: reduced motion on visits, reloads, history restoration and OS changes; manual controls and URL overrides.');
