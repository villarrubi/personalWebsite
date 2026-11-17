import {sceneMotion} from './scene-motion.js';
import {createOrbitFocus} from './solar-focus.js';
import {OrbitCarousel,carouselLayout,wrapIndex} from './solar-carousel.js';

const root=document.querySelector('.solar-system');
if(root){
 const es=document.documentElement.lang==='es',motion=sceneMotion;
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 const space=root.querySelector('.solar-space'),status=root.querySelector('.solar-status');
 const worlds=[...root.querySelectorAll('[data-map-world]')],buttons=[...root.querySelectorAll('[data-map-group]')];
 const description=root.querySelector('.solar-description'),focus=createOrbitFocus(root,motion);
 const controls=[...root.querySelectorAll('[data-carousel-step]')];
 const groups=Object.fromEntries(worlds.map(world=>[world.dataset.mapWorld,{world,nodes:[...world.querySelectorAll('[data-project]')],carousel:new OrbitCarousel(world.querySelectorAll('[data-project]').length)}]));
 let active=location.hash==='#complementary'?'side':'featured';
 let visible=!('IntersectionObserver'in window),frame=0,last=null;
 const current=()=>groups[active];
 const animate=()=>!preference.matches&&!motion.matches;
 const blocked=()=>document.hidden||!visible||document.documentElement.classList.contains('intro-playing')||document.documentElement.classList.contains('intro-pending')||document.documentElement.classList.contains('project-dialog-open');
 const autoAllowed=()=>!blocked()&&!motion.matches&&!root.contains(document.activeElement?.closest?.('.planet-node,.solar-preview'));
 function paint(announce=false){
  const {nodes,carousel}=current(),width=space.clientWidth,height=space.clientHeight;
  if(!width||!height)return;
  const layouts=carouselLayout(nodes.map(node=>({id:node.dataset.project})),width,height,carousel.position);
  const items=nodes.map((node,index)=>{
   const layout=layouts[index];node.hidden=!layout.visible;
   node.style.setProperty('--planet-x',`${layout.x}px`);node.style.setProperty('--planet-y',`${layout.y}px`);
   node.style.setProperty('--planet-size',`${layout.size}px`);node.style.setProperty('--planet-height',`${layout.height}px`);
   node.style.setProperty('--orbit-depth',String(layout.foreground));node.style.setProperty('--orbit-opacity',String(layout.opacity));
   node.style.zIndex=String(Math.round(layout.foreground*100));
   node.dataset.orbitFront=String(index===carousel.index);
   return {node,layout};
  });
  root._orbitFrame={width,height,items};
  root.dataset.orbitPosition=String(carousel.position);
  focus.update(nodes,carousel.index,animate());
  controls.forEach(button=>button.disabled=nodes.length<2);
  root.dispatchEvent(new Event('solar:frame'));
  const destination=wrapIndex(carousel.target,nodes.length);
  if(announce)status.textContent=nodes.length?`${nodes[destination].dataset.name} · ${destination+1} / ${nodes.length}`:(es?'No hay proyectos en este grupo.':'No projects in this group.');
 }
 function tick(now){
  frame=0;if(blocked()){last=null;return;}
  const delta=last===null?0:Math.min(now-last,100);last=now;
  const {carousel}=current();
  if(carousel.tick(delta,{auto:autoAllowed(),animate:animate()}))paint();
  if(carousel.moving||(autoAllowed()&&carousel.count>1))frame=requestAnimationFrame(tick);else last=null;
 }
 function sync(){
  cancelAnimationFrame(frame);frame=0;last=null;current().carousel.resetTimer();
  if(!blocked()&&(current().carousel.moving||(autoAllowed()&&current().nodes.length>1)))frame=requestAnimationFrame(tick);
 }
 function step(direction){current().carousel.step(direction,animate());paint(true);sync();}
 function selectGroup(group){
  if(!groups[group])return;
  current().carousel.settle();active=group;root.dataset.activeGroup=active;
  worlds.forEach(world=>world.hidden=world.dataset.mapWorld!==active);
  buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.mapGroup===active)));
  description.textContent=description.dataset[active==='featured'?'featuredCopy':'sideCopy'];
  paint();sync();
 }
 controls.forEach(button=>button.addEventListener('click',()=>step(Number(button.dataset.carouselStep))));
 root.querySelector('.solar-carousel-controls').hidden=false;
 buttons.forEach(button=>button.addEventListener('click',()=>selectGroup(button.dataset.mapGroup)));
 for(const {nodes,carousel} of Object.values(groups))nodes.forEach((node,index)=>{
  node.addEventListener('click',event=>{
   if(event.defaultPrevented||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||event.button!==0)return;
   if(index===carousel.index&&!carousel.moving)return;
   event.preventDefault();carousel.select(index,animate());paint(true);sync();
  });
 });
 root.addEventListener('keydown',event=>{
  if(event.altKey||event.ctrlKey||event.metaKey||!['ArrowLeft','ArrowRight'].includes(event.key))return;
  event.preventDefault();step(event.key==='ArrowLeft'?-1:1);
 });
 root.addEventListener('focusin',sync);root.addEventListener('focusout',()=>queueMicrotask(sync));
 root.addEventListener('solar:restore-layout',()=>paint());
 const motionButton=root.querySelector('.space-motion-toggle');
 function syncMotion(){
  const enabled=!motion.matches;root.dataset.motion=enabled?'on':'off';root.classList.toggle('scene-motion-on',enabled);
  const label=enabled?(es?'Pausar rotación':'Pause rotation'):(es?'Activar rotación':'Enable rotation');
  motionButton.setAttribute('aria-label',label);motionButton.title=label;
  motionButton.querySelector('.motion-toggle-label').textContent=label;motionButton.querySelector('.motion-toggle-icon').textContent=enabled?'Ⅱ':'▷';
  if(!animate())current().carousel.settle();paint();sync();
 }
 motionButton.addEventListener('click',()=>motion.setEnabled(motion.matches));motion.addEventListener('change',syncMotion);
 preference.addEventListener('change',syncMotion);
 document.addEventListener('visibilitychange',sync);
 new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
 window.addEventListener('hashchange',()=>{if(location.hash==='#complementary')selectGroup('side');});
 if('ResizeObserver'in window)new ResizeObserver(()=>paint()).observe(space);else window.addEventListener('resize',()=>paint());
 if('IntersectionObserver'in window)new IntersectionObserver(entries=>{
  visible=entries.some(entry=>entry.isIntersecting);root.classList.toggle('is-sleeping',!visible);
  if(visible&&!root.dataset.cinematic){
   root.dataset.cinematic='loading';
   import('./orbital-scene.js').then(module=>module.mountCinematicSpace(root)).catch(error=>{root.dataset.cinematic='fallback';root.classList.remove('cinematic-ready');console.warn('Orbital carousel uses its SVG fallback:',error.message);});
  }
  sync();
 },{threshold:.12}).observe(root);
 selectGroup(active);syncMotion();
}
