// Before first paint: never flash the page underneath the opening. Fail open.
(() => {
  if(!['/','/en/','/es/','/index.html','/en/index.html','/es/index.html'].includes(location.pathname))return;
  const query=new URLSearchParams(location.search);
  const reloading=performance.getEntriesByType('navigation')[0]?.type==='reload';
  const forced=['cinematic','knight','squares'].includes(query.get('intro'));
  // Skip the curtain as well as the animation when reduced motion is requested.
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches&&query.get('motion')!=='on';
  if(!forced&&(query.get('intro')==='off'||query.get('motion')==='off'||reduced))return;
  if(forced||['','#top','#home'].includes(location.hash)||reloading){
    document.documentElement.classList.add('intro-pending');
    window.chessIntroWatchdog=setTimeout(()=>document.documentElement.classList.remove('intro-pending'),12000);
  }
})();
