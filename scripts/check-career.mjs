import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
import {careerFrame,careerScrollStep,canUseViewer,advanceCareerProgress,careerCardLayout,careerPreviewLayout} from '../public/career-motion.js';

// Neighbouring chapters keep their order and never overlap while changing size.
assert.deepEqual([-1,0,.49,.5,1.49,1.5,6,100].map(value=>careerFrame(value,7).index),[0,0,0,1,1,2,6,6]);
assert.deepEqual([6,5.49,4.49,3.49,2.49,1.49,.49,0].map(value=>careerFrame(value,7).index),[6,5,4,3,2,1,0,0]);
for(const [height,peek,gap,slots] of [[200,144,16,2],[200,144,16,4],[200,128,16,6],[395,50,8,2],[300,0,8,0]]){
 for(let step=-100;step<=700;step++){
  const state=careerFrame(step/100,7);
  const pages=state.pages.map(page=>({...page,...careerCardLayout(page.distance,height,peek,gap,state.stepProgress,7,slots)})).filter(page=>page.visible);
  assert(Number.isInteger(state.index)&&state.index>=0&&state.index<7);
  assert(pages.some(page=>page.index===state.index),'The current chapter remains visible');
  assert(pages.every(page=>page.height>=Math.min(peek||height,height)&&page.height<=height));
  assert(pages.every(page=>page.content+page.preview>0),'Content must never disappear completely during a transition');
  for(let i=1;i<pages.length;i++){
   assert(pages[i].offset-pages[i].height/2>=pages[i-1].offset+pages[i-1].height/2-1e-8,'Neighbouring cards must never cover each other');
  }
  if(Number.isInteger(state.stepProgress)&&peek){
   assert.equal(pages.length,slots+1,'Every slot holds a real chapter, including at either end');
   assert.equal(pages.find(page=>page.index===state.index).height,height,'The selected card keeps its natural content height');
  }
  assert(state.progress>=0&&state.progress<=1);
 }
}

// Reproduce tall desktop whitespace while bounding every preview's height.
for(const [viewport,width,required,expected] of [[900,1440,443,2],[1258,2560,443,4],[1440,2560,443,6],[844,390,618,2],[720,1280,443,0]]){
 const available=viewport-(width<=760?82:96)-16;
 const previews=careerPreviewLayout(available,required,width,7);
 assert.equal(previews.slots,expected);
 assert(required+previews.slots*(previews.height+previews.gap)<=available,'Controls stay inside the viewport');
 if(viewport>=1258){
  assert(available-required-previews.slots*(previews.height+previews.gap)<90,'Tall screens must not retain hundreds of empty pixels');
  assert(previews.height<=144,'Fill the space with chapters, never oversized cards');
 }
}
assert.equal(careerFrame(NaN,7).index,0);
assert.equal(careerFrame(4,1).index,0);
assert.equal(careerFrame(.1,7).stepProgress,0,'Reading pause before moving');
assert.equal(careerFrame(.9,7).stepProgress,1,'Reading pause after moving');
let previous=careerCardLayout(1,200,144,16,2,7).offset;
for(let sample=1;sample<=100;sample++){
 const state=careerFrame(2+sample/100,7);
 const incoming=careerCardLayout(3-state.stepProgress,200,144,16,state.stepProgress,7).offset;
 assert(previous-incoming<4,'The incoming card moves continuously without a sudden jump');
 previous=incoming;
}
assert.equal(advanceCareerProgress(null,4,16),4,'Initial layout lands on the correct stage');
for(const hz of [30,60,120]){
 let progress=0,iterations=0;
 while(progress!==.6&&iterations++<hz){
  const next=advanceCareerProgress(progress,.6,1000/hz);
  assert(next>progress&&next<=.6,'Smoothing converges without overshooting');progress=next;
 }
 assert.equal(progress,.6,'Settles and stops requesting frames in under a second');
 assert(advanceCareerProgress(progress,.2,1000/hz)<progress,'Reversing scroll responds on the next frame');
}
assert(advanceCareerProgress(0,6,16)>5.25,'Large jumps never animate through the entire timeline');
for(const height of [320,600,900,1440])assert(careerScrollStep(height)>=320&&careerScrollStep(height)<=520);
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
console.log('PASS: reversible carousel, viewport-sized chapter previews, non-overlapping transitions, bounded scrolling, and bilingual navigation.');

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
let clock=0;
function flush(){let count=0;while(frames.size){assert(count++<120,'The render loop must settle');const pending=[...frames.values()];frames.clear();clock+=16;pending.forEach(fn=>fn(clock));}}
runInNewContext(source,context);
assert(section.classList.contains('career-deck'));
buttons[5].events.get('click')();events.get('scroll')();flush();
assert(cards[5].classList.contains('is-active'));
const beforeReflow=context.scrollY;
context.scrollY-=175;
events.get('resize')({type:'resize'});
assert.equal(context.scrollY,beforeReflow,'Upstream reflow during resize keeps the painted chapter, not an intermediate transition');
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
  assert(visible.length>=3&&visible.length<=4,'Both OS preferences keep the neighbouring previews');
  assert.equal(visible.filter(card=>!card.inert).length,1,'Only the current chapter accepts focus');
  if(progress===.5){
   assert(parseFloat(cards[4].style.getPropertyValue('--page-offset'))<0);
   assert(parseFloat(cards[5].style.getPropertyValue('--page-offset'))>0);
   assert.equal(cards[4].style.getPropertyValue('--page-scale'),cards[5].style.getPropertyValue('--page-scale'));
   assert.equal(buttons[5].style.getPropertyValue('--step-progress'),'0.5000','Year marker fills continuously with the cards');
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
