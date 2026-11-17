// Use the block's natural top, not its translated rect, to avoid feedback jitter.
export function revealFrame(top,height,remaining=Infinity){
 const progress=Math.max(0,Math.min(1,Math.max((height*.94-top)/(height*.38),1-Math.max(0,remaining)/(height*.38))));
 const eased=progress*progress*(3-2*progress);
 return {offset:72*(1-eased),opacity:.12+.88*eased};
}

if(typeof document!=='undefined'){
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 const motionOff=new URLSearchParams(location.search).get('motion')==='off';
 const blocks=[...document.querySelectorAll('.project-card,.about-layout,.section-heading,.career-heading,.career-entry,.about-note,.about-tools,.contact-compact>.container')].map(element=>({element,offset:0}));
 let frame=0;
 function reset(block){
  block.element.classList.remove('scroll-reveal');
  block.element.style.removeProperty('--reveal-y');
  block.element.style.removeProperty('--reveal-opacity');
  block.offset=0;
 }
 function render(){
  frame=0;
  if(motionOff||preference.matches){blocks.forEach(reset);return;}
  // Read all rects before writing styles; the background never moves.
  const remaining=document.documentElement.scrollHeight-innerHeight-scrollY;
  const states=blocks.map(block=>{
   const {element,offset}=block;
   if(element.hidden||element.matches('.career-deck .career-entry'))return null;
   if(element.contains(document.activeElement))return {offset:0,opacity:1};
   return revealFrame(element.getBoundingClientRect().top-offset,innerHeight,remaining);
  });
  blocks.forEach((block,index)=>{
   const state=states[index];
   if(!state){reset(block);return;}
   block.element.classList.add('scroll-reveal');
   block.element.style.setProperty('--reveal-y',`${state.offset}px`);
   block.element.style.setProperty('--reveal-opacity',String(state.opacity));
   block.offset=state.offset;
  });
 }
 function schedule(){if(!frame&&!document.hidden)frame=requestAnimationFrame(render);}
 for(const event of ['scroll','resize','pageshow'])addEventListener(event,schedule,{passive:true});
 document.addEventListener('focusin',schedule);
 document.addEventListener('focusout',schedule);
 document.addEventListener('toggle',schedule,true);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else schedule();});
 preference.addEventListener('change',()=>{blocks.forEach(reset);schedule();});
 document.fonts?.ready.then(schedule);
 render();
}
