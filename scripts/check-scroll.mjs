import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';

const source=(await readFile(new URL('../public/scroll-pacing.js',import.meta.url),'utf8')).replace('export function','function');
function visit({reduced=false,search=''}={}){
 const events=new Map(),frames=new Map(),preference=new EventTarget();
 preference.matches=reduced;
 class Element{matches(){return false;}}
 const classes=new Set();
 const doc={documentElement:{scrollHeight:4000,classList:{contains:name=>classes.has(name),add:name=>classes.add(name),remove:name=>classes.delete(name)}},body:{},hidden:false,addEventListener:(type,fn)=>events.set(type,fn)};
 let sequence=0,time=0;
 const context={document:doc,Element,URLSearchParams,location:{search},innerHeight:800,scrollY:200,
  matchMedia:()=>preference,getComputedStyle:node=>node.style,
  addEventListener:(type,fn)=>events.set(type,fn),
  requestAnimationFrame:fn=>{frames.set(++sequence,fn);return sequence;},cancelAnimationFrame:id=>frames.delete(id),
  // Integer scroll offsets must still settle rather than scheduling forever.
  scrollTo:({top})=>{context.scrollY=Math.round(Math.max(0,Math.min(3200,top)));},
 };
 runInNewContext(source,context);
 const wheel=(overrides={})=>{
  const event={deltaY:200,deltaX:0,deltaMode:0,cancelable:true,defaultPrevented:false,composedPath:()=>[],preventDefault(){this.defaultPrevented=true;},...overrides};
  events.get('wheel')(event);return event;
 };
 function flush(){let ticks=0;while(frames.size){assert(++ticks<200,'Wheel animation must stop');const batch=[...frames.values()];frames.clear();time+=16;batch.forEach(fn=>fn(time));}}
 return {context,events,frames,preference,Element,wheel,flush};
}
const page=visit();
assert(page.wheel().defaultPrevented);page.flush();assert.equal(page.context.scrollY,300,'Half the wheel distance');
page.wheel();page.wheel();page.flush();assert.equal(page.context.scrollY,500,'Repeated wheel input accumulates');
page.wheel();page.wheel({deltaY:-100});page.flush();assert.equal(page.context.scrollY,450,'Reversing discards queued forward travel');
page.wheel();page.events.get('pointerdown')();assert.equal(page.frames.size,0,'Anchor clicks and scrollbar drags cancel pending travel');
for(const options of [{ctrlKey:true},{metaKey:true},{shiftKey:true},{deltaX:300},{cancelable:false},{defaultPrevented:true}]){
 page.wheel(options);assert.equal(page.frames.size,0,'Native gestures are not intercepted');
}
const scroller=new page.Element();
Object.assign(scroller,{scrollHeight:1000,clientHeight:200,scrollTop:0,style:{overflowY:'auto',overscrollBehaviorY:'auto'}});
assert(!page.wheel({composedPath:()=>[scroller]}).defaultPrevented,'Nested scrollers keep their wheel input');
scroller.scrollTop=800;scroller.style.overscrollBehaviorY='contain';
assert(!page.wheel({composedPath:()=>[scroller]}).defaultPrevented,'Contained dialogs do not scroll the page at their edge');
page.context.scrollY=3200;assert(!page.wheel().defaultPrevented,'The bottom of the page never traps scrolling');
page.context.scrollY=0;assert(!page.wheel({deltaY:-100}).defaultPrevented,'The top of the page never traps scrolling');
const preference=visit();preference.wheel();preference.preference.matches=true;preference.preference.dispatchEvent(new Event('change'));
assert.equal(preference.frames.size,0);assert(!preference.wheel().defaultPrevented);
assert(!visit({reduced:true}).wheel().defaultPrevented);
assert(!visit({search:'?motion=off'}).wheel().defaultPrevented);
for(const lock of ['intro-pending','intro-playing'])for(const options of [{},{reduced:true},{search:'?motion=off'}]){
 const intro=visit(options),root=intro.context.document.documentElement;
 root.classList.add(lock);
 assert(intro.wheel().defaultPrevented,'The intro prevents wheel movement even when native motion is selected');
 assert.equal(intro.frames.size,0,'No programmatic scroll may bypass the intro lock');
 assert.equal(intro.context.scrollY,200);
 assert(!intro.wheel({ctrlKey:true}).defaultPrevented,'Browser zoom stays available');
 root.classList.remove(lock);
 intro.wheel();intro.flush();
 assert.equal(intro.context.scrollY,options.reduced||options.search?200:300,'Paced scrolling works normally after the intro');
}
const interrupted=visit();interrupted.wheel();
interrupted.context.document.documentElement.classList.add('intro-playing');interrupted.flush();
assert.equal(interrupted.context.scrollY,200,'Opening an intro cancels already queued wheel momentum');
assert.equal(interrupted.frames.size,0);
console.log('PASS: slower wheel travel, reverse/cancel, finite settling, nested scroll, native gestures, boundaries and reduced motion.');

