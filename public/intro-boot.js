// Before first paint: never flash the page underneath the opening. Fail open.
(() => {
  if(!['/','/en/','/es/','/index.html','/en/index.html','/es/index.html'].includes(location.pathname))return;
  const query=new URLSearchParams(location.search);
  // Every open, refresh and history return plays the entrance; only an explicit
  // `?intro=off` or `?motion=off` link skips it.
  if(query.get('intro')==='off'||query.get('motion')==='off')return;
  const root=document.documentElement;
  root.classList.add('intro-pending');
  // Start the heavy entrance downloads with the HTML instead of after the module graph.
  try{
    for(const href of ['/chess-scene.js','/chess-model.js','/staunton-assets.js','/chess-code.js','/assets/vendor/three.module.js','/assets/vendor/three.core.min.js']){
      const link=document.createElement('link');link.rel='modulepreload';link.href=href;document.head.append(link);
    }
    const geometry=document.createElement('link');
    Object.assign(geometry,{rel:'preload',href:'/assets/chess/staunton.bin',as:'fetch',crossOrigin:'anonymous'});
    document.head.append(geometry);
  }catch{}
  // Fail open after 12 s of visible time; a background tab must not use up the budget.
  let remaining=12000,since=0,timer=0;
  const release=()=>{root.classList.remove('intro-pending');document.removeEventListener('visibilitychange',sync);};
  const sync=()=>{
    if(!root.classList.contains('intro-pending'))return release();
    if(document.hidden){if(timer){clearTimeout(timer);timer=0;remaining-=Date.now()-since;}}
    else if(!timer){since=Date.now();timer=setTimeout(release,Math.max(0,remaining));}
    window.chessIntroWatchdog=timer;
  };
  document.addEventListener('visibilitychange',sync);sync();
})();
