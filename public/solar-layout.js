// Fit a constellation automatically in the available screen, including readable labels.
export function layoutPlanets(items,width,height,major=true,phase=0){
 if(!items.length)return [];
 const count=items.length,compact=width<600;
 const labelWidth=compact?92:130,labelHeight=compact?47:75;
 const golden=Math.PI*(3-Math.sqrt(5));
 const base=Math.min(major?225:185,Math.sqrt(width*height/(count*4.4)));
 for(let pass=0;pass<12;pass++){
  const size=base*Math.pow(.91,pass);
  const nodes=items.map((p,i)=>{
   const diameter=size*[1.12,.88,1.02,.83,.94,1][i%6];
   const angle=-Math.PI*.72+i*Math.PI*2/count+Math.sin(i*golden)*.1+phase;
   const radius=.88+Math.sin(i*2.1)*.1;
   return{id:p.id,x:width/2+Math.cos(angle)*width*.34*radius,y:height*.47+Math.sin(angle)*height*.28*radius,size:diameter,width:Math.max(labelWidth,diameter*1.17),height:diameter+labelHeight};
  });
  for(let step=0;step<260;step++){
   let overlaps=0;
   for(let i=0;i<count;i++)for(let j=i+1;j<count;j++){
    const a=nodes[i],b=nodes[j],dx=b.x-a.x,dy=b.y-a.y;
    const ox=(a.width+b.width)/2+10-Math.abs(dx),oy=(a.height+b.height)/2+10-Math.abs(dy);
    if(ox>0&&oy>0){
     overlaps++;
     if(ox<oy){const push=(ox/2+.2)*(dx>=0?1:-1);a.x-=push;b.x+=push;}
     else{const push=(oy/2+.2)*(dy>=0?1:-1);a.y-=push;b.y+=push;}
    }
   }
   for(const n of nodes){n.x=Math.max(n.width/2+9,Math.min(width-n.width/2-9,n.x));n.y=Math.max(n.height/2+12,Math.min(height-n.height/2-14,n.y));}
   const separated=nodes.every((a,i)=>nodes.slice(i+1).every(b=>Math.abs(a.x-b.x)>=(a.width+b.width)/2+8||Math.abs(a.y-b.y)>=(a.height+b.height)/2+8));
   if(!overlaps&&separated)return nodes;
  }
 }
 // The controller splits dense collections into automatic constellations before layout.
 throw new Error('The constellation needs more space.');
}
