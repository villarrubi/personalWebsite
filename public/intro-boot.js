// Before first paint: never flash the page underneath the opening. Fail open.
(() => {
  if(!['/','/en/','/es/','/index.html'].includes(location.pathname))return;
  const query=new URLSearchParams(location.search);
  let motion;
  try{motion=sessionStorage.getItem('orbital-motion');}catch{}
  const reloading=performance.getEntriesByType('navigation')[0]?.type==='reload';
  const forced=['cinematic','knight','squares'].includes(query.get('intro'));
  if(!forced&&(matchMedia('(prefers-reduced-motion: reduce)').matches||query.get('motion')==='off'||(motion==='off'&&query.get('motion')!=='on')))return;
  if(forced||!location.hash||reloading){
    document.documentElement.classList.add('intro-pending');
    window.chessIntroWatchdog=setTimeout(()=>document.documentElement.classList.remove('intro-pending'),12000);
  }
})();
