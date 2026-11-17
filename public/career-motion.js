// Passive scroll enhancement: native document scrolling, with a readable list fallback.
export function cardCover(nextTop, pinnedTop, height) {
 if (![nextTop,pinnedTop,height].every(Number.isFinite) || height <= 0) return 0;
 return Math.min(1,Math.max(0,1-(nextTop-pinnedTop)/height));
}

export function canStackCards({heights,top,gap,viewportHeight,reducedMotion,focused,expanded}) {
 return heights.length>1&&!reducedMotion&&!focused&&!expanded&&
  heights.every((height,index)=>height>0&&height+top+gap*index+24<viewportHeight);
}

const timeline=typeof document!=='undefined' ? document.querySelector('.career-timeline') : null;
if(timeline){
 const cards=[...timeline.children];
 const section=timeline.closest('.career-section');
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 let frame=0,visible=true,enabled=false,pinTop=100,gap=7;
 const reset=()=>cards.forEach(card=>card.style.removeProperty('--card-cover'));
 function paint(){
  frame=0;
  if(!enabled||!visible||document.hidden)return;
  const positions=cards.map(card=>card.getBoundingClientRect().top);
  cards.forEach((card,index)=>{
   const cover=index===cards.length-1?0:cardCover(positions[index+1],pinTop+gap*(index+1),card.offsetHeight);
   card.style.setProperty('--card-cover',cover.toFixed(3));
  });
 }
 function schedule(){if(enabled&&visible&&!document.hidden&&!frame)frame=requestAnimationFrame(paint);}
 function measure(){
  pinTop=(document.querySelector('.site-header')?.offsetHeight||70)+14;
  gap=innerWidth<=600?5:7;
  timeline.style.setProperty('--stack-top',`${pinTop}px`);
  timeline.style.setProperty('--stack-gap',`${gap}px`);
  const focused=timeline.contains(document.activeElement);
  enabled=canStackCards({heights:cards.map(card=>card.offsetHeight),top:pinTop,gap,viewportHeight:innerHeight,
   reducedMotion:preference.matches,focused,expanded:!!timeline.querySelector('details[open]')});
  timeline.classList.toggle('career-stacked',enabled);
  section.classList.toggle('has-card-stack',enabled);
  if(!enabled){cancelAnimationFrame(frame);frame=0;reset();}
  else schedule();
 }
 addEventListener('scroll',schedule,{passive:true});
 addEventListener('resize',measure,{passive:true});
 addEventListener('pageshow',measure);
 preference.addEventListener('change',measure);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else measure();});
 timeline.addEventListener('toggle',measure,true);
 timeline.addEventListener('focusin',event=>{
  measure();
  // Unstack before reading a focused disclosure, including keyboard navigation.
  event.target.scrollIntoView({block:'nearest',behavior:'instant'});
 });
 timeline.addEventListener('focusout',()=>queueMicrotask(measure));
 if('IntersectionObserver'in window){
  new IntersectionObserver(entries=>{
   visible=entries[0].isIntersecting;
   if(visible)schedule();else{cancelAnimationFrame(frame);frame=0;}
  },{rootMargin:'100px'}).observe(timeline);
 }
 if('ResizeObserver'in window){
  const observer=new ResizeObserver(measure);
  cards.forEach(card=>observer.observe(card));
 }
 document.fonts?.ready.then(measure);
 measure();
}
