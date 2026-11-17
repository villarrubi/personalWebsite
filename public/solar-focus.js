// Keep the preview and the selected orbital object in sync, including page changes.
export const orbitCapacity=width=>width<600?3:width<1000?4:6;

export function createOrbitFocus(root,motion){
 const body=root.querySelector('.solar-preview-body');
 const count=root.querySelector('.solar-preview-count');
 const previous=root.querySelector('[data-preview-step="-1"]');
 const next=root.querySelector('[data-preview-step="1"]');
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 let shown=[],selected=null,animation=null;
 function select(node,animate=true){
  if(!node||!shown.includes(node)||selected===node)return;
  const template=document.getElementById(`project-preview-${node.dataset.project}`);
  if(!template)return;
  selected=node;
  root.dataset.focusProject=node.dataset.project;
  root.style.setProperty('--focus-color',node.dataset.accent);
  root.querySelectorAll('.planet-node').forEach(item=>item.classList.toggle('is-featured',item===node));
  animation?.cancel();body.replaceChildren(template.content.cloneNode(true));
  count.textContent=`${String(shown.indexOf(node)+1).padStart(2,'0')} / ${String(shown.length).padStart(2,'0')}`;
  if(animate&&!preference.matches&&!motion.matches)animation=body.animate?.([{opacity:.35,transform:'translateY(7px)'},{opacity:1,transform:'translateY(0)'}],{duration:280,easing:'cubic-bezier(.2,.7,.2,1)'});
  root.dispatchEvent(new Event('solar:focus'));
 }
 for(const node of root.querySelectorAll('.planet-node')){
  node.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch')select(node);});
  node.addEventListener('focus',()=>select(node));
 }
 function step(direction){
  if(!shown.length)return;
  const index=shown.indexOf(selected);
  select(shown[(index+direction+shown.length)%shown.length]);
 }
 previous.addEventListener('click',()=>step(-1));next.addEventListener('click',()=>step(1));
 root.querySelector('.solar-preview-controls').hidden=false;
 return {update(nodes){
  shown=nodes;
  previous.disabled=next.disabled=shown.length<2;
  if(!shown.includes(selected))select(shown[0],false);
  else count.textContent=`${String(shown.indexOf(selected)+1).padStart(2,'0')} / ${String(shown.length).padStart(2,'0')}`;
  if(!shown.length){animation?.cancel();selected=null;root.querySelectorAll('.planet-node').forEach(node=>node.classList.toggle('is-featured',false));body.replaceChildren();count.textContent='00 / 00';delete root.dataset.focusProject;}
 }};
}
