// The preview follows the project physically arriving at the front of the orbit.
export function createOrbitFocus(root,motion){
 const body=root.querySelector('.solar-preview-body');
 const count=root.querySelector('.solar-carousel-count');
 let selected=null,animation=null,resumePreview=false;
 motion.addEventListener('change',()=>{
  if(motion.matches){resumePreview=animation?.playState==='running';if(resumePreview)animation.pause();}
  else if(resumePreview){animation.play();resumePreview=false;}
 });
 return {update(nodes,index=0,animate=true){
  const node=nodes[index];
  count.textContent=nodes.length?`${String(index+1).padStart(2,'0')} / ${String(nodes.length).padStart(2,'0')}`:'00 / 00';
  if(node===selected)return;
  selected=node;animation?.cancel();animation=null;resumePreview=false;
  root.querySelectorAll('.planet-node').forEach(item=>item.classList.toggle('is-featured',item===node));
  if(!node){body.replaceChildren();delete root.dataset.focusProject;return;}
  const template=document.getElementById(`project-preview-${node.dataset.project}`);
  if(!template)return;
  root.dataset.focusProject=node.dataset.project;root.style.setProperty('--focus-color',node.dataset.accent);
  body.replaceChildren(template.content.cloneNode(true));
  if(animate&&!motion.matches)animation=body.animate?.([{opacity:0,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],{duration:300,easing:'ease-out'});
  root.dispatchEvent(new Event('solar:focus'));
 }};
}
