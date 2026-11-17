import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';

const source=(await readFile(new URL('../public/scroll-pacing.js',import.meta.url),'utf8')).replace('export function','function');
function visit({reduced=false,search=''}={}){
 const events=new Map(),frames=new Map(),preference=new EventTarget();
 preference.matches=reduced;
 class Element{matches(){return false;}}
 const doc={documentElement:{scrollHeight:4000},body:{},hidden:false,addEventListener:(type,fn)=>events.set(type,fn)};
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
console.log('PASS: slower wheel travel, reverse/cancel, finite settling, nested scroll, native gestures, boundaries and reduced motion.');
