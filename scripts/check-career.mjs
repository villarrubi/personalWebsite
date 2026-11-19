import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
import {careerFrame,careerScrollStep,canUseViewer} from '../public/career-motion.js';

// Two adjacent pages overlap without a blank frame; one owns interaction.
assert.deepEqual([-1,0,.49,.5,1.49,1.5,6,100].map(value=>careerFrame(value,7).index),[0,0,0,1,1,2,6,6]);
assert.deepEqual([6,5.49,4.49,3.49,2.49,1.49,.49,0].map(value=>careerFrame(value,7).index),[6,5,4,3,2,1,0,0]);
for(let step=-100;step<=700;step++){
 const state=careerFrame(step/100,7);
 assert(Number.isInteger(state.index)&&state.index>=0&&state.index<7);
 assert(state.pages.length>=1&&state.pages.length<=2);
 assert(state.pages.every(page=>page.opacity===1),'Opaque cards keep overlapping text from showing through');
 assert(state.pages.some(page=>page.index===state.index),'The active page remains visible');
 assert(state.pages.every(page=>page.index>=0&&page.index<7&&Math.abs(page.offset)<=100&&page.scale>=.975&&page.scale<=1));
 if(state.pages.length===2){
  const [outgoing,incoming]=state.pages;
  assert(outgoing.offset<=0&&incoming.offset>=0);
  assert(outgoing.offset+outgoing.scale*100>=incoming.offset,'The incoming card covers the outgoing edge without a gap');
 }
 if(state.pages.length===2)assert.equal(state.pages[1].index,state.pages[0].index+1);
 assert(state.progress>=0&&state.progress<=1);
}
assert.equal(careerFrame(NaN,7).index,0);
assert.equal(careerFrame(4,1).index,0);
assert.equal(careerFrame(.2,7).pages.length,1,'Reading time before each transition');
assert.equal(careerFrame(.5,7).pages.length,2,'Outgoing and incoming cards overlap');
assert.equal(careerFrame(.8,7).pages.length,1,'Incoming card settles for reading');
for(const height of [320,600,900,1440])assert(careerScrollStep(height)>=460&&careerScrollStep(height)<=760);
assert(canUseViewer({height:520,availableHeight:700}));
assert(canUseViewer({height:520,availableHeight:520}));
assert(!canUseViewer({height:701,availableHeight:700}));
assert(!canUseViewer({height:520,availableHeight:700,motionOff:true}));
for(const lang of ['es','en']){
 const html=await readFile(new URL(`../dist/${lang}/index.html`,import.meta.url),'utf8');
 const section=html.split('<section id="career"')[1].split('</section>')[0];
 const rows=section.split('<li class="career-entry').slice(1);
 assert.deepEqual(rows.map(row=>row.match(/datetime="([^"]+)"/)[1]),['2018','2019','2021','2024','2025-04','2025-10','2026-07']);
 assert.equal((section.match(/class="career-page"/g)||[]).length,7);
 assert.equal((section.match(/<details /g)||[]).length,3);
 assert.equal((section.match(/data-career-step=/g)||[]).length,7);
 assert(section.includes('class="career-viewer"')&&section.includes('data-career-next-label'));
 assert(section.includes('class="career-controls" hidden'),'Controls do not appear without JavaScript');
 assert(!section.includes('inert')&&!section.includes('aria-hidden="true"><article'),'Content stays readable without enhancement');
}
console.log('PASS: overlapping reversible cards, reading pauses, slower scroll steps, responsive fallback, and seven bilingual navigation steps.');

// Reproduce a detail that outgrows the mobile viewer, then returns to it.
const source=(await readFile(new URL('../public/career-motion.js',import.meta.url),'utf8')).replaceAll('export ','');
function element(){
 const classes=new Set(),values=new Map(),events=new Map();
 return {hidden:false,inert:false,events,
  classList:{add:(...names)=>names.forEach(name=>classes.add(name)),remove:(...names)=>names.forEach(name=>classes.delete(name)),contains:name=>classes.has(name),toggle:(name,on)=>on?classes.add(name):classes.delete(name)},
  style:{setProperty:(key,value)=>values.set(key,value),removeProperty:key=>values.delete(key),getPropertyValue:key=>values.get(key)},
  setAttribute(){},removeAttribute(){},addEventListener:(type,fn)=>events.set(type,fn),
 };
}
const section=element(),timeline=element(),controls=element(),heading={offsetHeight:80};
const buttons=Array.from({length:7},element),next={...element(),firstChild:{textContent:''}};
const counter={},label={},events=new Map(),frames=new Map(),preference=new EventTarget();
preference.matches=false;
let sequence=0,expanded=false,listReflowShift=0;
let scrollBehavior;
const cards=Array.from({length:7},(_,index)=>({
 ...element(),querySelector:()=>({textContent:String(index)}),
 contains(node){return node===this;},
 blur(){doc.activeElement=null;},
 get offsetHeight(){return index===5&&expanded?600:300;},
 getBoundingClientRect(){
  const top=section.classList.contains('career-deck')?180:1500+150+index*312+listReflowShift-context.scrollY;
  return {top,bottom:top+this.offsetHeight};
 },
}));
timeline.children=cards;timeline.closest=()=>section;
section.querySelector=selector=>selector==='.career-controls'?controls:heading;
section.getBoundingClientRect=()=>({top:1500-context.scrollY});
controls.offsetHeight=100;controls.querySelectorAll=()=>buttons;
controls.querySelector=selector=>selector==='[data-career-counter]'?counter:selector==='[data-career-next-label]'?label:next;
const doc={hidden:false,activeElement:null,documentElement:{lang:'es'},querySelector:selector=>selector==='.career-timeline'?timeline:{offsetHeight:70},addEventListener:(type,fn)=>events.set(type,fn),dispatchEvent(){}};
const context={document:doc,window:{},innerHeight:844,innerWidth:390,scrollY:0,URLSearchParams,Event,location:{search:''},
 matchMedia:()=>preference,getComputedStyle:()=>({paddingTop:'28'}),
 addEventListener:(type,fn)=>events.set(type,fn),
 requestAnimationFrame:fn=>{frames.set(++sequence,fn);return sequence;},cancelAnimationFrame:id=>frames.delete(id),
 scrollTo:({top,behavior})=>{context.scrollY=top;scrollBehavior=behavior;},
};
function flush(){const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn());}
runInNewContext(source,context);
assert(section.classList.contains('career-deck'));
buttons[5].events.get('click')();events.get('scroll')();flush();
assert(cards[5].classList.contains('is-active'));
expanded=true;doc.activeElement=cards[5];timeline.events.get('toggle')();
assert(!section.classList.contains('career-deck'));
assert.equal(cards[5].getBoundingClientRect().top,180,'Expanding details keeps the current card on screen');
assert(cards.every(card=>!card.hidden&&!card.inert),'Every card is readable in the list');
expanded=false;timeline.events.get('toggle')();
assert(section.classList.contains('career-deck'));
assert(cards[5].classList.contains('is-active'),'Collapsing details restores the same stage');
context.innerHeight=390;events.get('resize')({type:'resize'});
assert(!section.classList.contains('career-deck'));
// Portrait reflow moves the focused card below the viewport before resize fires.
context.innerHeight=844;listReflowShift=900;events.get('resize')({type:'resize'});
assert(cards[5].classList.contains('is-active'),'Orientation restores the card visible before reflow');
listReflowShift=0;
preference.matches=true;preference.dispatchEvent(new Event('change'));
assert(section.classList.contains('career-deck'),'Reduced motion retains the viewer on desktop and tall mobile screens');
assert(cards[5].classList.contains('is-active'),'Reduced motion keeps the selected stage');
assert.equal(cards[5].getBoundingClientRect().top,180,'Reduced motion keeps the reading position');
buttons[4].events.get('click')();events.get('scroll')();flush();
assert.equal(scrollBehavior,'smooth','Stage buttons retain the sliding journey with reduced system motion');
const fourthPosition=context.scrollY;
for(const reduced of [false,true]){
 preference.matches=reduced;preference.dispatchEvent(new Event('change'));
 for(const progress of [0,.32,.5,.68,1,.68,.5,.32,0]){
  context.scrollY=fourthPosition+careerScrollStep(context.innerHeight)*progress;
  events.get('scroll')();flush();
  const visible=cards.filter(card=>!card.hidden);
  assert.equal(visible.length,progress>0&&progress<1?2:1,'Both OS preferences retain overlapping cards during the slide');
  assert(visible.every(card=>card.style.getPropertyValue('--page-opacity')==='1.000'),'Cards slide without fading their text');
  if(progress===.5){
   assert.equal(cards[4].style.getPropertyValue('--page-offset'),'-6.00%');
   assert.equal(cards[5].style.getPropertyValue('--page-offset'),'50.00%');
  }
 }
}
buttons[5].events.get('click')();events.get('scroll')();flush();
preference.matches=false;preference.dispatchEvent(new Event('change'));
assert(cards[5].classList.contains('is-active'));
// A summary can retain focus after scrolling away: resizing must not jump back.
doc.activeElement=cards[5];
context.innerHeight=390;events.get('resize')({type:'resize'});
context.scrollY=5000;
events.get('scroll')();
context.innerHeight=844;events.get('resize')({type:'resize'});
assert.equal(context.scrollY,5000,'Offscreen focus never pulls the visitor back into the cards');
console.log('PASS: detail expansion/collapse, orientation and motion preference anchoring, readable fallback and offscreen focus.');
