// Opaque pages slide over one another without mixing two blocks of text.
export function careerFrame(progress,count) {
 const last=Math.max(0,count-1);
 const position=Math.min(last,Math.max(0,Number.isFinite(progress)?progress:0));
 const index=Math.min(last,Math.floor(position+.5));
 const lower=Math.floor(position),fraction=position-lower;
 const blend=Math.max(0,Math.min(1,(fraction-.12)/.76));
 const mix=blend*blend*(3-2*blend);
 const pages=lower===last||mix===0?[{index:lower,offset:0,scale:1,opacity:1,shade:0}]:mix===1?[{index:lower+1,offset:0,scale:1,opacity:1,shade:0}]:[
  {index:lower,offset:-8*mix,scale:1-.06*mix,opacity:1,shade:.22*mix},
  {index:lower+1,offset:100*(1-mix),scale:.96+.04*mix,opacity:1,shade:0},
 ];
 return {index,pages,progress:last?position/last:1,stepProgress:lower+mix};
}
// Follow wheel steps smoothly without changing native page scrolling. Large
// jumps catch up within one transition; the loop stops once the cards settle.
export function advanceCareerProgress(current,target,elapsed){
 if(!Number.isFinite(current))return target;
 const distance=target-current;
 if(Math.abs(distance)<.0005)return target;
 const origin=target-Math.sign(distance)*Math.min(Math.abs(distance),.75);
 return origin+(target-origin)*(1-Math.exp(-Math.max(0,Math.min(64,elapsed))/65));
}
export function careerScrollStep(height){return Math.max(460,Math.min(760,height*.8));}
export function canUseViewer({height,availableHeight,motionOff=false}) {
 return !motionOff&&height>0&&height<=availableHeight;
}

