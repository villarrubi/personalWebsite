import {sceneMotion} from './scene-motion.js';

const host=document.querySelector('[data-atlas-preview]');
if(host){
 const es=document.documentElement.lang==='es';
 const mount=host.querySelector('.atlas-canvas');
 const view=host.querySelector('.atlas-view');
 const controls=host.querySelector('.atlas-controls');
 const explodeButton=host.querySelector('[data-cell-explode]');
 const rotateButton=host.querySelector('[data-cell-rotate]');
 const status=host.querySelector('.atlas-status');
 let renderer,scene,camera,model,T,createCell,visible=true,disposed=false,frame=0,last=0;
 let type='animal',separation=0,targetSeparation=0,rotation=-.35,tilt=0,rotating=false,drag;
 const cache=new Map();
 const names={animal:es?'Célula animal':'Animal cell',plant:es?'Célula vegetal':'Plant cell',bacteria:es?'Bacteria':'Bacterium'};
 const resourceSet=new Set();

 function draw(){
  if(!renderer||!model||disposed)return;
  model.root.rotation.set(tilt,rotation,0);
  for(const [i,part] of model.parts.entries()){
   part.group.position.copy(part.home).multiplyScalar(1+separation*.8);
   if(['membrane','wall','capsule'].includes(part.id))part.group.position.y-=separation*(.5+i*.12);
   else if(part.home.length()<.1)part.group.position.y+=separation*.8;
  }
  const distance=(type==='bacteria'?16:10.2)*(1+separation*.34)*Math.max(1,1.15/camera.aspect);
  const target=new T.Vector3(type==='bacteria'?.8:0,-.3,0);
  camera.position.copy(target).add(new T.Vector3(.32,.75,1).normalize().multiplyScalar(distance));
  camera.lookAt(target);
  renderer.render(scene,camera);
 }
 function tick(now){
  frame=0;if(disposed||!visible||document.hidden||document.documentElement.classList.contains('intro-playing'))return;
  const dt=last?Math.min((now-last)/1000,.05):.016;last=now;
  if(sceneMotion.matches)separation=targetSeparation;
  else separation+=(targetSeparation-separation)*(1-Math.exp(-dt*8));
  if(Math.abs(targetSeparation-separation)<.002)separation=targetSeparation;
  if(rotating&&!sceneMotion.matches)rotation+=dt*.16;
  draw();
  if((rotating&&!sceneMotion.matches)||separation!==targetSeparation)frame=requestAnimationFrame(tick);
 }
 function requestDraw(){if(!frame&&!disposed){last=0;frame=requestAnimationFrame(tick);}}
 function choose(next){
  if(model)scene.remove(model.root);
  type=next;
  if(!cache.has(type)){
   const cell=createCell(type);
   for(const part of cell.parts){
    // A simplified interior preview made from the project's original geometry.
    if(part.id==='cytoplasm')part.group.visible=false;
    part.group.traverse(object=>{
     if(object.geometry)resourceSet.add(object.geometry);
     if(!object.material)return;
     for(const material of [object.material].flat()){
      resourceSet.add(material);for(const value of Object.values(material))if(value?.isTexture)resourceSet.add(value);
      if(['membrane','wall','capsule'].includes(part.id)){
       material.clippingPlanes=[new T.Plane(new T.Vector3(0,-1,0),-.2)];
       material.side=T.DoubleSide;
      }
     }
    });
   }
   cache.set(type,cell);
  }
  model=cache.get(type);scene.add(model.root);rotation=-.35;tilt=0;
  host.querySelectorAll('[data-cell]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.cell===type)));
  host.querySelector('.atlas-index').textContent=`0${['animal','plant','bacteria'].indexOf(type)+1} — 03`;
  view.setAttribute('aria-label',`${names[type]}. ${es?'Vista interior del modelo original. Usa las flechas para girar.':'Interior view of the original model. Use arrow keys to rotate.'}`);
  status.textContent=names[type];requestDraw();
 }
 function resize(){if(!renderer)return;const w=mount.clientWidth,h=mount.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();requestDraw();}
 function stopRotation(){rotating=false;rotateButton.setAttribute('aria-pressed','false');}
 function fallback(){
  host.classList.remove('is-ready');controls.hidden=true;host.querySelector('.atlas-drag-hint').hidden=true;
  view.removeAttribute('tabindex');status.textContent=es?'Vista previa estática del modelo. Puedes consultar el proyecto completo.':'Static model preview. You can explore the full project.';
  if(frame)cancelAnimationFrame(frame);frame=0;
 }
 const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)requestDraw();else{cancelAnimationFrame(frame);frame=0;}},{threshold:0});observer.observe(view);
 const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(mount);
 document.addEventListener('visibilitychange',requestDraw);
 document.addEventListener('chess:intro-end',requestDraw);
 sceneMotion.addEventListener('change',()=>{if(sceneMotion.matches)stopRotation();requestDraw();});
 window.addEventListener('pagehide',event=>{
  cancelAnimationFrame(frame);frame=0;
  if(!event.persisted){disposed=true;observer.disconnect();resizeObserver.disconnect();resourceSet.forEach(resource=>resource.dispose());renderer?.dispose();}
 });
 window.addEventListener('pageshow',()=>{if(!disposed)requestDraw();});

 async function init(){
  try{
   [T,{createCell}]=await Promise.all([import('./assets/vendor/three.module.js'),import('./assets/atlas/models.js')]);
   if(disposed)return;
   renderer=new T.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});
   renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<600?1.25:1.5));
   renderer.localClippingEnabled=true;renderer.outputColorSpace=T.SRGBColorSpace;
   renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
   renderer.setClearColor(0x061327,0);
   renderer.domElement.setAttribute('aria-hidden','true');mount.append(renderer.domElement);
   scene=new T.Scene();camera=new T.PerspectiveCamera(36,1,.1,100);
   scene.add(new T.HemisphereLight(0xe7f7ee,0x152c4b,1.3));
   const key=new T.DirectionalLight(0xfff5db,3.8);key.position.set(-4,8,5);scene.add(key);
   const fill=new T.DirectionalLight(0x93cde2,1);fill.position.set(5,2,-3);scene.add(fill);
   choose('animal');resize();draw();
   host.classList.add('is-ready');controls.hidden=false;host.querySelector('.atlas-drag-hint').hidden=false;
   view.tabIndex=0;
   view.setAttribute('aria-keyshortcuts','ArrowLeft ArrowRight ArrowUp ArrowDown');
   host.querySelectorAll('[data-cell]').forEach(button=>button.addEventListener('click',()=>choose(button.dataset.cell)));
   explodeButton.addEventListener('click',()=>{
    targetSeparation=targetSeparation?0:1;
    explodeButton.setAttribute('aria-pressed',String(Boolean(targetSeparation)));
    explodeButton.innerHTML=`${targetSeparation?(es?'Reunir':'Reassemble'):(es?'Desmontar':'Take apart')} <span aria-hidden="true">${targetSeparation?'−':'＋'}</span>`;
    status.textContent=targetSeparation?(es?'Estructuras separadas.':'Structures separated.'):(es?'Estructuras reunidas.':'Structures reassembled.');requestDraw();
   });
   rotateButton.addEventListener('click',()=>{
    rotating=!rotating;
    // An explicit rotation request enables the shared motion preference.
    if(rotating&&sceneMotion.matches)sceneMotion.setEnabled(true);
    rotateButton.setAttribute('aria-pressed',String(rotating));requestDraw();
   });
   view.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;
    event.preventDefault();stopRotation();
    if(event.key==='ArrowLeft')rotation-=.15;if(event.key==='ArrowRight')rotation+=.15;
    if(event.key==='ArrowUp')tilt=Math.min(.45,tilt+.08);if(event.key==='ArrowDown')tilt=Math.max(-.35,tilt-.08);requestDraw();
   });
   const canvas=renderer.domElement;
   canvas.addEventListener('pointerdown',event=>{if(event.button!==0)return;stopRotation();drag={id:event.pointerId,x:event.clientX,y:event.clientY};canvas.setPointerCapture(event.pointerId);});
   canvas.addEventListener('pointermove',event=>{if(!drag||drag.id!==event.pointerId)return;rotation+=(event.clientX-drag.x)*.009;tilt=Math.max(-.35,Math.min(.45,tilt+(event.clientY-drag.y)*.004));drag.x=event.clientX;drag.y=event.clientY;requestDraw();});
   const release=()=>{drag=null;};canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);canvas.addEventListener('lostpointercapture',release);
   canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();fallback();});
   canvas.addEventListener('webglcontextrestored',()=>{host.classList.add('is-ready');controls.hidden=false;view.tabIndex=0;host.querySelector('.atlas-drag-hint').hidden=false;requestDraw();});
  }catch(error){fallback();console.warn('Atlas preview unavailable; original model image retained.',error);}
 }
 init();
}
