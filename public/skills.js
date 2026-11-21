export function initSkills(root){
 const choices=[...root.querySelectorAll('[data-skill]')];
 const panels=[...root.querySelectorAll('.skill-insight')];
 const selector=root.querySelector('.skill-selector');
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 const motionOff=new URLSearchParams(location.search).get('motion')==='off';
 const page=typeof document==='undefined'?null:document;
 let active=-1,animations=[],entered=false,inView=typeof IntersectionObserver==='undefined';
 const canPlay=()=>!motionOff&&inView&&!page?.hidden;
 function cancel(){animations.forEach(animation=>animation.cancel());animations=[];}
 function animate(element,frames,options){
  const animation=element.animate?.(frames,options);
  if(animation){animations.push(animation);animation.onfinish=()=>{animations=animations.filter(item=>item!==animation);};}
 }
 function playAmbient(){
  if(!canPlay()||active<0)return;
  const ambient=panels[active].querySelector('[data-skill-ambient]');
  if(ambient)animate(ambient,[{opacity:.18},{opacity:.38},{opacity:.18}],{duration:10000,iterations:Infinity,easing:'ease-in-out'});
 }

 function start(){
  cancel();
  if(!canPlay())return;
  if(!entered){
   entered=true;
   if(!preference.matches)animate(selector,[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'none'}],{duration:500,easing:'ease-out'});
  }
  playAmbient();
 }
 function select(index,motion=true){
  if(index===active)return;
  cancel();active=index;
  root.setAttribute('data-active-skill',String(index));
  choices.forEach((choice,i)=>choice.setAttribute('aria-expanded',String(i===index)));
  panels.forEach((panel,i)=>panel.hidden=i!==index);
  if(motion&&canPlay()){
   if(!preference.matches)animate(panels[index],[{opacity:.35},{opacity:1}],{duration:250,easing:'ease-out'});
   playAmbient();
  }
 }
 choices.forEach((choice,index)=>{
  choice.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch')select(index);});
  choice.addEventListener('focus',()=>select(index));
  choice.addEventListener('click',()=>select(index));
  choice.addEventListener('keydown',event=>{
   if(event.altKey||event.ctrlKey||event.metaKey)return;
   const target=event.key==='Home'?0:event.key==='End'?choices.length-1:['ArrowRight','ArrowDown'].includes(event.key)?(index+1)%choices.length:['ArrowLeft','ArrowUp'].includes(event.key)?(index+choices.length-1)%choices.length:null;
   if(target!==null){event.preventDefault();choices[target].focus({preventScroll:true});}
  });
 });
 root.addEventListener('keydown',event=>{if(event.key==='Escape')select(0);});
 root.classList.add('skills-ready');
 const updatePreference=()=>{root.classList.toggle('skills-static',preference.matches||motionOff);start();};
 root.classList.toggle('skills-static',preference.matches||motionOff);
 root.querySelectorAll('[data-skills-ui]').forEach(element=>element.hidden=false);
 select(0,false);
 preference.addEventListener('change',updatePreference);
 page?.addEventListener('visibilitychange',start);
 if(typeof IntersectionObserver!=='undefined'){
  const observer=new IntersectionObserver(entries=>{
   const visible=entries.some(entry=>entry.isIntersecting);
   if(visible===inView)return;
   inView=visible;start();
  },{threshold:.1});
  observer.observe(root.querySelector('.skills-workbench'));
 }else start();
}
if(typeof document!=='undefined')document.querySelectorAll('.skill-explorer').forEach(initSkills);
