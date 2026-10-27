import {createOrbitPaths,orbitPoint} from './solar-motion.js';
import {createSpaceBackdrop} from './space-backdrop.js';
import {createProjectModel} from './project-models.js';
import {sceneMotion} from './scene-motion.js';

// Sculptural objects in a shared orbit. HTML anchors follow their 3D projections.
export async function mountCinematicSpace(root){
 const THREE=await import('./assets/vendor/three.module.js');
 const reduced=sceneMotion;
 const mobile=matchMedia('(max-width:700px)').matches;
 const canvas=document.createElement('canvas');canvas.className='cinematic-canvas';canvas.setAttribute('aria-hidden','true');
 let renderer;
 try{renderer=new THREE.WebGLRenderer({canvas,antialias:!mobile,alpha:true,powerPreference:'high-performance'});}catch{root.dataset.cinematic='fallback';return;}
 renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1:1.25));
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
 renderer.shadowMap.enabled=!mobile;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 root.prepend(canvas);
 const scene=new THREE.Scene();
 const camera=new THREE.PerspectiveCamera(38,1,.1,500);camera.position.set(0,0,32);
 const sun=new THREE.DirectionalLight(0xe6efff,3);sun.position.set(15,8,25);sun.castShadow=!mobile;
 sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-35,right:35,top:30,bottom:-30,near:.1,far:100});sun.shadow.bias=-.0005;
 scene.add(sun,new THREE.AmbientLight(0x8296cb,.16),new THREE.HemisphereLight(0x99b8ff,0x0a0718,.4));
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
 const dynamicObjects=[];
 function body(id){const object=createProjectModel(THREE,id,{mobile});dynamicObjects.push({globe:object,base:object.userData.baseRotation,phase:dynamicObjects.length*1.3});return object;}
 // Faint orbital ribbons establish depth; none of these are planets or solar horizons.
 const tracks=new THREE.Group();
 for(let i=0;i<3;i++){
  const points=[];for(let j=0;j<=180;j++){const a=j/180*Math.PI*2;points.push(new THREE.Vector3(Math.cos(a)*(14+i*3),Math.sin(a)*(4.2+i*2),0));}
  const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:0x819aca,transparent:true,opacity:.07,depthWrite:false}));line.rotation.set(.2+i*.15,-.2,i*.23-.15);line.position.set(0,-3,-9-i*3);tracks.add(line);
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
 const models=new Map();let ready=false,visible=true,contextLost=false,frame=0,width=0,height=0,pointer={x:0,y:0},lastTime=0,elapsed=0,orbitTime=0,activeIds=[];
 let spaceBox={left:0,top:0,width:0,height:0},orbitPaths=[];
 const cameraTarget=new THREE.Vector3();const projected=new THREE.Vector3();
 function screenToWorld(x,y,z){const units=2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*(32-z)/height;return new THREE.Vector3((x-width/2)*units,(height/2-y)*units,z);}
 function measure(){
  const rect=root.getBoundingClientRect();width=rect.width;height=rect.height;if(!width||!height)return;
  renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();
  updateLayout();
 }
 function updateLayout(){
  if(!height)return;
  const box=root.getBoundingClientRect(),space=root.querySelector('.solar-space').getBoundingClientRect();
  spaceBox={left:space.left-box.left,top:space.top-box.top,width:space.width,height:space.height};
  const nodes=[...root.querySelectorAll('.planet-node:not([hidden])')].filter(n=>!n.closest('.solar-constellation[hidden]'));
  activeIds=nodes.map(n=>n.dataset.project);
  orbitPaths=createOrbitPaths(nodes.map(node=>node._cinematicLayout),space.width,space.height,root.dataset.activeGroup==='featured');
  for(const [i,node]of nodes.entries()){
   const source=node._cinematicLayout||{x:parseFloat(node.style.getPropertyValue('--planet-x')),y:parseFloat(node.style.getPropertyValue('--planet-y')),size:parseFloat(node.style.getPropertyValue('--planet-size')),height:parseFloat(node.style.getPropertyValue('--planet-height'))};
   if(!Number.isFinite(source.x))continue;
   let model=models.get(node.dataset.project);
   if(!model){const object=body(node.dataset.project);scene.add(object);model={object,node,target:new THREE.Vector3(),source,depth:[1.5,-2,3,-1,2,-3][i%6],phase:i*2.1};models.set(node.dataset.project,model);}
   model.source=source;model.node=node;node.dataset.modelKind=model.object.userData.kind;
   const x=space.left-box.left+source.x,y=space.top-box.top+source.y-source.height/2+source.size/2;
   model.target.copy(screenToWorld(x,y,model.depth));
   model.radius=source.size*.42*(2*Math.tan(THREE.MathUtils.degToRad(19))*(32-model.depth)/height);
   if(!model.orbitPosition)model.orbitPosition=model.target.clone();
   if(!model.visualRadius)model.visualRadius=model.radius;
   model.object.scale.setScalar(model.radius);model.object.position.copy(model.target);model.object.visible=true;
  }
  for(const [id,m]of models)m.object.visible=activeIds.includes(id);
  requestRender();
 }
 function layoutEvent(event){for(const item of event.detail.nodes)item.node._cinematicLayout={...item.layout};updateLayout();}
 root.addEventListener('solar:layout',layoutEvent);
 root.addEventListener('pointermove',event=>{const r=root.getBoundingClientRect();pointer.x=(event.clientX-r.left)/r.width-.5;pointer.y=(event.clientY-r.top)/r.height-.5;requestRender();},{passive:true});
 root.addEventListener('pointerleave',()=>{pointer.x=pointer.y=0;});
 function render(now){
  frame=0;if(!visible||contextLost||document.hidden||!width||!height)return;
  const realDelta=Math.min(Math.max((now-(lastTime||now))/1000,0),.25),dt=Math.min(realDelta,.05);lastTime=now;
  const paused=document.documentElement.classList.contains('project-dialog-open');
  const focusedNode=root.querySelector('.planet-node:hover,.planet-node:focus-visible');
  if(!paused&&!reduced.matches){elapsed+=realDelta;orbitTime+=realDelta;}
  root.dataset.orbitTime=String(Math.round(orbitTime*100));
  // The chess opening owns the entrance; projects keep a quiet, steady camera.
  cameraTarget.set(reduced.matches?0:Math.sin(elapsed*.15)*.25+pointer.x*.35,reduced.matches?0:Math.sin(elapsed*.11)*.12-pointer.y*.18,32);
  camera.position.lerp(cameraTarget,1-Math.exp(-dt*5));
  // Labels are projected before renderer.render updates the camera. This must
  // also be correct on the only frame rendered with reduced motion enabled.
  camera.updateMatrixWorld();
  const space=spaceBox;
  const smoothing=1-Math.exp(-dt*5);
  for(const [i,id]of activeIds.entries()){
   const m=models.get(id),p=orbitPoint(orbitPaths[i],reduced.matches?0:orbitTime);if(!m)continue;
   m.source=p;
   m.target.copy(screenToWorld(space.left+p.x,space.top+p.y-p.height/2+p.size/2,m.depth));
   m.radius=p.size*.42*(2*Math.tan(THREE.MathUtils.degToRad(19))*(32-m.depth)/height);
  }
  for(const [id,m]of models){
   if(!m.object.visible)continue;
   const focus=m.node===focusedNode;
   if(reduced.matches)m.orbitPosition.copy(m.target);else m.orbitPosition.lerp(m.target,smoothing);
   m.object.position.copy(m.orbitPosition);
   if(!reduced.matches){m.object.position.x+=Math.sin(elapsed*.14+m.phase)*.045;m.object.position.y+=Math.sin(elapsed*.19+m.phase)*.065;}
   m.visualRadius=reduced.matches?m.radius:m.visualRadius+(m.radius-m.visualRadius)*smoothing;
   m.focusScale=(m.focusScale||1)+((focus?1.035:1)-(m.focusScale||1))*smoothing;
   m.object.scale.setScalar(m.visualRadius*m.focusScale);
   projected.copy(m.object.position).project(camera);
   const x=(projected.x*.5+.5)*width-space.left,y=(-projected.y*.5+.5)*height-space.top;
   const diameter=m.visualRadius/(2*Math.tan(THREE.MathUtils.degToRad(19))*(camera.position.z-m.object.position.z))*height*2/.84;
   const nodeHeight=diameter+(m.source.height-m.source.size);
   m.node.style.setProperty('--planet-x',`${x}px`);m.node.style.setProperty('--planet-y',`${y+nodeHeight/2-diameter/2}px`);if(!m.lastDiameter||Math.abs(diameter-m.lastDiameter)>.25){m.node.style.setProperty('--planet-size',`${diameter}px`);m.node.style.setProperty('--planet-height',`${nodeHeight}px`);m.lastDiameter=diameter;}
  }
  if(!paused&&!reduced.matches)for(const object of dynamicObjects){object.globe.rotation.x=object.base.x+Math.sin(elapsed*.22+object.phase)*.07;object.globe.rotation.y=object.base.y+Math.sin(elapsed*.18+object.phase)*.18;object.globe.rotation.z=object.base.z+Math.sin(elapsed*.14+object.phase)*.045;}
  spaceBackdrop.update(elapsed,pointer,root.dataset.activeGroup==='side',width/height,!reduced.matches,dt);
  spaceBackdrop.renderFog(renderer,width,height);
  starMaterial.uniforms.time.value=reduced.matches?0:elapsed;
  sky.rotation.y=-.8+(reduced.matches?0:elapsed*.003);
  starField.rotation.y=reduced.matches?0:elapsed*.004;
  renderer.render(scene,camera);
  root.dataset.cinematicFrame=String(Math.round(elapsed*100));
  if(!reduced.matches&&!paused)frame=requestAnimationFrame(render);
 }
 function requestRender(){if(ready&&!frame&&visible&&!contextLost&&!document.hidden){lastTime=0;frame=requestAnimationFrame(render);}}
 new ResizeObserver(measure).observe(root);
 const visibility=new IntersectionObserver(entries=>{
  visible=entries.some(entry=>entry.isIntersecting);
  if(visible){lastTime=0;requestRender();}
  else{cancelAnimationFrame(frame);frame=0;}
 },{threshold:.08});visibility.observe(root);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else{lastTime=0;requestRender();}});
 reduced.addEventListener('change',()=>{if(reduced.matches){camera.position.set(0,0,32);camera.rotation.set(0,0,0);root.classList.remove('cinema-opening');}requestRender();});
 new MutationObserver(requestRender).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
 canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();contextLost=true;cancelAnimationFrame(frame);frame=0;root.classList.remove('cinematic-ready','cinema-opening');root.dataset.cinematic='fallback';root.dispatchEvent(new Event('solar:restore-layout'));});
 canvas.addEventListener('webglcontextrestored',()=>{contextLost=false;root.classList.add('cinematic-ready');root.dataset.cinematic='ready';requestRender();});
 measure();
 if(renderer.extensions.has('KHR_parallel_shader_compile'))await renderer.compileAsync(scene,camera);else renderer.compile(scene,camera);
 ready=true;
 root.classList.add('cinematic-ready');root.dataset.cinematic='ready';root.dataset.visualMode='representative';
 requestRender();
}
