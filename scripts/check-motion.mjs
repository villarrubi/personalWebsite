import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
import {pointerInfluence,codeSnippets,codeFrame,codeLayout} from '../public/hero-effects.js';

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
function ambientVisit({reduced=false,search='',standaloneHero=false}={}){
 const classes=new Set(),events=new Map(),preference=new EventTarget();preference.matches=reduced;
 const control={dataset:{pause:'Pause background',resume:'Animate background'},addEventListener:(_,fn)=>{control.click=fn;}};
 const root={classList:{toggle:(name,on)=>on?classes.add(name):classes.delete(name)}};
 const doc={documentElement:root,hidden:false,querySelectorAll:()=>standaloneHero?[]:[{classList:{add(){}}}],querySelector:()=>control,addEventListener:(name,fn)=>events.set(name,fn)};
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
assert(ambient.classes.has('ambient-enabled'));assert(!ambient.control.hidden);
assert(ambientVisit({reduced:true}).classes.has('ambient-enabled'),'The header remains animated with either OS motion preference');
assert(!ambientVisit({search:'?motion=off'}).classes.has('ambient-enabled'));
const standalone=ambientVisit({reduced:true,standaloneHero:true});
assert(standalone.classes.has('ambient-enabled'),'Header animation does not depend on decorative fields in other sections');
standalone.control.click();assert(!standalone.classes.has('ambient-enabled'));assert(!standalone.control.hidden);
standalone.control.click();assert(standalone.classes.has('ambient-enabled'));

console.log('PASS: background pause/resume, hidden-tab suspension, visible controls with either OS preference, and explicit motion opt-out.');

// The code background reacts locally to the pointer.
assert.equal(pointerInfluence(100,100,{active:false,x:100,y:100}),0);
assert.equal(pointerInfluence(100,100,{active:true,x:100,y:100}),1);
assert.equal(pointerInfluence(500,500,{active:true,x:100,y:100}),0);
assert.equal(pointerInfluence(100,100,{active:true,x:100,y:100,strength:.5}),.5);
console.log('PASS: local pointer response.');

for(let index=0;index<8;index++){
 const seen=new Set(Array.from({length:32},(_,cycle)=>codeFrame(cycle*7,index).snippet));
 assert.equal(seen.size,codeSnippets.length,'Every row rotates through the full repertoire');
}
for(let time=0;time<230;time+=.25){
 const frames=Array.from({length:8},(_,index)=>codeFrame(time,index));
 assert.equal(new Set(frames.map(frame=>frame.snippet)).size,8,'Visible rows do not repeat snippets');
 assert(frames.every(frame=>frame.snippet.startsWith(frame.text)));
}
assert.equal(codeFrame(0,0).text,'');
assert.equal(codeFrame(3.5,0).text,codeSnippets[0]);
assert.equal(codeFrame(6.9,0).text,'','Erase the previous snippet before replacing it');
assert.notEqual(codeFrame(7,0).snippet,codeFrame(0,0).snippet);
console.log('PASS: varied code cycles, distinct rows, and typing/erasing transitions.');

for(const [width,height,count] of [[320,540,14],[390,540,14],[1000,500,24],[1440,500,30]]){
 const layout=codeLayout(width,height);
 assert.equal(layout.length,count);
 assert.deepEqual(layout,codeLayout(width,height),'Resizing does not randomly reshuffle the field');
 assert(layout.every(item=>item.x>=16&&item.x+item.blockWidth<=width-16&&item.y>0&&item.y+item.blockHeight<height),'Blocks fit mobile and desktop bounds');
 assert(new Set(layout.map(item=>Math.round(item.x))).size>count*.8,'Fragments are not locked to columns');
 assert(new Set(layout.map(item=>item.speed)).size===count,'Typing clocks have independent rhythms');
 assert(layout.some(item=>item.x+item.blockWidth/2>width*.35&&item.x+item.blockWidth/2<width*.65),'Code also occupies the area behind the name');
}
console.log('PASS: scattered responsive code field, central coverage and independent typing clocks.');

// The code field renders on load even when motion is paused.
const effectSource=(await readFile(new URL('../public/hero-effects.js',import.meta.url),'utf8')).replaceAll('export ','');
const calls=[];
const context2d=new Proxy({}, {get:(_,name)=>name==='measureText'?text=>({width:text.length*8}):name.startsWith('create')?()=>({addColorStop(){}}):(...args)=>calls.push([name,...args]),set:()=>true});
const hero={getBoundingClientRect:()=>({width:1000,height:500,left:0,top:0}),addEventListener(){}};
const canvas={getContext:()=>context2d,closest:()=>hero};
runInNewContext(effectSource,{
 document:{querySelector:()=>canvas,documentElement:{classList:{contains:()=>false}},hidden:false,addEventListener(){}},
 window:{},devicePixelRatio:1,MutationObserver:class{observe(){}},addEventListener(){},cancelAnimationFrame(){},
});
assert(calls.some(call=>call[0]==='fillText'&&call[1].length>0),'Code background renders immediately without a selector');
assert(calls.filter(call=>call[0]==='fillText').every(call=>Number.isFinite(call[2])&&Number.isFinite(call[3])),'All code tokens have valid drawing positions');
console.log('PASS: code background renders on load, including while motion is paused.');
