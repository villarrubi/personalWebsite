import * as T from './assets/vendor/three.module.js';
import {createChessModel} from './chess-model.js';
import {cameraFrame} from './chess-timeline.js';

export async function createChessScene(mount) {
  const mobile = matchMedia('(max-width:700px)').matches;
  const model = await createChessModel(T,{mobile});
  const canvas = document.createElement('canvas'); canvas.setAttribute('aria-hidden','true');
  const renderer = new T.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'default'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.5:1.75));
  renderer.setClearColor(0x061327,0); renderer.outputColorSpace=T.SRGBColorSpace;
  renderer.toneMapping=T.ACESFilmicToneMapping; renderer.toneMappingExposure=1.05;
  renderer.shadowMap.enabled=true; renderer.shadowMap.type=T.PCFSoftShadowMap;
  renderer.localClippingEnabled=true;
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(32,1,.1,150);
  scene.add(model.root);
  const studio = new T.Scene(); studio.background=new T.Color(0x1a2433);
  for (const [x,y,z,w,h,color,intensity] of [
    [-5,7,4,5,8,0xfff3df,3],[5,4,0,2,9,0xe0eaff,2],[0,8,-5,8,4,0xf1e9dc,3],[0,2,7,8,2,0xffffff,1.2],
  ]) {
    const panel=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:new T.Color(color).multiplyScalar(intensity),side:T.DoubleSide}));
    panel.position.set(x,y,z);panel.lookAt(0,0,0);studio.add(panel);
  }
  const pmrem=new T.PMREMGenerator(renderer),environment=pmrem.fromScene(studio,.04);
  scene.environment=environment.texture;
  studio.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});pmrem.dispose();
  const key=new T.DirectionalLight(0xfff3df,2.6);key.position.set(-4,9,5);key.castShadow=true;
  key.shadow.mapSize.set(mobile?1024:2048,mobile?1024:2048);
  Object.assign(key.shadow.camera,{left:-7,right:7,top:7,bottom:-7,near:.5,far:28});
  key.shadow.bias=-.00015;key.shadow.normalBias=.025;key.shadow.radius=3;
  scene.add(key,new T.HemisphereLight(0xc5d8f6,0x121b27,.8));
  const rim=new T.DirectionalLight(0xdce7ff,1.4);rim.position.set(5,5,-6);scene.add(rim);
  const fill=new T.DirectionalLight(0xffffff,.7);fill.position.set(1,3,8);scene.add(fill);
  let width=0,height=0,disposed=false,lost=false;
  let pose=document.documentElement.classList.contains('intro-playing')?{pitch:.19,yaw:.28,dock:0}:{pitch:Math.PI/2,yaw:0,dock:1};
  function render(next=pose,w=mount.clientWidth,h=mount.clientHeight) {
    if(disposed||lost||!w||!h)return;
    pose=next;
    w=Math.max(1,Math.round(w));h=Math.max(1,Math.round(h));
    if(w!==width||h!==height){width=w;height=h;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
    const framing=cameraFrame(pose.pitch,pose.yaw,camera.aspect);
    camera.position.set(...framing.position);camera.up.set(...framing.up);camera.lookAt(...framing.target);
    renderer.render(scene,camera);
    renderer.shadowMap.autoUpdate=false;
  }
  const onLost=event=>{event.preventDefault();lost=true;mount.dispatchEvent(new Event('chess:lost'));};
  canvas.addEventListener('webglcontextlost',onLost);
  try {
    await renderer.compileAsync(scene,camera);
    mount.append(canvas);render();
  } catch(error) {dispose();throw error;}
  function dispose(){
    if(disposed)return;disposed=true;canvas.removeEventListener('webglcontextlost',onLost);
    model.dispose();environment.dispose();key.shadow.dispose();renderer.dispose();canvas.remove();
  }
  return {render,dispose,canvas};
}
