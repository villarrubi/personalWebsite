// Native scrolling selects a single visible card; the list remains the fallback.
export function activeCardIndex(offsets, progress) {
 if (!offsets.length || !Number.isFinite(progress)) return 0;
 let index=0;
 while(index+1<offsets.length && progress>=offsets[index+1])index++;
 return index;
}

export function canStackCards({heights,top,viewportHeight,reducedMotion}) {
 return heights.length>1&&!reducedMotion&&heights.every(height=>height>0&&height+top+24<viewportHeight);
}

const timeline=typeof document!=='undefined' ? document.querySelector('.career-timeline') : null;
if(timeline){
 const cards=[...timeline.children];
 const section=timeline.closest('.career-section');
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 let frame=0,visible=true,enabled=false,pinTop=100,offsets=[],active=-1;
 function select(index){
  if(index===active)return;
  cards.forEach((card,i)=>card.classList.toggle('is-active',i===index));
  active=index;
 }
 function paint(){
  frame=0;
  if(!enabled||!visible||document.hidden)return;
  // Use natural row positions, independent of their sticky rendered positions.
  const index=activeCardIndex(offsets,pinTop-timeline.getBoundingClientRect().top);
  if(index!==active && cards[active]?.contains(document.activeElement))document.activeElement.blur();
  select(index);
 }
 function schedule(){if(enabled&&visible&&!document.hidden&&!frame)frame=requestAnimationFrame(paint);}
 function measure(){
  pinTop=(document.querySelector('.site-header')?.offsetHeight||70)+14;
  timeline.style.setProperty('--stack-top',`${pinTop}px`);
  // Removing the enhancement briefly gives the true flow offsets, even on resize.
  timeline.classList.remove('career-stacked');
  offsets=cards.map(card=>card.offsetTop);
  enabled=canStackCards({heights:cards.map(card=>card.offsetHeight),top:pinTop,viewportHeight:innerHeight,reducedMotion:preference.matches});
  if(enabled){
   select(activeCardIndex(offsets,pinTop-timeline.getBoundingClientRect().top));
   timeline.classList.add('career-stacked');
  }else{
   cancelAnimationFrame(frame);frame=0;
   cards.forEach(card=>card.classList.remove('is-active'));active=-1;
  }
  section.classList.toggle('has-card-stack',enabled);
 }
 addEventListener('scroll',schedule,{passive:true});
 addEventListener('resize',measure,{passive:true});
 addEventListener('pageshow',measure);
 preference.addEventListener('change',measure);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else measure();});
 timeline.addEventListener('toggle',measure,true);
 timeline.addEventListener('focusin',event=>{
  if(!enabled)return;
  const index=cards.findIndex(card=>card.contains(event.target));
  if(index<0 || index===active)return;
  // Keyboard focus reveals the requested card without exposing its neighbours.
  select(index);
  scrollTo({top:scrollY+timeline.getBoundingClientRect().top+offsets[index]-pinTop,behavior:'instant'});
 });
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
