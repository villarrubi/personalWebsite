const controls=document.querySelector('.project-view-controls');
if(controls){
 const buttons=[...controls.querySelectorAll('[data-project-view]')];
 const cards=document.getElementById('project-cards');
 const orbits=document.getElementById('project-orbits');
 function select(view,remember=false){
  const orbital=view==='orbits';
  document.documentElement.dataset.projectView=view;
  cards.hidden=orbital;orbits.hidden=!orbital;
  buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.projectView===view)));
  if(remember)try{sessionStorage.setItem('project-view',view);}catch{}
 }
 controls.hidden=false;
 clearTimeout(window.projectViewWatchdog);
 // Both languages share the visitor's view choice. Cards remain usable without JS.
 let saved;try{saved=sessionStorage.getItem('project-view');}catch{}
 select(location.hash==='#archive'?'cards':saved==='orbits'||location.hash==='#complementary'?'orbits':'cards');
 buttons.forEach(button=>button.addEventListener('click',()=>select(button.dataset.projectView,true)));
 window.addEventListener('hashchange',()=>{
  if(location.hash==='#complementary'||location.hash==='#archive'){
   select(location.hash==='#complementary'?'orbits':'cards');
   document.querySelector(location.hash)?.scrollIntoView();
  }
 });
}
