// Before first paint: never flash the page underneath the opening. Fail open.
(() => {
  if(!['/','/en/','/es/','/index.html'].includes(location.pathname))return;
  const query=new URLSearchParams(location.search);
  let motion;
  try{motion=sessionStorage.getItem('orbital-motion');}catch{}
  if(['on','off'].includes(query.get('motion')))motion=query.get('motion');
  const reloading=performance.getEntriesByType('navigation')[0]?.type==='reload';
  const forced=['cinematic','knight','squares'].includes(query.get('intro'));
  if(!forced&&(motion==='off'||(motion!=='on'&&matchMedia('(prefers-reduced-motion: reduce)').matches)))return;
  if(forced||!location.hash||reloading){
    document.documentElement.classList.add('intro-pending');
    window.chessIntroWatchdog=setTimeout(()=>document.documentElement.classList.remove('intro-pending'),12000);
  }
})();
