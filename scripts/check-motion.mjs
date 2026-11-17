import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
import {networkPoint} from '../public/hero-network.js';

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
 const {motion,restore,changePreference}=visit({reduced,saved});
 assert.equal(motion.matches,false,'Project motion always starts on, whatever the OS or an old saved choice says');
 let changes=0;motion.addEventListener('change',()=>changes++);
 motion.setEnabled(false);
 assert.equal(motion.matches,true,'Visitors can pause the current page');
 motion.setEnabled(true);
 assert.equal(motion.matches,false,'Visitors can resume the current page');
 assert.equal(changes,2,'Controls and renderer are notified of both changes');
 changePreference(!reduced);
 assert.equal(motion.matches,false,'Changing the OS preference does not stop the projects');
 motion.setEnabled(false);restore();
 assert.equal(motion.matches,false,'Returning from history starts moving again');
}
const optOut=visit({search:'?motion=off'});
assert.equal(optOut.motion.matches,true,'An explicit URL opt-out remains available');
optOut.motion.setEnabled(true);optOut.restore();
assert.equal(optOut.motion.matches,true,'Restoring an explicit opt-out preserves that URL');
assert.equal(visit({reduced:true,search:'?motion=on'}).motion.matches,false,'motion=on still works');
console.log('PASS: project motion on by default for every visit, reload, history return and OS preference; manual pause and ?motion=off.');

// Decorative backgrounds have an independent, accessible pause control.
const ambientSource=await readFile(new URL('../public/ambient-motion.js',import.meta.url),'utf8');
function ambientVisit({reduced=false,search=''}={}){
 const classes=new Set(),events=new Map(),preference=new EventTarget();preference.matches=reduced;
 const control={dataset:{pause:'Pause background',resume:'Animate background'},addEventListener:(_,fn)=>{control.click=fn;}};
 const root={classList:{toggle:(name,on)=>on?classes.add(name):classes.delete(name)}};
 const doc={documentElement:root,hidden:false,querySelectorAll:()=>[{classList:{add(){}}}],querySelector:()=>control,addEventListener:(name,fn)=>events.set(name,fn)};
 runInNewContext(ambientSource,{document:doc,window:{},location:{search},URLSearchParams,matchMedia:()=>preference,addEventListener:(name,fn)=>events.set(name,fn)});
 return {classes,control,preference,doc,events};
}
const ambient=ambientVisit();
assert(ambient.classes.has('ambient-enabled'));
ambient.control.click();assert(!ambient.classes.has('ambient-enabled'));assert.equal(ambient.control.textContent,'Animate background');
ambient.control.click();assert(ambient.classes.has('ambient-enabled'));
ambient.doc.hidden=true;ambient.events.get('visibilitychange')();assert(!ambient.classes.has('ambient-enabled'));
ambient.doc.hidden=false;ambient.events.get('visibilitychange')();assert(ambient.classes.has('ambient-enabled'));
ambient.preference.matches=true;ambient.preference.dispatchEvent(new Event('change'));
assert(!ambient.classes.has('ambient-enabled'));assert(ambient.control.hidden);
assert(!ambientVisit({reduced:true}).classes.has('ambient-enabled'));
assert(!ambientVisit({search:'?motion=off'}).classes.has('ambient-enabled'));
console.log('PASS: background pause/resume, hidden-tab suspension, reduced motion, and explicit motion opt-out.');

// Pointer forces and time-based drift stay within the hero at mobile/desktop sizes.
for(const [width,height] of [[320,560],[768,470],[1600,420]])for(const time of [0,1,30,1000]){
 for(const point of [{u:0,v:0,phase:0},{u:.4,v:.5,phase:2},{u:1,v:1,phase:5}]){
  const result=networkPoint(point,time,width,height,{active:true,x:width*.4,y:height*.5});
  assert(Number.isFinite(result.x)&&Number.isFinite(result.y));
  assert(result.x>=3&&result.x<=width-3&&result.y>=3&&result.y<=height-3);
 }
}
const seed={u:.4,v:.5,phase:0};
const still=networkPoint(seed,0,1000,500,{active:false});
const nearby=networkPoint(seed,0,1000,500,{active:true,x:380,y:260});
assert(Math.hypot(nearby.x-still.x,nearby.y-still.y)>10,'The cursor visibly displaces nearby points');
assert.deepEqual(networkPoint(seed,0,1000,500,{active:true,x:-1000,y:-1000}),still,'Distant pointers have no effect');
console.log('PASS: interactive hero particles react to nearby pointers and remain inside the canvas.');
