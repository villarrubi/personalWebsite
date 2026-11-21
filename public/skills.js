export function initSkills(root){
 const choices=[...root.querySelectorAll('[data-skill]')];
 const panels=[...root.querySelectorAll('.skill-insight')];
 const selector=root.querySelector('.skill-selector');
 const sceneButtons=[...root.querySelectorAll('[data-skill-motion]')];
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 const motionOff=new URLSearchParams(location.search).get('motion')==='off';
 let active=-1,animations=[],entered=false;
 const canMove=()=>!preference.matches&&!motionOff;
 function cancel(){animations.forEach(animation=>animation.cancel());animations=[];}
 function animate(element,frames,options){
  const animation=element.animate?.(frames,options);
  if(animation){animations.push(animation);animation.onfinish=()=>{animations=animations.filter(item=>item!==animation);};}
 }
 function playScene(index){
  if(motionOff||index<0)return;
  const panel=panels[index];
  panel.querySelectorAll('[data-scene-reveal]').forEach((element,i)=>animate(element,[{opacity:.12,transform:'translateY(5px)'},{opacity:1,transform:'none'}],{duration:650,delay:i*220,easing:'ease-out',fill:'backwards'}));
  panel.querySelectorAll('[data-scene-trace]').forEach(element=>animate(element,[{strokeDasharray:'1',strokeDashoffset:'1'},{strokeDasharray:'1',strokeDashoffset:'0'}],{duration:2200,easing:'ease-in-out'}));
  panel.querySelectorAll('[data-scene-cursor]').forEach(element=>animate(element,[{transform:'translate(-45px,12px)'},{transform:'translate(0,0)',offset:.65},{transform:'translate(0,0)'}],{duration:1800,easing:'ease-in-out'}));
 }
 function enter(){
  if(entered)return;
  entered=true;
  if(!canMove())return;
  animate(selector,[{opacity:0,transform:'translateY(18px) scale(.97)'},{opacity:1,transform:'none'}],{duration:650,easing:'cubic-bezier(.22,1,.36,1)'});
  playScene(active);
 }
 function select(index,motion=true){
  if(index===active)return;
  cancel();if(motion)entered=true;
  active=index;
  root.setAttribute('data-active-skill',String(index));
  choices.forEach((choice,i)=>choice.setAttribute('aria-expanded',String(i===index)));
  panels.forEach((panel,i)=>panel.hidden=i!==index);
  if(motion&&index>=0&&canMove()){
   animate(panels[index],[{opacity:.35},{opacity:1}],{duration:320,easing:'ease-out'});
   playScene(index);
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
 root.addEventListener('keydown',event=>{if(event.key==='Escape'){cancel();select(0);}});
 root.classList.add('skills-ready');
 root.classList.toggle('skills-static',!canMove());
 root.querySelectorAll('[data-skills-ui]').forEach(element=>element.hidden=false);
 sceneButtons.forEach((button,index)=>{
  button.hidden=motionOff;
  button.addEventListener('click',()=>{cancel();playScene(index);});
 });
 select(0,false);
 preference.addEventListener('change',()=>{cancel();root.classList.toggle('skills-static',!canMove());});
 if(typeof IntersectionObserver!=='undefined'){
  const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){enter();observer.disconnect();}},{threshold:.25});
  observer.observe(selector);
 }
}
if(typeof document!=='undefined')document.querySelectorAll('.skill-explorer').forEach(initSkills);
