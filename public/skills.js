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
 function playScene(){
  if(!canPlay()||active<0)return;
  const panel=panels[active],cycle={duration:4800,iterations:Infinity,easing:'ease-in-out'};
  panel.querySelectorAll('[data-scene-reveal]').forEach((element,i)=>animate(element,[{opacity:.2},{opacity:1,offset:.2},{opacity:1,offset:.85},{opacity:.2}],{...cycle,delay:i*160}));
  panel.querySelectorAll('[data-scene-trace]').forEach(element=>animate(element,[{strokeDasharray:'1',strokeDashoffset:'1'},{strokeDasharray:'1',strokeDashoffset:'0',offset:.45},{strokeDasharray:'1',strokeDashoffset:'0',offset:.9},{strokeDasharray:'1',strokeDashoffset:'1'}],cycle));
  if(!preference.matches)panel.querySelectorAll('[data-object-motion]').forEach((element,i)=>{
   const kind=element.getAttribute?.('data-object-motion');
   const dx=Number(element.getAttribute?.('data-dx')||0),dy=Number(element.getAttribute?.('data-dy')||0);
   const offset=`translate(${dx}px,${dy}px)`;
   const frames=kind==='orbit'?[{transform:'rotate(-7deg)'},{transform:'rotate(7deg)'},{transform:'rotate(-7deg)'}]:[{transform:offset},{transform:'translate(0,0)',offset:.4},{transform:'translate(0,0)',offset:.7},{transform:offset}];
   animate(element,frames,{duration:kind==='organize'||kind==='orbit'?11000:7000,iterations:Infinity,delay:kind==='organize'?0:i*180,easing:'ease-in-out'});
  });
 }
 function start(){
  cancel();
  if(!canPlay())return;
  if(!entered){
   entered=true;
   if(!preference.matches)animate(selector,[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'none'}],{duration:500,easing:'ease-out'});
  }
  playScene();
 }
 function select(index,motion=true){
  if(index===active)return;
  cancel();active=index;
  root.setAttribute('data-active-skill',String(index));
  choices.forEach((choice,i)=>choice.setAttribute('aria-expanded',String(i===index)));
  panels.forEach((panel,i)=>panel.hidden=i!==index);
  if(motion&&canPlay()){
   if(!preference.matches)animate(panels[index],[{opacity:.35},{opacity:1}],{duration:250,easing:'ease-out'});
   playScene();
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
