import {terrainHeight,terrainColor} from './terrain.js';
import {sceneMotion} from './scene-motion.js';

const host=document.querySelector('[data-hero-world]');
let capture=()=>{};
export const heroWorldReady=host?mountWorld(host).catch(()=>{}):Promise.resolve();
export async function prepareHeroWorld(){await heroWorldReady;capture();}

async function mountWorld(root){
 const T=await import('./assets/vendor/three.module.js');
 const viewport=root.querySelector('.world-viewport'),poster=root.querySelector('.world-poster');
 const es=document.documentElement.lang==='es';
 const renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'default'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<760?1.25:1.5));
 renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
 renderer.setClearColor(0x061327,0);
 const canvas=renderer.domElement;canvas.setAttribute('aria-hidden','true');viewport.append(canvas);
 const scene=new T.Scene(),group=new T.Group();scene.add(group);
 const camera=new T.PerspectiveCamera(33,1,.1,100);camera.position.set(10.4,12.8,16.8);camera.lookAt(0,.3,0);
 scene.add(new T.HemisphereLight(0xc0e4ef,0x13242a,1.3));
 const sun=new T.DirectionalLight(0xffe0aa,2.5);sun.position.set(-5,9,2);scene.add(sun);
 const rim=new T.DirectionalLight(0x8fc6df,1.6);rim.position.set(5,3,-8);scene.add(rim);
 const geometry=new T.PlaneGeometry(13,13,88,88);geometry.rotateX(-Math.PI/2);
 const positions=geometry.attributes.position;
 const colors=new Float32Array(positions.count*3);geometry.setAttribute('color',new T.BufferAttribute(colors,3));
 const terrainMaterial=new T.MeshStandardMaterial({vertexColors:true,roughness:.92,metalness:.08});
 terrainMaterial.onBeforeCompile=shader=>{
  shader.vertexShader='varying float terrainY;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nterrainY = position.y;');
  shader.fragmentShader='varying float terrainY;\n'+shader.fragmentShader.replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nif (terrainY < 0.025) discard;');
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   float contour = abs(fract(terrainY * 3.5 - .5) - .5) / max(fwidth(terrainY * 3.5), .001);
   diffuseColor.rgb = mix(diffuseColor.rgb, vec3(.38,.47,.35), (1. - smoothstep(.25,1.1,contour)) * .10);`);
 };
 const terrain=new T.Mesh(geometry,terrainMaterial);group.add(terrain);
 const waterMaterial=new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{time:{value:0}},vertexShader:`varying vec2 place;void main(){place=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`precision highp float;varying vec2 place;uniform float time;
  void main(){float r=length(place);float fade=1.-smoothstep(4.7,6.7,r);
   float wave=sin(place.x*5.+place.y*3.+time*.45)*sin(place.y*7.-place.x*2.+time*.3);
   float glint=pow(max(0.,wave),12.);vec3 deep=vec3(.028,.10,.14),light=vec3(.09,.27,.29);
   vec3 color=mix(deep,light,.4+.22*sin(place.x*.45+place.y*.3))+glint*.08;
   gl_FragColor=vec4(color,fade*.94);
  }`});
 const water=new T.Mesh(new T.CircleGeometry(6.7,128),waterMaterial);water.rotation.x=-Math.PI/2;water.position.y=.018;group.add(water);
 const lines=new T.Group();group.add(lines);
 for(const [radius,opacity]of [[6.35,.27],[7.0,.12],[7.65,.06]]){
  const points=Array.from({length:181},(_,i)=>{const a=i/180*Math.PI*2;return new T.Vector3(Math.cos(a)*radius,-.035,Math.sin(a)*radius);});
  const line=new T.Line(new T.BufferGeometry().setFromPoints(points),new T.LineDashedMaterial({color:0x9fbec3,transparent:true,opacity,dashSize:.12,gapSize:.1}));line.computeLineDistances();lines.add(line);
 }
 for(let i=0;i<40;i++){
  const a=i/40*Math.PI*2,r=6.9,end=i%5===0?7.12:6.99;
  const line=new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(Math.cos(a)*r,-.035,Math.sin(a)*r),new T.Vector3(Math.cos(a)*end,-.035,Math.sin(a)*end)]),new T.LineBasicMaterial({color:0xb6c8c4,transparent:true,opacity:.28}));lines.add(line);
 }
 let seed=7,kind='islands',edition=1,yaw=-.25,pitch=0,from,to,morphElapsed=0,morphing=false;
 let raf=0,last=0,clock=0,visible=true,disposed=false,drag=null;
 function heights(){return Float32Array.from({length:positions.count},(_,i)=>terrainHeight(positions.getX(i),positions.getZ(i),seed,kind));}
 const vertexColor=new T.Color();
 function applyHeights(values){
  for(let i=0;i<positions.count;i++){
   positions.setY(i,values[i]);vertexColor.setRGB(...terrainColor(values[i]),T.SRGBColorSpace);vertexColor.toArray(colors,i*3);
  }
  positions.needsUpdate=true;geometry.attributes.color.needsUpdate=true;geometry.computeVertexNormals();
 }
 to=heights();applyHeights(to);
 function draw(){group.rotation.set(pitch,yaw,0);waterMaterial.uniforms.time.value=clock;renderer.render(scene,camera);}
 capture=()=>{if(disposed)return;draw();poster.src=canvas.toDataURL('image/png');poster.dataset.introGuide='';};
 function frame(now){
  raf=0;if(disposed||document.hidden||!visible||document.documentElement.classList.contains('intro-playing')){last=0;return;}
  const dt=last?Math.min((now-last)/1000,.05):0;last=now;
  if(!sceneMotion.matches){clock+=dt;if(!drag)yaw+=dt*.018;}
  if(morphing){
   morphElapsed+=dt;const t=sceneMotion.matches?1:Math.min(1,morphElapsed),e=t*t*(3-2*t);
   applyHeights(to.map((h,i)=>from[i]+(h-from[i])*e));morphing=t<1;
  }
  draw();if(!sceneMotion.matches||morphing)raf=requestAnimationFrame(frame);
 }
 function start(){last=0;if(!raf&&!disposed)raf=requestAnimationFrame(frame);}
 function regenerate(nextKind=kind){
  kind=nextKind;seed+=11;edition++;
  from=Float32Array.from({length:positions.count},(_,i)=>positions.getY(i));to=heights();
  morphElapsed=0;morphing=true;root.dataset.edition=edition;
  root.querySelector('[data-world-edition]').textContent=String(edition).padStart(3,'0');
  root.querySelectorAll('[data-terrain]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.terrain===kind)));
  root.querySelector('.world-announcement').textContent=es?`Paisaje ${edition} generado. ${kind==='islands'?'Islas':'Montañas'}.`:`Landscape ${edition} generated. ${kind==='islands'?'Islands':'Highlands'}.`;
  start();
 }
 root.querySelector('[data-generate-world]').addEventListener('click',()=>regenerate());
 root.querySelectorAll('[data-terrain]').forEach(button=>button.addEventListener('click',()=>{if(kind!==button.dataset.terrain)regenerate(button.dataset.terrain);}));
 function updateCoordinates(){root.querySelector('[data-world-x]').textContent=(yaw>=0?'+':'')+yaw.toFixed(2);root.querySelector('[data-world-y]').textContent=(pitch>=0?'+':'')+pitch.toFixed(2);}
 viewport.addEventListener('pointerdown',event=>{
  if(event.button!==0)return;drag={id:event.pointerId,x:event.clientX,y:event.clientY,yaw,pitch,captured:false};
 });
 viewport.addEventListener('pointermove',event=>{
  if(!drag||event.pointerId!==drag.id)return;
  const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
  if(!drag.captured){
   if(event.pointerType==='touch'&&Math.abs(dy)>Math.abs(dx))return;
   if(Math.hypot(dx,dy)<5)return;
   viewport.setPointerCapture(event.pointerId);drag.captured=true;
  }
  yaw=drag.yaw+dx*.006;pitch=Math.max(-.2,Math.min(.25,drag.pitch+dy*.003));updateCoordinates();draw();
 });
 const endDrag=()=>{drag=null;start();};
 viewport.addEventListener('pointerup',endDrag);viewport.addEventListener('pointercancel',endDrag);viewport.addEventListener('lostpointercapture',endDrag);
 viewport.addEventListener('pointerleave',()=>{if(drag&&!drag.captured)endDrag();});
 viewport.addEventListener('keydown',event=>{
  if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(event.key))return;
  event.preventDefault();
  if(event.key==='Home'){yaw=-.25;pitch=0;}
  if(event.key==='ArrowLeft')yaw-=.15;if(event.key==='ArrowRight')yaw+=.15;
  if(event.key==='ArrowUp')pitch=Math.max(-.2,pitch-.05);if(event.key==='ArrowDown')pitch=Math.min(.25,pitch+.05);
  updateCoordinates();draw();
 });
 function resize(){
  if(disposed)return;
  const {width,height}=viewport.getBoundingClientRect();if(!width||!height)return;
  renderer.setSize(width,height,false);camera.aspect=width/height;camera.zoom=width/height<1.2?.82:.94;camera.updateProjectionMatrix();draw();start();
 }
 const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(viewport);resize();capture();
 const observer=new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);if(visible)start();else{cancelAnimationFrame(raf);raf=0;last=0;}},{threshold:.01});observer.observe(viewport);
 const onVisibility=()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else start();};
 const motionButton=root.querySelector('[data-world-motion]');
 function syncMotion(){motionButton.setAttribute('aria-pressed',String(!sceneMotion.matches));motionButton.textContent=sceneMotion.matches?(es?'Animar ▷':'Animate ▷'):(es?'Pausar Ⅱ':'Pause Ⅱ');start();}
 motionButton.addEventListener('click',()=>sceneMotion.setEnabled(sceneMotion.matches));
 document.addEventListener('visibilitychange',onVisibility);document.addEventListener('chess:intro-end',start);sceneMotion.addEventListener('change',syncMotion);syncMotion();
 root.classList.add('world-ready');root.querySelector('.world-interface').hidden=false;root.dataset.edition=edition;updateCoordinates();
 viewport.tabIndex=0;viewport.setAttribute('role','group');viewport.setAttribute('aria-describedby','world-instructions');
 viewport.setAttribute('aria-label',es?'Paisaje 3D. Arrastra para girar o usa las flechas del teclado.':'3D landscape. Drag to rotate or use the arrow keys.');
 function dispose(){
  if(disposed)return;disposed=true;cancelAnimationFrame(raf);observer.disconnect();resizeObserver.disconnect();
  document.removeEventListener('visibilitychange',onVisibility);document.removeEventListener('chess:intro-end',start);sceneMotion.removeEventListener('change',syncMotion);
  scene.traverse(object=>{object.geometry?.dispose();object.material?.dispose();});renderer.dispose();canvas.remove();capture=()=>{};
 }
 canvas.addEventListener('webglcontextlost',event=>{
  event.preventDefault();root.classList.remove('world-ready');root.querySelector('.world-interface').hidden=true;poster.removeAttribute('data-intro-guide');
  viewport.removeAttribute('tabindex');viewport.removeAttribute('aria-describedby');viewport.setAttribute('role','img');viewport.setAttribute('aria-label',poster.alt);dispose();
 });
 window.addEventListener('pagehide',event=>{if(!event.persisted)dispose();});
 window.addEventListener('pageshow',event=>{if(event.persisted)start();});
 start();
}
