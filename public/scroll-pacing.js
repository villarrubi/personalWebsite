// Gentler wheel/trackpad travel. Touch, keyboard and nested scrollers stay native.
export function pacedWheelDelta(delta,mode,height){
 const pixels=delta*(mode===1?16:mode===2?height:1);
 return Math.sign(pixels)*Math.min(Math.abs(pixels)*.5,height*.8);
}

if(typeof document!=='undefined'){
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 const disabled=new URLSearchParams(location.search).get('motion')==='off';
 let frame=0,target=0,lastTime=0,direction=0;
 const maxScroll=()=>Math.max(0,document.documentElement.scrollHeight-innerHeight);
 function stop(){cancelAnimationFrame(frame);frame=0;lastTime=0;direction=0;}
 function tick(time){
  const elapsed=lastTime?Math.min(64,time-lastTime):16;
  lastTime=time;
  target=Math.max(0,Math.min(maxScroll(),target));
  const remaining=target-scrollY;
  if(Math.abs(remaining)<.75){scrollTo({top:target,behavior:'instant'});stop();return;}
  const distance=Math.sign(remaining)*Math.max(1,Math.abs(remaining)*(1-Math.exp(-elapsed/85)));
  scrollTo({top:scrollY+distance,behavior:'instant'});
  frame=requestAnimationFrame(tick);
 }
 function nativeScroller(event,delta){
  for(const node of event.composedPath()){
   if(!(node instanceof Element)||node===document.body||node===document.documentElement)continue;
   if(node.matches('input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="slider"]'))return true;
   if(node.scrollHeight<=node.clientHeight+1)continue;
   if(!/(auto|scroll|overlay)/.test(getComputedStyle(node).overflowY))continue;
   const canScroll=delta<0?node.scrollTop>0:node.scrollTop+node.clientHeight<node.scrollHeight-1;
   if(canScroll||/contain|none/.test(getComputedStyle(node).overscrollBehaviorY))return true;
  }
  return false;
 }
 addEventListener('wheel',event=>{
  if(disabled||preference.matches||event.defaultPrevented||!event.cancelable||event.ctrlKey||event.metaKey||event.shiftKey||Math.abs(event.deltaX)>Math.abs(event.deltaY))return;
  const delta=pacedWheelDelta(event.deltaY,event.deltaMode,innerHeight);
  if(!delta)return;
  if(nativeScroller(event,delta)){stop();return;}
  const nextDirection=Math.sign(delta);
  const origin=!frame||nextDirection!==direction?scrollY:target;
  const next=Math.max(0,Math.min(maxScroll(),origin+delta));
  if(!frame&&Math.abs(next-scrollY)<.75)return;
  event.preventDefault();
  target=next;direction=nextDirection;
  if(!frame)frame=requestAnimationFrame(tick);
 },{passive:false});
 // Cancel pending travel before anchor clicks, scrollbar drags or other input.
 for(const name of ['pointerdown','touchstart','keydown','pagehide','resize'])addEventListener(name,stop,{passive:true});
 preference.addEventListener('change',stop);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
}
