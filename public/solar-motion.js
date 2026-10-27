// A closed ellipse, parameterised by travelled distance rather than angle.
// Packing is checked once for the whole revolution, never during animation.
export function createOrbitPaths(layout,width,height,major=true){
 const compact=width<600,labelWidth=compact?92:130,labelHeight=compact?47:75;
 const cx=width/2,cy=height/2,rx=Math.min(width*.36,width/2-labelWidth/2-10),ry=height*.32;
 const samples=4096,arc=[0];let length=0,lastX=rx,lastY=0;
 for(let i=1;i<=samples;i++){
  const a=i/samples*Math.PI*2,x=Math.cos(a)*rx,y=Math.sin(a)*ry;
  length+=Math.hypot(x-lastX,y-lastY);arc.push(length);lastX=x;lastY=y;
 }
 const angles=[];let cursor=0;
 for(let i=0;i<=samples;i++){
  const distance=i/samples*length;
  while(cursor<samples-1&&arc[cursor+1]<distance)cursor++;
  angles.push((cursor+(distance-arc[cursor])/(arc[cursor+1]-arc[cursor]))/samples*Math.PI*2);
 }
 const period=Math.max(90,length/13);
 let paths=[];
 for(let pass=0;pass<65;pass++){
  const scale=Math.pow(.95,pass);
  paths=layout.map((node,index)=>{
   const size=node.size*scale;
   return {...node,size,width:Math.max(labelWidth,size*1.17),height:size+labelHeight,cx,cy,rx,ry,angles,period,phase:index/layout.length-.36};
  });
  let fits=true;
  for(let sample=0;sample<360&&fits;sample++){
   const nodes=paths.map(p=>orbitPoint(p,sample/360*period));
   for(let i=0;i<nodes.length&&fits;i++){
    const a=nodes[i];
    if(a.x-a.width/2<8||a.x+a.width/2>width-8||a.y-a.height/2<8||a.y+a.height/2>height-8){fits=false;break;}
    for(const b of nodes.slice(i+1))if(Math.abs(a.x-b.x)<(a.width+b.width)/2+5&&Math.abs(a.y-b.y)<(a.height+b.height)/2+5){fits=false;break;}
   }
  }
  if(fits)return paths;
 }
 throw new Error('The orbit needs fewer projects per constellation.');
}

export function orbitPoint(path,time){
 const turn=((time/path.period+path.phase)%1+1)%1;
 const sample=turn*(path.angles.length-1),i=Math.floor(sample),f=sample-i;
 const angle=path.angles[i]+(path.angles[i+1]-path.angles[i])*f;
 return {...path,x:path.cx+Math.cos(angle)*path.rx,y:path.cy+Math.sin(angle)*path.ry};
}
