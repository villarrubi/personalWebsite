export const INTRO_DURATION = 4800;
export const smooth = value => { const t = Math.max(0, Math.min(1, value)); return t*t*t*(t*(t*6-15)+10); };
export function introPose(elapsed) {
  const turn = smooth((elapsed - 650) / 2250);
  const dock = smooth((elapsed - 3000) / 1800);
  return {pitch:.19+(Math.PI/2-.19)*turn, yaw:.28*(1-turn), dock,
    curtain:1-smooth((elapsed-3100)/1600), progress:Math.min(1,Math.max(0,elapsed/INTRO_DURATION))};
}

// Fit the entire set, not just the board centre, through every camera angle.
export function cameraFrame(pitch,yaw,aspect) {
  const cp=Math.cos(pitch),sp=Math.sin(pitch),cy=Math.cos(yaw),sy=Math.sin(yaw);
  const forward=[sy*cp,sp,cy*cp],right=[cy,0,-sy],up=[-sy*sp,cp,-cy*sp];
  const targetY=.6*(1-sp),tan=Math.tan(16*Math.PI/180);
  let distance=0;
  for(const x of [-4.45,4.45])for(const y of [-.14,1.85])for(const z of [-4.45,4.45]){
    const p=[x,y-targetY,z],dot=v=>p.reduce((sum,n,i)=>sum+n*v[i],0),depth=dot(forward);
    distance=Math.max(distance,depth+Math.abs(dot(right))*1.13/(tan*aspect),depth+Math.abs(dot(up))*1.16/tan);
  }
  return {position:forward.map((n,i)=>n*distance+(i===1?targetY:0)),up,target:[0,targetY,0]};
}
