import {introPose, INTRO_DURATION} from './chess-timeline.js';
import {sceneMotion} from './scene-motion.js';

const host=document.querySelector('[data-chess-stage]');
const es=document.documentElement.lang==='es';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const requested=new URLSearchParams(location.search).get('intro');
const forced=['cinematic','squares','knight'].includes(requested);
const controls=[...document.querySelectorAll('[data-intro]')];
let scene,loading,active,disposed=false;

function clearPending(){document.documentElement.classList.remove('intro-pending');clearTimeout(window.chessIntroWatchdog);}
async function getScene(){
  if(scene)return scene;
  if(!loading)loading=import('./chess-scene.js').then(module=>module.createChessScene(document.querySelector('.chess-canvas'))).then(result=>{
    if(disposed){result.dispose();return null;}
    scene=result;host.classList.add('chess-ready');
    if(!active)scene.render({pitch:Math.PI/2,yaw:0,dock:1});
    return scene;
  }).catch(error=>{
    host.dataset.render='fallback';
    console.warn('Chess scene unavailable; static board retained.',error);
    return null;
  });
  return loading;
}
function seen(){try{if(localStorage.getItem('chess-opening-seen')==='1')return true;}catch{}try{return sessionStorage.getItem('chess-opening-seen')==='1';}catch{return false;}}
function remember(){try{localStorage.setItem('chess-opening-seen','1');}catch{}try{sessionStorage.setItem('chess-opening-seen','1');}catch{}}

async function playIntro(trigger){
  if(active||!host||disposed)return;
  const still=!trigger&&!forced&&(reduced.matches||sceneMotion.matches);
  const overlay=document.createElement('div');overlay.className='chess-intro';
  overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');
  overlay.setAttribute('aria-label',es?'Animación de entrada. Tablero de ajedrez.':'Entrance animation. Chessboard.');
  overlay.innerHTML=`<div class="intro-curtain"></div><div class="intro-meta"><span>av.</span><span>SOFTWARE / ${es?'IA LOCAL':'LOCAL AI'} / HARDWARE</span></div><div class="intro-caption"><span>ALEJANDRO VILLARRUBIA</span><p>${es?'Curiosidad para construir.':'Curiosity to build.'}</p></div><div class="intro-progress" aria-hidden="true"><i></i></div><button class="intro-skip" type="button">${es?'Saltar intro':'Skip intro'} <span aria-hidden="true">↗</span></button>`;
  const mount=host.querySelector('.chess-canvas');
  const previousFocus=document.activeElement,previousOverflow=document.body.style.overflow;
  const previousScroll=scrollY;
  const underlying=[...document.body.children].filter(el=>el.tagName!=='SCRIPT');
  const inertStates=underlying.map(el=>el.inert);
  document.body.style.overflow='hidden';
  document.documentElement.classList.add('intro-playing');
  // One canvas moves into the modal, then returns to its exact hero rectangle.
  document.body.append(overlay);overlay.append(mount);
  underlying.forEach(el=>el.inert=true);
  Object.assign(mount.style,{position:'fixed',left:'0px',top:'0px',width:'100vw',height:'100dvh'});
  const skip=overlay.querySelector('.intro-skip');
  let raf=0,watchdog,elapsed=0,last=0,started=false,finished=false;
  const finish=()=>{
    if(finished)return;finished=true;
    cancelAnimationFrame(raf);clearTimeout(watchdog);
    document.removeEventListener('keydown',key);document.removeEventListener('visibilitychange',visibility);
    host.prepend(mount);mount.removeAttribute('style');overlay.remove();
    document.body.style.overflow=previousOverflow;
    underlying.forEach((el,i)=>el.inert=inertStates[i]);
    document.documentElement.classList.remove('intro-playing');clearPending();
    scene?.render({pitch:Math.PI/2,yaw:0,dock:1});
    active=null;remember();
    if(trigger)previousFocus?.focus({preventScroll:true});
    else if(document.activeElement===document.body)document.querySelector('.hero-actions .primary')?.focus({preventScroll:true});
    document.dispatchEvent(new Event('chess:intro-end'));
  };
  const key=event=>{if(event.key==='Escape')finish();if(event.key==='Tab'){event.preventDefault();skip.focus({preventScroll:true});}};
  const visibility=()=>{last=0;if(document.hidden){cancelAnimationFrame(raf);}else if(started&&!finished){raf=requestAnimationFrame(frame);}};
  active={finish};watchdog=setTimeout(finish,14000);
  skip.addEventListener('click',finish);document.addEventListener('keydown',key);document.addEventListener('visibilitychange',visibility);
  skip.focus({preventScroll:true});clearPending();
  const renderScene=await getScene();
  if(finished)return;
  if(!renderScene){finish();return;}
  if(trigger&&previousScroll>20)window.scrollTo({top:0,left:0,behavior:'instant'});
  overlay.classList.add('is-ready');started=true;
  function frame(now){
    if(finished||document.hidden)return;
    if(last)elapsed+=Math.min(now-last,80);last=now;
    const pose=still?{pitch:Math.PI/2,yaw:0,dock:1,curtain:1-Math.min(1,elapsed/650),progress:1}:introPose(elapsed);
    const target=host.getBoundingClientRect();
    // On short or narrow screens the destination may be below the fold. Fade
    // overhead there instead of sending the board flying out of the viewport.
    const inView=target.top>=0&&target.bottom<=innerHeight;
    const d=inView?pose.dock:0,w=innerWidth+(target.width-innerWidth)*d,h=innerHeight+(target.height-innerHeight)*d;
    Object.assign(mount.style,{left:`${target.left*d}px`,top:`${target.top*d}px`,width:`${w}px`,height:`${h}px`});
    mount.style.opacity=inView?'1':String(pose.curtain);
    overlay.querySelector('.intro-curtain').style.opacity=pose.curtain;
    overlay.querySelector('.intro-meta').style.opacity=pose.curtain;
    overlay.querySelector('.intro-caption').style.opacity=pose.curtain;
    overlay.querySelector('.intro-progress i').style.transform=`scaleX(${pose.progress})`;
    renderScene.render(pose,w,h);
    if(elapsed>=(still?650:INTRO_DURATION))finish();else raf=requestAnimationFrame(frame);
  }
  raf=requestAnimationFrame(frame);
}

if(host){
  controls.forEach(button=>button.addEventListener('click',()=>playIntro(button)));
  host.querySelector('.chess-canvas').addEventListener('chess:lost',()=>{active?.finish();host.classList.remove('chess-ready');scene?.dispose();scene=null;loading=null;});
  const observer=new ResizeObserver(()=>{if(!active)scene?.render();});observer.observe(host);
  const motionChanged=()=>{if(reduced.matches||sceneMotion.matches)active?.finish();};
  reduced.addEventListener('change',motionChanged);sceneMotion.addEventListener('change',motionChanged);
  if(forced||(!seen()&&!location.hash&&!reduced.matches&&!sceneMotion.matches))playIntro();
  else {if(seen())remember();clearPending();getScene();}
  window.addEventListener('pagehide',event=>{
    active?.finish();
    if(!event.persisted){disposed=true;observer.disconnect();scene?.dispose();}
  });
  window.addEventListener('pageshow',event=>{if(event.persisted&&!active)scene?.render();});
}else clearPending();
