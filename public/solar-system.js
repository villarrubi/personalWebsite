import {layoutPlanets} from './solar-layout.js';
import {sceneMotion} from './scene-motion.js';

const root=document.querySelector('.solar-system');
if(root){
 const es=document.documentElement.lang==='es';
 const motion=sceneMotion;
 const space=root.querySelector('.solar-space');
 const worlds=[...root.querySelectorAll('[data-map-world]')];
 const buttons=[...root.querySelectorAll('[data-map-group]')];
 const description=root.querySelector('.solar-description');
 const pages=root.querySelector('.solar-pages');
 const status=root.querySelector('.solar-status');
 const allNodes=[...root.querySelectorAll('[data-project]')];
 const indices={featured:0,side:0};
 let active=location.hash==='#complementary'?'side':'featured';
 let capacity=10,pageCount=1,visible=false,timer,arrivalTimer;
 const world=()=>worlds.find(item=>item.dataset.mapWorld===active);
 const groupName=()=>active==='featured'?(es?'Destacados':'Featured'):(es?'Complementarios':'Side projects');

 function schedule(){
  clearTimeout(timer);
  if(pageCount>1&&visible&&!motion.matches&&!document.hidden)timer=setTimeout(()=>{
   const busy=root.querySelector('.planet-node:hover,.planet-node:focus-visible')||pages.contains(document.activeElement)||document.documentElement.classList.contains('project-dialog-open');
   if(!busy){indices[active]=(indices[active]+1)%pageCount;draw(true,false);}
   else schedule();
  },16000);
 }
 function pageButtons(){
  pages.replaceChildren();pages.hidden=pageCount<=1;
  if(pageCount<=1)return;
  const chosen=new Set([0,pageCount-1]);
  for(let i=Math.max(0,indices[active]-2);i<=Math.min(pageCount-1,indices[active]+2);i++)chosen.add(i);
  for(const i of [...chosen].sort((a,b)=>a-b)){
   const button=document.createElement('button');button.type='button';button.dataset.solarPage=i;
   button.setAttribute('aria-label',es?`Constelación ${i+1} de ${pageCount}`:`Constellation ${i+1} of ${pageCount}`);
   button.setAttribute('aria-pressed',String(i===indices[active]));
   button.addEventListener('click',()=>{indices[active]=i;draw(true);pages.querySelector(`[data-solar-page="${i}"]`)?.focus({preventScroll:true});});
   pages.append(button);
  }
 }
 function draw(animate=false,announce=true){
  const width=space.clientWidth,height=space.clientHeight;
  if(width<1||height<1)return;
  const nodes=[...world().querySelectorAll('[data-project]')];
  capacity=width<600?4:width<1000?6:10;
  let arrangement,shown;
  while(capacity>0){
   pageCount=Math.max(1,Math.ceil(nodes.length/capacity));
   indices[active]=Math.min(indices[active],pageCount-1);
   shown=nodes.slice(indices[active]*capacity,(indices[active]+1)*capacity);
   try{arrangement=layoutPlanets(shown.map(n=>({id:n.dataset.project})),width,height,active==='featured');break;}
   catch{capacity--;}
  }
  allNodes.forEach(node=>node.hidden=!shown.includes(node));
  for(const [i,node] of shown.entries()){
   const p=arrangement[i];
   node._cinematicLayout={...p};
   node.style.setProperty('--planet-x',`${p.x}px`);
   node.style.setProperty('--planet-y',`${p.y}px`);
   node.style.setProperty('--planet-size',`${p.size}px`);
   node.style.setProperty('--planet-height',`${p.height}px`);
  }
  root.dataset.activeGroup=active;
  worlds.forEach(item=>item.hidden=item.dataset.mapWorld!==active);
  buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.mapGroup===active)));
  description.textContent=description.dataset[active==='featured'?'featuredCopy':'sideCopy'];
  root.dispatchEvent(new CustomEvent('solar:layout',{detail:{nodes:shown.map((node,i)=>({node,layout:arrangement[i]}))}}));
  world().classList.remove('is-arriving');clearTimeout(arrivalTimer);
  if(animate&&!motion.matches){void world().offsetWidth;world().classList.add('is-arriving');arrivalTimer=setTimeout(()=>world().classList.remove('is-arriving'),750);}
  pageButtons();
  if(announce)status.textContent=`${groupName()} · ${nodes.length} ${es?'proyectos':'projects'}${pageCount>1?` · ${indices[active]+1} / ${pageCount}`:''}`;
  schedule();
 }
 buttons.forEach(button=>button.addEventListener('click',()=>{active=button.dataset.mapGroup;draw(true);}));
 root.addEventListener('solar:restore-layout',()=>draw());
 root.addEventListener('focusin',schedule);
 root.addEventListener('focusout',schedule);
 root.addEventListener('pointerleave',schedule);
 document.addEventListener('visibilitychange',schedule);
 const motionButton=root.querySelector('.space-motion-toggle');
 function syncMotion(){const enabled=!motion.matches;root.dataset.motion=enabled?'on':'off';root.classList.toggle('scene-motion-on',enabled);motionButton?.setAttribute('aria-pressed',String(enabled));if(motionButton){motionButton.title=enabled?(es?'Pausar animación':'Pause animation'):(es?'Activar animación':'Enable animation');motionButton.querySelector('.motion-toggle-label').textContent=enabled?(es?'Pausar':'Pause motion'):(es?'Activar movimiento':'Enable motion');motionButton.querySelector('.motion-toggle-icon').textContent=enabled?'Ⅱ':'▷';}}
 motionButton?.addEventListener('click',()=>motion.setEnabled(motion.matches));
 motion.addEventListener('change',()=>{syncMotion();schedule();});
 syncMotion();
 window.addEventListener('hashchange',()=>{if(location.hash==='#complementary'){active='side';draw(true);}});
 if('ResizeObserver'in window)new ResizeObserver(()=>draw()).observe(space);else window.addEventListener('resize',()=>draw());
 if('IntersectionObserver'in window){
  new IntersectionObserver(entries=>{
   visible=entries.some(entry=>entry.isIntersecting);
   if(visible&&!root.dataset.cinematic){
    root.dataset.cinematic='loading';
    import('./orbital-scene.js').then(module=>module.mountCinematicSpace(root)).catch(error=>{root.dataset.cinematic='fallback';root.classList.remove('cinematic-ready','cinema-opening');console.warn('Cinematic space uses its static fallback:',error.message);});
   }
   root.classList.toggle('is-sleeping',!visible);schedule();
  },{threshold:.15}).observe(root);
 }else visible=true;
 draw();
}
