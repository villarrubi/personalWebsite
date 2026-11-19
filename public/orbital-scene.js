import {orbitSlot} from './solar-carousel.js';
import {createSpaceBackdrop} from './space-backdrop.js';
import {createProjectModel} from './project-models.js';
import {sceneMotion} from './scene-motion.js';

// Sculptural objects in a shared orbit. HTML anchors follow their 3D projections.
export async function mountCinematicSpace(root){
 const THREE=await import('./assets/vendor/three.module.js');
 const reduced=sceneMotion,preference=matchMedia('(prefers-reduced-motion: reduce)');
 const mobile=matchMedia('(max-width:700px)').matches;
 const canvas=document.createElement('canvas');canvas.className='cinematic-canvas';canvas.setAttribute('aria-hidden','true');
 let renderer;
 try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});}catch{root.dataset.cinematic='fallback';return;}
 renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1:1.25));
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;
 renderer.shadowMap.enabled=!mobile;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 root.prepend(canvas);
 const scene=new THREE.Scene();
 const camera=new THREE.PerspectiveCamera(38,1,.1,500);camera.position.set(0,0,32);
 const sun=new THREE.DirectionalLight(0xe6efff,3);sun.position.set(15,8,25);sun.castShadow=!mobile;
 sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-35,right:35,top:30,bottom:-30,near:.1,far:100});sun.shadow.bias=-.0005;
 scene.add(sun,new THREE.AmbientLight(0x8296cb,.22),new THREE.HemisphereLight(0x99b8ff,0x0a0718,.4));
 const rim=new THREE.DirectionalLight(0xc3a1ff,2.5);rim.position.set(-12,5,-8);scene.add(rim);
 // Large softboxes form realistic highlights on polished materials, without a room in view.
 const studio=new THREE.Scene();studio.background=new THREE.Color(0x1b2237);
 const panels=[[-5,4,3,4,12,0xffffff,5],[6,2,2,3,14,0xbcd6ff,4],[0,8,-2,14,3,0xffffff,6],[0,-5,5,10,2,0x8d83df,2],[1,3,-8,8,5,0xe7c8ba,2]];
 for(const[x,y,z,w,h,colour,intensity]of panels){
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color(colour).multiplyScalar(intensity),side:THREE.DoubleSide}));
  mesh.position.set(x,y,z);mesh.lookAt(0,0,0);studio.add(mesh);
 }
 const pmrem=new THREE.PMREMGenerator(renderer);const environment=pmrem.fromScene(studio,0);scene.environment=environment.texture;
 studio.traverse(object=>{object.geometry?.dispose();if(object.material)object.material.dispose();});pmrem.dispose();
 const loader=new THREE.TextureLoader();
 const stars=await loader.loadAsync('/assets/space/stars_milky_way.webp').catch(error=>{renderer.dispose();canvas.remove();throw error;});stars.colorSpace=THREE.SRGBColorSpace;
 const sky=new THREE.Mesh(new THREE.SphereGeometry(190,48,24),new THREE.MeshBasicMaterial({map:stars,side:THREE.BackSide,color:0x65728d,depthWrite:false}));sky.rotation.set(.65,-.8,.25);sky.renderOrder=-100;scene.add(sky);
 const spaceBackdrop=createSpaceBackdrop(THREE,mobile);scene.add(spaceBackdrop.group);
 function body(id){return createProjectModel(THREE,id,{mobile});}
 // Tracks follow the same ellipse and depth as the objects, rather than the screen centre.
 const tracks=new THREE.Group();
 for(let i=0;i<3;i++){
  const material=i===1?new THREE.LineDashedMaterial({color:0x8cafc5,transparent:true,opacity:.12,dashSize:.14,gapSize:.23,depthWrite:false}):new THREE.LineBasicMaterial({color:0xa3cbd9,transparent:true,opacity:i===0?.2:.07,depthWrite:false});
  const line=new THREE.Line(new THREE.BufferGeometry(),material);tracks.add(line);
 }scene.add(tracks);
 function glowTexture(){
  const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d'),g=ctx.createRadialGradient(128,128,0,128,128,128);
  for(const [p,colour]of [[0,'rgba(230,242,255,1)'],[.025,'rgba(205,224,255,.6)'],[.08,'rgba(145,176,240,.18)'],[.28,'rgba(110,130,200,.035)'],[1,'rgba(90,120,190,0)']])g.addColorStop(p,colour);
  ctx.fillStyle=g;ctx.fillRect(0,0,256,256);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
 }
 const flareMap=glowTexture();
 const flare=new THREE.Sprite(new THREE.SpriteMaterial({map:flareMap,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));flare.position.set(19,8,-15);flare.scale.set(14,14,1);scene.add(flare);
 const streak=flare.clone();streak.material=flare.material.clone();streak.material.opacity=.12;streak.scale.set(40,.32,1);scene.add(streak);
 let seed=83621;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const positions=[],colours=[],sizes=[];
 for(let i=0;i<(mobile?1200:2800);i++){
  const theta=random()*Math.PI*2,z=random()*2-1,r=60+random()*95,s=Math.sqrt(1-z*z);
  positions.push(r*s*Math.cos(theta),r*z,r*s*Math.sin(theta));
  const warm=random();colours.push(.7+warm*.3,.75+warm*.2,1-warm*.2);sizes.push(.5+random()*1.8);
 }
 const starGeometry=new THREE.BufferGeometry();starGeometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));starGeometry.setAttribute('colour',new THREE.Float32BufferAttribute(colours,3));starGeometry.setAttribute('size',new THREE.Float32BufferAttribute(sizes,1));
 const starMaterial=new THREE.ShaderMaterial({uniforms:{time:{value:0}},vertexShader:`attribute vec3 colour;attribute float size;uniform float time;varying vec3 c;void main(){float phase=dot(position,vec3(.027,.013,.039));c=colour*(.68+.32*sin(time*.45+phase));vec3 drifting=position+vec3(sin(time*.06+phase)*4.8,cos(time*.045+phase)*2.8,0.);vec4 p=modelViewMatrix*vec4(drifting,1.0);gl_Position=projectionMatrix*p;gl_PointSize=clamp(size*240.0/max(1.0,-p.z),.6,3.2);}`,fragmentShader:`varying vec3 c;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;gl_FragColor=vec4(c,pow(1.0-d*2.0,2.0)*.8);}`,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false});const starField=new THREE.Points(starGeometry,starMaterial);scene.add(starField);
 // The controller owns the carousel phase for both WebGL and the SVG fallback.
 const models=new Map();let ready=false,visible=true,contextLost=false,frame=0,width=0,height=0,lastTime=0,elapsed=0;
 const pointer={x:0,y:0};let spaceBox={left:0,top:0,width:0,height:0};
 function screenToWorld(x,y,z){const units=2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*(32-z)/height;return new THREE.Vector3((x-width/2)*units,(height/2-y)*units,z);}
 function syncModels(){
  const orbit=root._orbitFrame;if(!orbit||!height)return;
  const shown=new Set();
  for(const {node,layout:p} of orbit.items){
   if(!p.visible)continue;shown.add(p.id);
   let m=models.get(p.id);
   if(!m){
    const object=body(p.id);scene.add(object);
    const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:flareMap,color:new THREE.Color(node.dataset.accent||'#a9c8e0'),transparent:true,opacity:.15,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));scene.add(halo);
    const materials=new Map();object.traverse(child=>{
     for(const material of [].concat(child.material||[]))if(material.color&&!materials.has(material)){
      materials.set(material,{color:material.color.clone(),opacity:material.opacity});
      // Keep the shader stable while fading at the mobile window's rear seam.
      material.transparent=true;
     }
    });
    m={object,halo,materials};models.set(p.id,m);node.dataset.modelKind=object.userData.kind;
   }
   const radius=p.size*.42*(2*Math.tan(THREE.MathUtils.degToRad(19))*(32-p.depth)/height);
   m.object.position.copy(screenToWorld(spaceBox.left+p.x,spaceBox.top+p.bodyY,p.depth));
   m.object.scale.setScalar(radius);m.object.visible=m.halo.visible=true;
   const base=m.object.userData.baseRotation;
   m.object.rotation.set(base.x+p.tilt*.4,base.y+p.tilt,base.z+THREE.MathUtils.degToRad(p.roll));
   const light=.42+.58*Math.pow(p.foreground,2);
   m.materials.forEach((original,material)=>{
    material.color.copy(original.color).multiplyScalar(light);
    material.opacity=original.opacity*p.edgeOpacity;
   });
   m.halo.position.copy(m.object.position);m.halo.position.z-=.6;m.halo.scale.setScalar(radius*5);
   m.halo.material.opacity=(.035+.22*Math.pow(p.foreground,5))*p.edgeOpacity;
  }
  for(const [id,m] of models)if(!shown.has(id))m.object.visible=m.halo.visible=false;
 }
 function measure(){
  const box=root.getBoundingClientRect(),space=root.querySelector('.solar-space').getBoundingClientRect();
  width=box.width;height=box.height;if(!width||!height)return;
  renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();camera.updateMatrixWorld();
  spaceBox={left:space.left-box.left,top:space.top-box.top,width:space.width,height:space.height};
  tracks.children.forEach((line,index)=>{
   const points=[],factor=[1,1.065,.935][index];
   for(let j=0;j<=160;j++){
    const p=orbitSlot(j/160*Math.PI*2,space.width,space.height);
    points.push(screenToWorld(spaceBox.left+space.width*.5+(p.x-space.width*.5)*factor,spaceBox.top+space.height*.34+(p.bodyY-space.height*.34)*factor,p.depth-index*.6));
   }
   line.geometry.dispose();line.geometry=new THREE.BufferGeometry().setFromPoints(points);
   if(index===1)line.computeLineDistances();
  });
  syncModels();requestRender();
 }
 root.addEventListener('solar:frame',requestRender);
 root.addEventListener('pointermove',event=>{const r=root.getBoundingClientRect();pointer.x=(event.clientX-r.left)/r.width-.5;pointer.y=(event.clientY-r.top)/r.height-.5;requestRender();},{passive:true});
 root.addEventListener('pointerleave',()=>{pointer.x=pointer.y=0;});
 function render(now){
  frame=0;if(!visible||contextLost||document.hidden||!width||!height)return;
  const dt=Math.min(Math.max((now-(lastTime||now))/1000,0),.05);lastTime=now;
  const paused=['project-dialog-open','intro-playing','intro-pending'].some(name=>document.documentElement.classList.contains(name));
  const moving=!paused&&!reduced.matches&&!preference.matches;
  if(moving)elapsed+=dt;
  syncModels();

  spaceBackdrop.update(elapsed,pointer,root.dataset.activeGroup==='side',width/height,moving,dt);
  spaceBackdrop.renderFog(renderer,width,height);starMaterial.uniforms.time.value=elapsed;
  sky.rotation.y=-.8+elapsed*.003;starField.rotation.y=elapsed*.004;
  renderer.render(scene,camera);root.dataset.cinematicFrame=String(Math.round(elapsed*100));
  if(moving)frame=requestAnimationFrame(render);else lastTime=0;
 }
 function requestRender(){if(ready&&!frame&&visible&&!contextLost&&!document.hidden)frame=requestAnimationFrame(render);}
 new ResizeObserver(measure).observe(root);
 new ResizeObserver(measure).observe(root.querySelector('.solar-space'));
 const visibility=new IntersectionObserver(entries=>{visible=entries.some(entry=>entry.isIntersecting);lastTime=0;if(visible)requestRender();else{cancelAnimationFrame(frame);frame=0;}},{threshold:.08});visibility.observe(root);
 document.addEventListener('visibilitychange',()=>{lastTime=0;if(document.hidden){cancelAnimationFrame(frame);frame=0;}else requestRender();});
 reduced.addEventListener('change',requestRender);preference.addEventListener('change',requestRender);
 new MutationObserver(requestRender).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
 canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();contextLost=true;cancelAnimationFrame(frame);frame=0;root.classList.remove('cinematic-ready');root.dataset.cinematic='fallback';root.dispatchEvent(new Event('solar:restore-layout'));});
 canvas.addEventListener('webglcontextrestored',()=>{contextLost=false;root.classList.add('cinematic-ready');root.dataset.cinematic='ready';requestRender();});
 measure();
 if(renderer.extensions.has('KHR_parallel_shader_compile'))await renderer.compileAsync(scene,camera);else renderer.compile(scene,camera);
 ready=true;root.classList.add('cinematic-ready');root.dataset.cinematic='ready';root.dataset.visualMode='orbital-carousel';requestRender();
}