// Entrances must stay in progress when the visitor pauses, then replay on return.
const revealSource=(await readFile(new URL('../public/scroll-reveal.js',import.meta.url),'utf8')).replace('export function','function');
const revealEvents=new Map(),revealFrames=new Map(),revealPreference=new EventTarget();
revealPreference.matches=false;
const values=new Map(),classes=new Set();
let naturalTop=750,focused=false,inDeck=false,sequence=0;
const block={hidden:false,
 classList:{add:name=>classes.add(name),remove:name=>classes.delete(name)},
 style:{setProperty:(key,value)=>values.set(key,value),removeProperty:key=>values.delete(key)},
 matches:()=>inDeck,contains:()=>focused,
 getBoundingClientRect:()=>({top:naturalTop+(parseFloat(values.get('--reveal-y'))||0)}),
};
const revealContext={URLSearchParams,location:{search:''},innerHeight:1000,scrollY:0,
 document:{hidden:false,documentElement:{scrollHeight:5000},activeElement:null,querySelectorAll:()=>[block],addEventListener:(name,fn)=>revealEvents.set(name,fn)},
 matchMedia:()=>revealPreference,addEventListener:(name,fn)=>revealEvents.set(name,fn),
 requestAnimationFrame:fn=>{revealFrames.set(++sequence,fn);return sequence;},cancelAnimationFrame:id=>revealFrames.delete(id),
};
runInNewContext(revealSource,revealContext);
function revealTick(event='scroll'){
 revealEvents.get(event)();const pending=[...revealFrames.values()];revealFrames.clear();pending.forEach(fn=>fn());
 assert.equal(revealFrames.size,0,'No animation loop while scroll is stationary');
}
const middle=Number(values.get('--reveal-opacity'));
assert(middle>.4&&middle<.8,'An already visible block still animates');
for(let i=0;i<20;i++)revealTick();
assert.equal(Number(values.get('--reveal-opacity')),middle,'Elapsed time and transformed rects do not finish or jitter the entrance');
naturalTop=500;revealTick();assert.equal(Number(values.get('--reveal-opacity')),1);
naturalTop=1100;revealTick();naturalTop=750;revealTick();assert.equal(Number(values.get('--reveal-opacity')),middle,'Revisiting a section replays its entrance');
focused=true;revealTick('focusin');assert.equal(Number(values.get('--reveal-opacity')),1,'Keyboard focus immediately reveals the block');
focused=false;revealTick('focusout');
inDeck=true;revealTick();assert(!classes.has('scroll-reveal'),'The card viewer owns its transforms');
inDeck=false;naturalTop=750;revealContext.scrollY=4000;revealTick();
assert.equal(Number(values.get('--reveal-opacity')),1,'Contact remains fully readable at the bottom even on tall screens');
revealPreference.matches=true;revealPreference.dispatchEvent(new Event('change'));
assert(!classes.has('scroll-reveal'));assert.equal(values.size,0,'Reduced motion restores unmodified content');
console.log('PASS: visible scroll-linked entrances, stable pause, re-entry, keyboard focus, card isolation and full visibility at page end.');
