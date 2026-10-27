// Representative, original solid models. Each project owns a recognisable silhouette.
export function createProjectModel(T,id,{mobile=false}={}){
 const root=new T.Group(),segments=mobile?16:28;
 const material=(colour,options={})=>new T.MeshPhysicalMaterial({color:colour,roughness:.29,metalness:.18,clearcoat:.7,clearcoatRoughness:.12,envMapIntensity:1.15,...options});
 const ivory=material(0xe3dac5),dark=material(0x14223d,{roughness:.4,metalness:.1}),silver=material(0xb2c4da,{metalness:.8,roughness:.22}),blue=material(0x668ac8),green=material(0x79b39a),gold=material(0xd1b58d,{metalness:.55}),purple=material(0xb6a4d2);
 function add(g,m,x=0,y=0,z=0,parent=root){const mesh=new T.Mesh(g,m);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
 function box(w,h,d,m,x=0,y=0,z=0,parent=root){return add(new T.BoxGeometry(w,h,d),m,x,y,z,parent);}
 function sphere(r,m,x=0,y=0,z=0,parent=root){return add(new T.SphereGeometry(r,segments,Math.max(12,segments/2)),m,x,y,z,parent);}
 function roundShape(w,h,r){const s=new T.Shape(),x=-w/2,y=-h/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;}
 function solid(s,depth,m,x=0,y=0,z=0,parent=root,bevel=.035){return add(new T.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelSegments:mobile?2:3,steps:1,bevelSize:bevel,bevelThickness:bevel,curveSegments:mobile?10:18}),m,x,y,z-depth/2,parent);}
 function plate(w,h,d,r,m,x=0,y=0,z=0,parent=root){return solid(roundShape(w,h,r),d,m,x,y,z,parent);}
 function line(points,r,m,parent=root){return add(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),Math.max(8,points.length*4),r,mobile?6:10,false),m,0,0,0,parent);}
 function ring(r,t,m,x=0,y=0,z=0,parent=root){return add(new T.TorusGeometry(r,t,10,mobile?40:72),m,x,y,z,parent);}
 function chess(knight=true,parent=root){
  if(knight){
   const s=new T.Shape();s.moveTo(-.43,-.46);s.bezierCurveTo(-.49,-.06,-.11,.07,.02,.36);s.lineTo(-.32,.22);s.lineTo(-.52,.39);s.lineTo(-.22,.74);s.lineTo(.06,.85);s.lineTo(.14,1.06);s.lineTo(.35,.82);s.bezierCurveTo(.76,.49,.62,-.24,.4,-.46);s.closePath();
   solid(s,.25,ivory,0,-.12,0,parent,.04);sphere(.035,dark,-.04,.53,.18,parent);
   line([[.3,.6,.18],[.43,.25,.18],[.3,-.1,.18]],.012,silver,parent);
  }else{
   add(new T.CylinderGeometry(.33,.43,1.03,segments),ivory,0,-.03,0,parent);add(new T.CylinderGeometry(.44,.4,.16,segments),ivory,0,.55,0,parent);
   for(let i=0;i<4;i++){const a=i*Math.PI/2;box(.23,.27,.23,ivory,Math.cos(a)*.3,.72,Math.sin(a)*.3,parent);}
  }
  add(new T.CylinderGeometry(.51,.56,.14,segments),ivory,0,-.77,0,parent);add(new T.CylinderGeometry(.44,.49,.12,segments),silver,0,-.65,0,parent);
 }
 function calendar(){
  plate(1.58,1.67,.16,.1,ivory,0,-.02,0);
  plate(1.61,.38,.15,.07,material(0xd49d88),0,.64,.11);
  for(const x of [-.47,.47]){line([[x,.66,.25],[x,.95,.2],[x,.97,-.13],[x,.7,-.14]],.045,silver);}
  const colours=[material(0x9eb8c4),material(0xc2add0),material(0xb5c49c),material(0xddbc91)];
  for(let i=0;i<12;i++)plate(.25,.23,.06,.035,colours[i%4],-.5+i%4*.335,.22-Math.floor(i/4)*.34,.14);
  line([[.14,-.14,.21],[.21,-.21,.21],[.35,-.04,.21]],.022,ivory);
 }
 function cell(){
  const shell=material(0x81bcb1,{transparent:true,opacity:.32,metalness:.05,roughness:.18,depthWrite:false});
  const membrane=sphere(1,shell);membrane.scale.set(1,.79,.48);membrane.renderOrder=2;
  const contour=[];for(let i=0;i<=64;i++){const a=i/64*Math.PI*2;contour.push([Math.cos(a),Math.sin(a)*.79,.025]);}line(contour,.026,green);
  const nucleus=sphere(.32,purple,-.06,.01,.26);nucleus.scale.z=.8;sphere(.12,material(0x73618f),-.03,.02,.49);
  const organelle=material(0xd0b18a);
  for(const[x,y,a]of [[-.64,.22,.3],[.55,.33,-.4],[.58,-.33,.6],[-.37,-.45,-.2]]){
   const organ=new T.Group();organ.position.set(x,y,.22);organ.rotation.z=a;root.add(organ);const o=sphere(.15,organelle,0,0,0,organ);o.scale.set(1.5,.6,.5);
   line([[-.14,0,.07],[-.07,.035,.07],[0,-.035,.07],[.07,.035,.07],[.13,0,.07]],.013,gold,organ);
  }
  for(const[x,y]of [[-.4,.48],[.28,.56],[.34,-.57],[-.72,-.2]])sphere(.035,ivory,x,y,.15);
 }
 function temple(){
  box(1.95,.11,.85,ivory,0,-.76);box(1.78,.12,.72,ivory,0,-.64);
  for(const x of [-.63,-.21,.21,.63]){add(new T.CylinderGeometry(.105,.13,1.03,segments),ivory,x,-.05);box(.28,.09,.42,gold,x,.48);box(.28,.07,.42,ivory,x,-.54);}
  box(1.87,.14,.66,ivory,0,.58);
  const roof=new T.Shape();roof.moveTo(-1,.05);roof.lineTo(0,.58);roof.lineTo(1,.05);roof.closePath();solid(roof,.58,ivory,0,.62,0,root,.025);
  const inset=new T.Shape();inset.moveTo(-.68,0);inset.lineTo(0,.34);inset.lineTo(.68,0);inset.closePath();solid(inset,.03,gold,0,.73,.32,root,.01);
 }
 function robot(){
  plate(1.52,1.2,.49,.22,ivory,0,-.02,0);plate(1.22,.73,.09,.2,dark,0,-.02,.3);
  const glow=material(0x9bd7df,{emissive:0x60b9d4,emissiveIntensity:.6,metalness:0});
  for(const x of [-.32,.32])plate(.11,.25,.04,.045,glow,x,.03,.37);
  line([[-.13,-.2,.37],[0,-.26,.37],[.13,-.2,.37]],.023,glow);
  line([[0,.6,0],[0,.89,0]],.045,silver);sphere(.1,blue,0,.93);
  for(const x of [-.87,.87])plate(.17,.43,.3,.08,silver,x,-.02);
  box(.7,.1,.35,silver,0,-.72);
 }
 function map(){
  const paper=material(0xc6d8b9),crease=material(0x7a9b82);
  for(let i=0;i<3;i++){
   const panel=new T.Group();panel.position.x=(i-1)*.57;panel.rotation.y=i%2?-.28:.24;root.add(panel);
   plate(.56,1.48,.07,.025,paper,0,0,0,panel);
   for(let j=0;j<3;j++)line([[-.24,.36-j*.27,.07],[-.1,.46-j*.27,.07],[.09,.31-j*.27,.07],[.24,.43-j*.27,.07]],.013,crease,panel);
  }
  const pin=new T.Group();pin.position.set(.51,.38,.14);root.add(pin);ring(.13,.036,material(0xc48b72),0,.14,0,pin);line([[0,.02,0],[0,-.2,0]],.027,gold,pin);
 }
 function shield(){
  plate(1.65,1.15,.12,.07,ivory,0,.04,-.18);
  line([[-.72,.52,-.1],[0,-.06,-.1],[.72,.52,-.1]],.022,silver);
  const s=new T.Shape();s.moveTo(0,.81);s.lineTo(.64,.54);s.lineTo(.59,-.13);s.bezierCurveTo(.5,-.51,.19,-.76,0,-.86);s.bezierCurveTo(-.19,-.76,-.5,-.51,-.59,-.13);s.lineTo(-.64,.54);s.closePath();
  solid(s,.18,blue,0,0,.12,root,.04);line([[-.29,-.02,.27],[-.06,-.25,.27],[.34,.28,.27]],.052,ivory);
 }
 function plant(){
  add(new T.CylinderGeometry(.7,.6,.19,segments),material(0x7e9f82),0,-.77);add(new T.CylinderGeometry(.6,.65,.1,segments),gold,0,-.91);
  line([[0,-.7,0],[-.05,-.08,0],[.13,.68,0]],.04,green);
  function leaf(x,y,angle,scale){const s=new T.Shape();s.moveTo(0,0);s.bezierCurveTo(-.58,.25,-.52,.75,0,1);s.bezierCurveTo(.52,.75,.58,.25,0,0);const part=new T.Group();part.position.set(x,y,.04);part.rotation.z=angle;part.scale.setScalar(scale);root.add(part);solid(s,.055,green,0,0,0,part,.02);line([[0,.07,.06],[0,.82,.06]],.014,ivory,part);}
  leaf(-.03,-.2,.9,.82);leaf(.05,.06,-.85,.78);leaf(.12,.44,-.1,.48);
 }
 function globe(){
  sphere(.72,material(0x779fac,{roughness:.3,metalness:.32}));
  for(const a of [0,Math.PI/3,Math.PI*2/3]){const r=ring(.735,.012,ivory);r.rotation.y=a;}
  for(const y of [-.37,0,.37]){const r=ring(Math.sqrt(.735*.735-y*y),.012,ivory,0,y);r.rotation.x=Math.PI/2;}
  const arc=[];for(let i=0;i<=40;i++){const a=Math.PI*.25+i/40*Math.PI*1.15;arc.push([Math.cos(a)*.9,Math.sin(a)*.9,0]);}line(arc,.035,gold);
  line([[0,-.76,0],[0,-.99,0]],.07,silver);add(new T.CylinderGeometry(.47,.5,.1,segments),silver,0,-1.02);
  sphere(.06,gold,.38,.29,.58);
 }
 function chart(){
  plate(1.76,1.5,.14,.12,dark);line([[-.72,.5,.14],[-.72,-.57,.14],[.74,-.57,.14]],.025,silver);
  const up=material(0x80bda6),down=material(0xce968e);
  for(const[x,y,h,m]of [[-.43,-.14,.43,up],[-.03,.08,.54,up],[.36,.16,.29,down]]){box(.19,h,.15,m,x,y,.18);line([[x,y-h*.8,.18],[x,y+h*.8,.18]],.019,m);}
  line([[-.6,-.31,.31],[-.27,-.1,.31],[.08,-.18,.31],[.55,.52,.31]],.024,material(0xb5cfea));
 }
 function bubble(){
  const s=roundShape(1.76,1.18,.2);solid(s,.24,purple,0,.15);
  const tail=new T.Shape();tail.moveTo(-.58,-.36);tail.lineTo(-.61,-.83);tail.lineTo(-.08,-.36);tail.closePath();solid(tail,.23,purple,0,0,0,root,.025);
  for(const x of [-.43,0,.43])sphere(.085,ivory,x,.15,.19);
 }
 function radar(){
  const backing=add(new T.CylinderGeometry(.84,.84,.12,segments),dark,0,.08);backing.rotation.x=Math.PI/2;
  for(const r of [.3,.55,.81])ring(r,.015,green,0,.08,.09);
  line([[0,.08,.15],[.55,.65,.15]],.035,green);sphere(.07,ivory,.43,.43,.17);sphere(.045,gold,-.46,-.22,.17);
  box(.65,.16,.45,silver,0,-.88);box(.16,.25,.2,silver,0,-.72);
 }
 function browser(){
  plate(1.9,1.48,.16,.12,ivory);plate(1.92,.3,.13,.07,purple,0,.59,.1);
  [material(0xce9c96),gold,green].forEach((m,i)=>sphere(.04,m,-.7+i*.16,.6,.2));
  line([[-.31,.23,.14],[-.58,-.08,.14],[-.31,-.37,.14]],.045,blue);line([[.31,.23,.14],[.58,-.08,.14],[.31,-.37,.14]],.045,blue);line([[.13,.32,.14],[-.1,-.44,.14]],.036,blue);
 }
 const builders={chessbot:()=>chess(),chessprep:()=>{const board=new T.Group();board.position.set(0,-.36,-.14);board.rotation.x=-.25;root.add(board);plate(1.73,1.65,.1,.035,silver,0,0,0,board);for(let y=0;y<4;y++)for(let x=0;x<4;x++)box(.395,.375,.035,(x+y)%2?blue:ivory,(x-1.5)*.405,(y-1.5)*.385,.08,board);const piece=new T.Group();piece.scale.setScalar(.69);piece.position.set(.12,.25,.25);root.add(piece);chess(true,piece);},'club-palentino':()=>{chess(false);for(const sign of [-1,1]){line([[sign*.4,-.77,0],[sign*.84,-.12,0],[sign*.67,.63,0]],.018,gold);for(let i=0;i<6;i++){const leaf=sphere(.08,green,sign*(.67+Math.sin(i*.5)*.1),-.55+i*.2,.02);leaf.scale.set(.5,1.3,.4);leaf.rotation.z=sign*.6;}}},pipa:robot,mapforge:map,phishing:shield,deriva:plant,aquilae:temple,acuadros:calendar,'atlas-celular':cell,mapviewer:globe,trader:chart,chatbot:bubble,lidar:radar,'practica-web':browser};
 (builders[id]||browser)();
 root.rotation.set(.08,-.18,-.035);root.userData.kind=id in builders?id:'practica-web';root.userData.baseRotation=root.rotation.clone();
 return root;
}
