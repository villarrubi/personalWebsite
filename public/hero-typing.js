// A small deterministic cycle; holding, erasing and writing share one timer.
export class WordCycle{
 constructor(words){this.words=words.map(word=>Array.from(word));this.index=0;this.complete();}
 get text(){return this.words[this.index].slice(0,this.length).join('');}
 complete(){this.length=this.words[this.index].length;this.phase='hold';this.delay=2400;}
 step(){
  if(this.phase==='hold')this.phase='erase';
  if(this.phase==='erase'){
   this.length=Math.max(0,this.length-1);this.delay=28;
   if(!this.length){this.phase='gap';this.delay=260;}
  }else{
   if(this.phase==='gap'){this.index=(this.index+1)%this.words.length;this.phase='type';}
   this.length++;this.delay=55;
   if(this.length===this.words[this.index].length)this.complete();
  }
  return this.text;
 }
}

if(typeof document!=='undefined'){
 const root=document.querySelector('[data-hero-typing]');
 if(root){
  const words=[...root.querySelectorAll('[data-typing-phrase]')].map(node=>node.textContent);
  const output=root.querySelector('[data-typed-text]'),button=root.querySelector('[data-typing-toggle]');
  const cycle=new WordCycle(words);
  const motionOff=new URLSearchParams(location.search).get('motion')==='off';
  let timer=0,paused=false,inView=false;
  const introActive=()=>['intro-pending','intro-playing'].some(name=>document.documentElement.classList.contains(name));
  const enabled=()=>!motionOff&&!paused&&!document.hidden&&inView&&!introActive();
  function stop(){clearTimeout(timer);timer=0;root.classList.remove('is-typing');}
  function schedule(){
   if(!enabled())return;
   root.classList.add('is-typing');
   let due=performance.now()+cycle.delay;
   function tick(){
    timer=0;if(!enabled()){stop();return;}
    const now=performance.now();let steps=0;
    // Keep the writing speed when a canvas frame is expensive, but always
    // give a completed phrase its full reading pause. Bound catch-up work.
    while(due<=now&&steps<12){
     cycle.step();steps++;due+=cycle.delay;
     if(cycle.phase==='hold'){due=now+cycle.delay;break;}
    }
    if(steps===12)due=now+cycle.delay;
    output.textContent=cycle.text;
    timer=setTimeout(tick,Math.max(0,due-performance.now()));
   }
   timer=setTimeout(tick,cycle.delay);
  }
  function sync(){
   stop();
   if(motionOff||paused){cycle.complete();output.textContent=cycle.text;}
   button.hidden=motionOff;
   const label=paused?button.dataset.resume:button.dataset.pause;
   button.setAttribute('aria-label',label);button.title=label;
   root.classList.toggle('is-paused',paused);
   schedule();
  }
  button.addEventListener('click',()=>{paused=!paused;sync();});
  document.addEventListener('visibilitychange',sync);
  document.addEventListener('intro:end',sync);
  addEventListener('pagehide',stop);
  addEventListener('pageshow',sync);
  if('IntersectionObserver'in window){
   new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;sync();}).observe(root);
  }else inView=true;
  sync();
 }
}
