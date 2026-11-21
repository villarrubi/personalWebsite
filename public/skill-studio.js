import * as T from './assets/vendor/three.module.js';

// Physical dimensions, bevels and a shared studio keep the four objects coherent.
export function createSkillModel(kind){
 const root=new T.Group(),moving=[],lights=[];
 const material=(color,roughness=.45,metalness=.15)=>new T.MeshPhysicalMaterial({color,roughness,metalness,clearcoat:.25});
 const aluminium=material(0xb6bdc6,.32,.8),dark=material(0x252b34,.52,.3),silver=material(0xdce1e4,.24,.8),gold=material(0xc8a468,.38,.7);
 const accent=material({software:0xc8946b,ai:0xa89abd,hardware:0x416b5b,interfaces:0x7798b2}[kind],.34,.35);
 const light=new T.MeshStandardMaterial({color:0xb9e6df,emissive:0x79c5b5,emissiveIntensity:.8,roughness:.3});
 const add=(geometry,mat,x,y,z,parent=root)=>{const mesh=new T.Mesh(geometry,mat);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;};
 const box=(w,h,d,mat,x=0,y=0,z=0,parent=root)=>add(new T.BoxGeometry(w,h,d),mat,x,y,z,parent);
 function slab(w,d,h,r,mat,x=0,y=0,z=0,parent=root){
  const s=new T.Shape(),a=-w/2,b=-d/2;
  s.moveTo(a+r,b);s.lineTo(a+w-r,b);s.quadraticCurveTo(a+w,b,a+w,b+r);s.lineTo(a+w,b+d-r);s.quadraticCurveTo(a+w,b+d,a+w-r,b+d);s.lineTo(a+r,b+d);s.quadraticCurveTo(a,b+d,a,b+d-r);s.lineTo(a,b+r);s.quadraticCurveTo(a,b,a+r,b);
  const bevel=Math.min(.025,h*.22),g=new T.ExtrudeGeometry(s,{depth:h-2*bevel,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:bevel,bevelThickness:bevel,curveSegments:10});
  g.rotateX(-Math.PI/2);g.translate(0,-(h-2*bevel)/2,0);return add(g,mat,x,y,z,parent);
 }
 const sphere=(r,mat,x,y,z,parent=root)=>add(new T.SphereGeometry(r,18,12),mat,x,y,z,parent);
 function rod(a,b,r,mat,parent=root){const start=new T.Vector3(...a),end=new T.Vector3(...b),mesh=add(new T.CylinderGeometry(r,r,start.distanceTo(end),8),mat,0,0,0,parent);mesh.position.copy(start.add(end).multiplyScalar(.5));mesh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),new T.Vector3(...b).sub(new T.Vector3(...a)).normalize());return mesh;}
 function screw(x,y,z,parent=root){add(new T.CylinderGeometry(.048,.048,.018,16),silver,x,y,z,parent);box(.052,.004,.009,dark,x,y+.012,z,parent);}
 if(kind==='software'){
  slab(3.15,2.15,.14,.12,dark,0,.1,0);
  for(let i=0;i<3;i++){
   const part=new T.Group();part.position.set((i-1)*.91,.65,0);root.add(part);moving.push(part);
   slab(.79,1.64,.87,.07,i===1?accent:aluminium,0,0,0,part);
   slab(.72,1.57,.035,.06,silver,0,.45,0,part);
   for(const x of [-.28,.28])for(const z of [-.65,.65])screw(x,.478,z,part);
   for(let j=0;j<7;j++)box(.36,.026,.012,dark,0,.22-j*.065,.826,part);
   box(.31,.12,.025,dark,0,-.29,.83,part);
   lights.push(sphere(.023,light,.24,-.29,.85,part));
   rod([-.2,-.49,0],[-.2,-.43,0],.04,gold,part);rod([.2,-.49,0],[.2,-.43,0],.04,gold,part);
  }
 }else if(kind==='ai'){
  slab(2.55,2.0,.14,.18,dark,0,.09,0);
  const network=new T.Group();network.position.y=1.25;root.add(network);moving.push(network);
  const points=Array.from({length:38},(_,i)=>{const y=1-2*(i+.5)/38,r=Math.sqrt(1-y*y),angle=i*2.399963;return [Math.cos(angle)*r*.95,y*.95,Math.sin(angle)*r*.95];});
  points.forEach((p,i)=>{sphere(i%7===0?.085:.052,i%7===0?accent:silver,...p,network);points.slice(i+1).forEach(q=>{if(Math.hypot(...p.map((v,j)=>v-q[j]))<.6)rod(p,q,.011,aluminium,network);});});
  sphere(.22,accent,0,0,0,network);
  for(let i=0;i<5;i++){const p=points[i*7];rod([0,0,0],p,.012,gold,network);lights.push(sphere(.027,light,...p,network));}
  rod([0,.17,0],[0,.3,0],.07,aluminium);
 }else if(kind==='hardware'){
  slab(3.1,2.4,.095,.12,accent,0,.16,0);
  for(const x of [-1.37,1.37])for(const z of [-1.02,1.02]){
   add(new T.CylinderGeometry(.1,.1,.03,18),gold,x,.222,z);add(new T.CylinderGeometry(.047,.047,.034,18),dark,x,.225,z);
  }
  slab(1.12,1.12,.14,.04,dark,-.13,.3,0);
  slab(.86,.86,.025,.025,aluminium,-.13,.386,0);
  for(let i=0;i<12;i++)for(const side of [-1,1]){
   const q=-.49+i*.088;
   box(.025,.022,.12,silver,q-.13,.245,side*.61);
   box(.12,.022,.025,silver,side*.61-.13,.245,q);
   rod([q-.13,.216,side*.69],[q-.13,.216,side*(.83+(i%3)*.065)],.007,gold);
  }
  for(let i=0;i<8;i++){
   const z=-.86+i*.23;
   box(.21,.075,.1,dark,-1.0,.246,z);box(.045,.08,.105,silver,-1.1,.246,z);box(.045,.08,.105,silver,-.9,.246,z);
   box(.15,.11,.1,material(0xb1a48a,.8,0),.86,.26,z);
  }
  slab(.48,.55,.27,.035,silver,1.48,.32,.54);box(.035,.14,.36,dark,1.741,.33,.54);
  for(let i=0;i<7;i++){box(.12,.13,.12,dark,.42+i*.14,.27,-1.03);rod([.42+i*.14,.32,-1.03],[.42+i*.14,.54,-1.03],.025,gold);}
  lights.push(sphere(.034,light,1.1,.23,-.58));
  for(let i=0;i<3;i++)rod([-.58+i*.22,.216,.74],[-.58+i*.22,.216,1.05],.008,gold);
 }else{
  const glass=new T.MeshPhysicalMaterial({color:0xb7d3e3,roughness:.16,metalness:.08,transparent:true,opacity:.36,depthWrite:false,side:T.DoubleSide,clearcoat:1});
  slab(2.8,1.95,.13,.16,dark,0,.1,0);
  for(let i=0;i<3;i++){
   const layer=new T.Group();layer.position.y=.4+i*.38;root.add(layer);moving.push(layer);
   slab(2.55,1.72,.065,.12,i===0?aluminium:glass,0,0,0,layer);
   // Thin anodised edges give the glass a believable physical boundary.
   for(const z of [-.85,.85])box(2.33,.025,.025,silver,0,.025,z,layer);
   for(const x of [-1.26,1.26])box(.025,.025,1.48,silver,x,.025,0,layer);
   if(i===2){
    slab(.46,1.4,.015,.035,dark,-.86,.048,0,layer);
    for(let j=0;j<3;j++)slab(.24,.045,.012,.01,silver,-.86,.062,-.35+j*.2,layer);
    slab(.67,.52,.022,.055,accent,-.14,.052,-.35,layer);slab(.67,.52,.022,.055,aluminium,.64,.052,-.35,layer);
    for(let j=0;j<3;j++)slab(1.34-j*.15,.048,.016,.012,silver,.22-j*.075,.05,.13+j*.17,layer);
   }
  }
 }
 const base=moving.map(p=>p.position.clone());
 return {root,update(time,reduced=false){
  moving.forEach((part,i)=>{
   part.position.copy(base[i]);
   if(kind==='software')part.position.y+=reduced?0:(.5+.5*Math.sin(time*.55+i*.75))*.12;
   if(kind==='interfaces')part.position.y+=reduced?0:Math.sin(time*.6)*(i-1)*.045;
   if(kind==='ai')part.rotation.y=reduced?0:Math.sin(time*.18)*.16;
  });
  lights.forEach((mesh,i)=>mesh.scale.setScalar(.9+.12*Math.sin(time*1.4+i)));
 }};
}

