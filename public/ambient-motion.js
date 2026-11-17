// Only animate visible decorative layers; no rendering loop or external assets.
const backgrounds=[...document.querySelectorAll('.ambient-field')];
if(backgrounds.length){
 const root=document.documentElement;
 const button=document.querySelector('[data-ambient-toggle]');
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 let paused=new URLSearchParams(location.search).get('motion')==='off';
 function sync(){
  root.classList.toggle('ambient-enabled',!paused&&!preference.matches&&!document.hidden);
  if(button){
   button.hidden=preference.matches;
   button.textContent=paused?button.dataset.resume:button.dataset.pause;
  }
 }
 button?.addEventListener('click',()=>{paused=!paused;sync();});
 preference.addEventListener('change',sync);
 document.addEventListener('visibilitychange',sync);
 addEventListener('pageshow',sync);
 if('IntersectionObserver'in window){
  const observer=new IntersectionObserver(entries=>{
   for(const entry of entries)entry.target.classList.toggle('ambient-in-view',entry.isIntersecting);
  });
  backgrounds.forEach(background=>observer.observe(background));
 }else backgrounds.forEach(background=>background.classList.add('ambient-in-view'));
 sync();
}
