export const ORBIT_INTERVAL=3500;
export const ORBIT_TURN_DURATION=900;
export const wrapIndex=(index,count)=>count?((index%count)+count)%count:0;
const ease=t=>t*t*(3-2*t);

// An unwrapped position preserves direction across the first/last project.
export class OrbitCarousel{
 constructor(count){this.count=count;this.position=0;this.target=0;this.from=0;this.elapsed=0;this.autoElapsed=0;this.moving=false;}
 get index(){return wrapIndex(Math.round(this.position),this.count);}
 resetTimer(){this.autoElapsed=0;}
 settle(){this.position=this.target;this.moving=false;this.resetTimer();}
 step(direction,animate=true){
  if(this.count<2)return;
  this.from=this.position;this.target+=direction<0?-1:1;this.elapsed=0;this.resetTimer();
  this.moving=animate;if(!animate)this.position=this.target;
 }
 select(index,animate=true){
  if(!this.count)return;
  let distance=wrapIndex(index-wrapIndex(this.target,this.count),this.count);
  if(distance>this.count/2)distance-=this.count;
  this.from=this.position;this.target+=distance;this.elapsed=0;this.resetTimer();
  this.moving=animate&&this.position!==this.target;if(!this.moving)this.position=this.target;
 }
 tick(delta,{auto=false,animate=true}={}){
  const previous=this.position;
  if(this.moving){
   this.elapsed=Math.min(ORBIT_TURN_DURATION,this.elapsed+delta);
   this.position=this.from+(this.target-this.from)*ease(this.elapsed/ORBIT_TURN_DURATION);
   if(this.elapsed===ORBIT_TURN_DURATION)this.moving=false;
  }
  if(auto&&this.count>1){
   this.autoElapsed+=delta;
   if(this.autoElapsed>=ORBIT_INTERVAL)this.step(1,animate);
  }else this.resetTimer();
  return this.position!==previous;
 }
}

export const orbitCapacity=width=>Math.max(7,Math.min(19,2*Math.floor((width/80-1)/2)+1));

// Stable per-project phases keep the scene alive between carousel turns.
export function orbitDrift(id,time,pointer={x:0,y:0},foreground=1){
 let seed=0;for(const char of id)seed=(seed*31+char.charCodeAt(0))>>>0;
 const phase=seed%628/100;
 return {x:Math.sin(time*.43+phase)*3+pointer.x*(6+foreground*12),
  y:Math.sin(time*.58+phase)*5+pointer.y*(3+foreground*9),
  roll:Math.sin(time*.37+phase)*1.4,tilt:Math.sin(time*.46+phase)*.14};
}

export function orbitSlot(angle,width,height,slots=7){
 const foreground=(Math.cos(angle)+1)/2,compact=width<600;
 const frontSize=Math.min(compact?width*.66:width*.35,height*.59,340);
 const rearScale=Math.max(.14,.24*7/Math.max(7,slots));
 const size=frontSize*(rearScale+(1-rearScale)*Math.pow(foreground,4));
 const x=width*.5+Math.sin(angle)*width*.34;
 const bodyY=height*(.34+.22*Math.cos(angle)+.055*Math.sin(angle));
 const labelHeight=compact?42:58;
 return {x,y:bodyY+labelHeight/2,bodyY,size,width:Math.max(size,compact?76:105),height:size+labelHeight,
  depth:-10+foreground*18,foreground,opacity:.38+.62*Math.pow(foreground,2)};
}

export function carouselLayout(items,width,height,position,ambient=null){
 const count=items.length,slots=Math.min(orbitCapacity(width),count);
 if(!count)return [];
 return items.map((item,index)=>{
  let offset=wrapIndex(index-position+count/2,count)-count/2;
  const visible=count<=slots||Math.abs(offset)<slots/2;
  const baseAngle=slots===1?0:offset*Math.PI*2/slots;
  // Open space around the protagonist; smaller projects share the rear arc.
  const angle=slots>7?2*Math.atan(Math.tan(baseAngle/2)*slots/7):baseAngle;
  const layout=orbitSlot(angle,width,height,slots);
  const drift=ambient?orbitDrift(item.id,ambient.time,ambient.pointer,layout.foreground):{x:0,y:0,roll:0,tilt:0};
  const edge=count<=slots?1:Math.max(0,Math.min(1,(slots/2-Math.abs(offset))*2));
  return {...layout,x:layout.x+drift.x,y:layout.y+drift.y,bodyY:layout.bodyY+drift.y,
   roll:drift.roll,tilt:drift.tilt,id:item.id,index,offset,visible,opacity:layout.opacity*edge};
 });
}