export function mountSkillStudio(stages,onFailure){
 const canvas=document.createElement('canvas');canvas.setAttribute('aria-hidden','true');
 const renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.setClearColor(0,0);
 renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(30,2,.1,50),models=new Map();
 camera.position.set(4.5,4.5,6);camera.lookAt(0,.65,0);
 const key=new T.DirectionalLight(0xffeedb,3.3);key.position.set(-3,6,5);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-4,right:4,top:4,bottom:-4,near:.1,far:18});key.shadow.normalBias=.025;key.shadow.bias=-.0001;scene.add(key,new T.HemisphereLight(0xd9e8fb,0x1b2630,1.3));
 const fill=new T.DirectionalLight(0xc1daff,1.8);fill.position.set(4,3,-3);scene.add(fill);
 const studio=new T.Scene();studio.background=new T.Color(0x424955);
 for(const [x,y,z,w,h] of [[-4,6,4,5,7],[4,3,0,2,7],[0,5,-5,7,3]]){const panel=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:0xffffff,side:T.DoubleSide}));panel.position.set(x,y,z);panel.lookAt(0,0,0);studio.add(panel);}
 const pmrem=new T.PMREMGenerator(renderer),environment=pmrem.fromScene(studio,.08);scene.environment=environment.texture;pmrem.dispose();studio.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});
 const floor=new T.Mesh(new T.PlaneGeometry(20,20),new T.ShadowMaterial({opacity:.3}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);
 let current=-1,running=false,reduced=false,raf=0,last=0,time=0,disposed=false,width=0,height=0;
 function draw(){
  if(disposed||current<0)return;
  const stage=stages[current],w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;
  if(w!==width||h!==height){width=w;height=h;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
  const model=models.get(current);model.update(time,reduced);renderer.render(scene,camera);stage.classList.add('is-rendered');
 }
 function frame(now){raf=0;if(!running||disposed)return;time+=last?Math.min((now-last)/1000,.05):0;last=now;draw();raf=requestAnimationFrame(frame);}
 function set(index,state){
  if(disposed)return;
  if(index!==current){
   if(current>=0){scene.remove(models.get(current).root);stages[current].classList.remove('is-rendered');}
   current=index;if(!models.has(index))models.set(index,createSkillModel(stages[index].dataset.skillStage));
   stages[index].append(canvas);scene.add(models.get(index).root);width=height=0;
  }
  running=state.running;reduced=state.reduced;cancelAnimationFrame(raf);raf=0;last=0;draw();if(running)raf=requestAnimationFrame(frame);
 }
 const observer=typeof ResizeObserver==='undefined'?null:new ResizeObserver(()=>draw());stages.forEach(stage=>observer?.observe(stage));
 function dispose(){if(disposed)return;disposed=true;running=false;cancelAnimationFrame(raf);observer?.disconnect();stages.forEach(s=>s.classList.remove('is-rendered'));canvas.remove();const geometries=new Set(),materials=new Set();for(const model of models.values())model.root.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)materials.add(o.material);});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());floor.geometry.dispose();floor.material.dispose();environment.dispose();renderer.dispose();}
 canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();dispose();onFailure();},{once:true});
 return {set,dispose};
}
