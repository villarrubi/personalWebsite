// An explicit timeline: scrolling always belongs to the page.
export function careerDestination(key,index,count){
 const last=count-1;
 return key==='ArrowRight'?Math.min(last,index+1):key==='ArrowLeft'?Math.max(0,index-1):key==='Home'?0:key==='End'?last:null;
}
export function initCareer(section){
 const timeline=section.querySelector('.career-timeline');
 const panels=[...timeline.children];
 const tabs=[...section.querySelectorAll('[data-career-step]')];
 if(!panels.length||panels.length!==tabs.length)return;
 const rail=section.querySelector('.career-steps');
 const previous=section.querySelector('[data-career-prev]');
 const next=section.querySelector('[data-career-next]');
 const counter=section.querySelector('[data-career-counter]');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const motionOff=new URLSearchParams(location.search).get('motion')==='off';
 const es=document.documentElement.lang==='es';
 const trace=section.querySelector('.career-trace');
 let active=-1,animations=[],revealed=false,observer;
 const canAnimate=()=>!reduced.matches&&!motionOff;
 function cancelAnimations(){animations.forEach(animation=>animation.cancel());animations=[];}
 function animateElement(element,keyframes,options={}){
  const animation=element?.animate?.(keyframes,{duration:560,easing:'cubic-bezier(.22,1,.36,1)',...options});
  if(animation){animations.push(animation);animation.onfinish=()=>{animations=animations.filter(item=>item!==animation);};}
 }
 function revealPanel(direction=1){
  const parts=panels[active].querySelectorAll('.career-date,.career-identity,.career-story,.career-detail');
  parts.forEach((part,index)=>animateElement(part,[
   {opacity:0,transform:`translate(${direction*(index?24:12)}px,${index?10:0}px)`},
   {opacity:1,transform:'translate(0,0)'},
  ],{delay:index*65,fill:'backwards'}));
 }
 function traceWidth(){return tabs[active].offsetLeft-tabs[0].offsetLeft;}
 function syncTrace(){if(trace)trace.style.width=`${traceWidth()}px`;}
 function choose(index,{focus=false,animate=true}={}){
  index=Math.max(0,Math.min(panels.length-1,index));
  const direction=index>=active?1:-1;
  const changed=index!==active;
  if(!changed){if(focus)tabs[index].focus({preventScroll:true});return;}
  const previousWidth=trace?.getBoundingClientRect().width||0;
  cancelAnimations();
  if(focus||panels[active]?.contains(document.activeElement))tabs[index].focus({preventScroll:true});
  panels.forEach((panel,i)=>{
   panel.hidden=i!==index;panel.inert=i!==index;
   panel.setAttribute('role','tabpanel');
   panel.setAttribute('aria-labelledby',tabs[i].id);
   panel.tabIndex=i===index?0:-1;
  });
  tabs.forEach((tab,i)=>{
   tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;
   tab.classList.toggle('is-past',i<index);
  });
  active=index;
  previous.disabled=index===0;next.disabled=index===panels.length-1;
  counter.textContent=`${String(index+1).padStart(2,'0')} / ${String(panels.length).padStart(2,'0')} · ${es?'Etapa':'Stage'} ${panels[index].querySelector('time').textContent}`;
  // Move only the horizontal rail on narrow screens, never the document.
  const tab=tabs[index],left=tab.offsetLeft,right=left+tab.offsetWidth;
  if(left<rail.scrollLeft)rail.scrollLeft=left;
  else if(right>rail.scrollLeft+rail.clientWidth)rail.scrollLeft=right-rail.clientWidth;
  syncTrace();
  if(animate){
   revealed=true;observer?.disconnect();
   if(canAnimate()){
    revealPanel(direction);
    animateElement(trace,[{width:`${previousWidth}px`},{width:`${traceWidth()}px`}]);
    animateElement(tabs[index].querySelector('.career-step-dot'),[
     {boxShadow:'0 0 0 0 #8bc9cf66'},
     {boxShadow:'0 0 0 12px #8bc9cf00'},
    ],{duration:700});
   }
  }
  document.dispatchEvent(new Event('career:layout'));
 }
 section.classList.add('career-browser');
 timeline.setAttribute('role','presentation');
 section.querySelectorAll('[data-career-ui]').forEach(element=>element.hidden=false);
 tabs.forEach((tab,index)=>tab.addEventListener('click',()=>choose(index)));
 rail.addEventListener('keydown',event=>{
  const index=tabs.indexOf(event.target);
  if(index<0||event.altKey||event.ctrlKey||event.metaKey)return;
  const target=careerDestination(event.key,index,tabs.length);
  if(target===null)return;
  event.preventDefault();choose(target,{focus:true});
 });
 previous.addEventListener('click',()=>choose(active-1));
 next.addEventListener('click',()=>choose(active+1));
 reduced.addEventListener('change',cancelAnimations);
 choose(0,{animate:false});
 // Reveal once when the reader reaches the timeline; never advance it on scroll.
 if(typeof IntersectionObserver!=='undefined'){
  observer=new IntersectionObserver(entries=>{
   if(revealed||!entries.some(entry=>entry.isIntersecting))return;
   revealed=true;observer.disconnect();
   if(!canAnimate())return;
   tabs.forEach((tab,index)=>animateElement(tab,[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{delay:index*45,fill:'backwards'}));
   revealPanel();
  },{threshold:.18});
  observer.observe(section.querySelector('.career-explorer'));
 }
 if(typeof ResizeObserver!=='undefined')new ResizeObserver(()=>{cancelAnimations();syncTrace();}).observe(rail);
}
if(typeof document!=='undefined'){
 const section=document.querySelector('.career-section');
 if(section)initCareer(section);
}
