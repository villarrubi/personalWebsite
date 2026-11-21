export function initSkills(root){
 const choices=[...root.querySelectorAll('[data-skill]')];
 const panels=[...root.querySelectorAll('.skill-insight')];
 const selector=root.querySelector('.skill-selector');
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 const motionOff=new URLSearchParams(location.search).get('motion')==='off';
 let active=-1,animations=[],entered=false;
 const canMove=()=>!preference.matches&&!motionOff;
 function cancel(){animations.forEach(animation=>animation.cancel());animations=[];}
 function animate(element,frames,options){
  const animation=element.animate?.(frames,options);
  if(animation){animations.push(animation);animation.onfinish=()=>{animations=animations.filter(item=>item!==animation);};}
 }
 function enter(){
  if(entered)return;
  entered=true;
  if(!canMove())return;
  choices.forEach((choice,index)=>animate(choice,[{opacity:0,transform:'translateY(24px) scale(.94)'},{opacity:1,transform:'none'}],{duration:750,delay:index*90,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'}));
 }
 function select(index,motion=true){
  if(index===active)return;
  cancel();if(motion)entered=true;
  active=index;
  choices.forEach((choice,i)=>choice.setAttribute('aria-expanded',String(i===index)));
  panels.forEach((panel,i)=>panel.hidden=i!==index);
  if(motion&&index>=0&&canMove())animate(panels[index],[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],{duration:320,easing:'ease-out'});
 }
 choices.forEach((choice,index)=>{
  choice.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch')select(index);});
  choice.addEventListener('focus',()=>select(index));
  choice.addEventListener('click',()=>select(index));
  choice.addEventListener('keydown',event=>{
   if(event.altKey||event.ctrlKey||event.metaKey)return;
   const target=event.key==='Home'?0:event.key==='End'?choices.length-1:['ArrowRight','ArrowDown'].includes(event.key)?(index+1)%choices.length:['ArrowLeft','ArrowUp'].includes(event.key)?(index+choices.length-1)%choices.length:null;
   if(target!==null){event.preventDefault();choices[target].focus();}
  });
 });
 root.addEventListener('keydown',event=>{if(event.key==='Escape'){cancel();select(0);}});
 root.classList.add('skills-ready');
 root.classList.toggle('skills-static',!canMove());
 root.querySelectorAll('[data-skills-ui]').forEach(element=>element.hidden=false);
 select(0,false);
 preference.addEventListener('change',()=>{cancel();root.classList.toggle('skills-static',!canMove());});
 if(typeof IntersectionObserver!=='undefined'){
  const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){enter();observer.disconnect();}},{threshold:.25});
  observer.observe(selector);
 }
}
if(typeof document!=='undefined')document.querySelectorAll('.skill-explorer').forEach(initSkills);