const timeline=typeof document!=='undefined'?document.querySelector('.career-timeline'):null;
if(timeline){
 const section=timeline.closest('.career-section');
 const cards=[...timeline.children];
 const controls=section.querySelector('.career-controls');
 const steps=[...controls.querySelectorAll('[data-career-step]')];
 const counter=controls.querySelector('[data-career-counter]');
 const nextLabel=controls.querySelector('[data-career-next-label]');
 const nextButton=controls.querySelector('[data-career-next]');
 const heading=section.querySelector('.career-heading');
 // Keep the requested card-sliding experience with either OS preference.
 // The explicit ?motion=off option still exposes the static list.
 const motionOff=new URLSearchParams(location.search).get('motion')==='off';
 section.classList.toggle('career-motion-off',motionOff);
 const es=document.documentElement.lang==='es';
 const titles=cards.map(card=>`${card.querySelector('time').textContent} · ${card.querySelector('h3').textContent}`);
 let enabled=false,active=-1,frame=0,visible=true,top=98,step=600,start=0,measuring=false;
 let readingAnchor=null;
 let renderedProgress=null,lastPaint=0;
 const clampIndex=index=>Math.max(0,Math.min(cards.length-1,index));
 function select(index){
  if(index===active)return;
  const previous=cards[active];
  if(previous?.contains(document.activeElement))document.activeElement.blur();
  cards.forEach((card,i)=>{card.inert=i!==index;card.setAttribute('aria-hidden',String(i!==index));card.classList.toggle('is-active',i===index);});
  steps.forEach((button,i)=>{if(i===index)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');});
  active=index;
  counter.textContent=`${String(index+1).padStart(2,'0')} / ${String(cards.length).padStart(2,'0')}`;
  const last=index===cards.length-1;
  nextLabel.textContent=last?(es?'Trayectoria completa · Sigue hacia Sobre mí':'Journey complete · Continue to About me'):`${es?'Después':'Up next'}: ${titles[index+1]}`;
  nextButton.firstChild.textContent=last?(es?'Sobre mí ':'About me '):(es?'Siguiente ':'Next ');
 }
 function paint(time=0){
  frame=0;
  if(!enabled||document.hidden)return;
  const target=Math.max(0,Math.min(cards.length-1,(scrollY-start)/step));
  renderedProgress=advanceCareerProgress(renderedProgress,target,lastPaint&&time?time-lastPaint:16);
  lastPaint=time;
  const state=careerFrame(renderedProgress,cards.length);
  select(state.index);
  cards.forEach((card,index)=>{
   const page=state.pages.find(page=>page.index===index);
   card.hidden=!page;
   if(!page)return;
   card.style.setProperty('--page-offset',`${page.offset.toFixed(2)}%`);
   card.style.setProperty('--page-scale',page.scale.toFixed(4));
   card.style.setProperty('--page-opacity',page.opacity.toFixed(3));
   card.style.setProperty('--page-shade',page.shade.toFixed(3));
  });
  steps.forEach((button,index)=>button.style.setProperty('--step-progress',Math.max(0,Math.min(1,state.stepProgress-index+1)).toFixed(4)));
  if(renderedProgress!==target&&visible)frame=requestAnimationFrame(paint);
  else lastPaint=0;
 }
 function readCard(){
  const inView=cards.map(card=>({card,rect:card.getBoundingClientRect()})).filter(({rect})=>rect.top<innerHeight&&rect.bottom>top);
  const entry=inView.find(({card})=>card.contains(document.activeElement))||inView.find(({rect})=>rect.top<innerHeight/2&&rect.bottom>innerHeight/2);
  return entry?{card:entry.card,top:entry.rect.top}:null;
 }
 function schedule(){
  if(!enabled)readingAnchor=readCard();
  if(enabled&&visible&&!document.hidden&&!frame){lastPaint=0;frame=requestAnimationFrame(paint);}
 }
 function measure(event){
  if(measuring)return;
  measuring=true;
  cancelAnimationFrame(frame);frame=0;renderedProgress=null;lastPaint=0;
  const wasEnabled=enabled;
  const oldProgress=wasEnabled?(scrollY-start)/step:0;
  const keepPosition=wasEnabled&&oldProgress>=0&&oldProgress<=cards.length-1;
  // Keep the reader on the same card when details or a resize change modes.
  // Resize events arrive after reflow, so use the last visible list card.
  const anchor=!wasEnabled?(event?.type==='resize'?readingAnchor:readCard()):null;
  const readingCard=keepPosition?cards[active]:anchor?.card;
  const readingTop=keepPosition?readingCard?.getBoundingClientRect().top:anchor?.top;
  section.classList.remove('career-deck');
  cards.forEach(card=>{card.hidden=false;card.inert=false;card.removeAttribute('aria-hidden');card.classList.remove('is-active');});
  controls.hidden=false;
  top=(document.querySelector('.site-header')?.offsetHeight||70)+12;
  step=careerScrollStep(innerHeight);
  const available=innerHeight-top-16;
  section.style.setProperty('--viewer-top',`${top}px`);
  section.style.setProperty('--viewer-height',`${available}px`);
  section.style.setProperty('--card-height','0px');
  section.classList.add('career-deck','is-measuring');
  const cardHeight=Math.max(...cards.map(card=>card.offsetHeight));
  const required=heading.offsetHeight+cardHeight+controls.offsetHeight+24;
  enabled=canUseViewer({height:required,availableHeight:available,motionOff});
  section.classList.remove('is-measuring');
  section.style.setProperty('--card-height',`${cardHeight}px`);
  section.style.setProperty('--career-travel',`${step*(cards.length-1)}px`);
  active=-1;
  if(enabled){
   section.classList.add('career-deck');
   // Use the section's natural position, not the already pinned viewer rect.
   start=scrollY+section.getBoundingClientRect().top+parseFloat(getComputedStyle(section).paddingTop)-top;
   if(keepPosition)scrollTo({top:start+oldProgress*step,behavior:'instant'});
   else if(readingCard)scrollTo({top:start+cards.indexOf(readingCard)*step,behavior:'instant'});
   select(careerFrame((scrollY-start)/step,cards.length).index);
   paint();
  }else{
   section.classList.remove('career-deck');
   controls.hidden=true;
   cancelAnimationFrame(frame);frame=0;
   cards.forEach(card=>{card.hidden=false;card.style.removeProperty('--page-offset');card.style.removeProperty('--page-scale');card.style.removeProperty('--page-opacity');card.style.removeProperty('--page-shade');});
   if(keepPosition&&readingCard){
    const anchorTop=Math.max(top,Math.min(readingTop,innerHeight-80));
    scrollTo({top:scrollY+readingCard.getBoundingClientRect().top-anchorTop,behavior:'instant'});
   }
  }
  measuring=false;
  document.dispatchEvent(new Event('career:layout'));
  readingAnchor=enabled?null:readCard();
 }
 function go(index){
  if(!enabled)return;
  scrollTo({top:start+clampIndex(index)*step,behavior:'smooth'});
 }
 steps.forEach((button,index)=>button.addEventListener('click',()=>go(index)));
 controls.addEventListener('keydown',event=>{
  const index=steps.indexOf(event.target);
  if(index<0)return;
  const target=event.key==='ArrowRight'?clampIndex(index+1):event.key==='ArrowLeft'?clampIndex(index-1):event.key==='Home'?0:event.key==='End'?cards.length-1:null;
  if(target===null)return;
  event.preventDefault();go(target);steps[target].focus({preventScroll:true});
 });
 nextButton.addEventListener('click',()=>{
  if(active===cards.length-1)document.querySelector('#about')?.scrollIntoView({behavior:'smooth',block:'start'});
  else go(active+1);
 });
 timeline.addEventListener('toggle',measure,true);
 addEventListener('scroll',schedule,{passive:true});
 addEventListener('resize',measure,{passive:true});
 addEventListener('pageshow',measure);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else measure();});
 if('IntersectionObserver'in window){
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)schedule();else{cancelAnimationFrame(frame);frame=0;renderedProgress=null;lastPaint=0;}},{rootMargin:'100px'}).observe(section);
 }
 // Detect upstream layout changes (for example font loading) without observing
 // card visibility changes and causing repeated measurement of the deck.
 if('ResizeObserver'in window){let width=innerWidth;new ResizeObserver(()=>{if(innerWidth!==width){width=innerWidth;measure();}}).observe(document.documentElement);}
 document.fonts?.ready.then(measure);
 measure();
}
