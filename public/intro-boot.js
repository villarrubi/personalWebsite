// Before first paint: never flash the page underneath the opening. Fail open.
(() => {
  if(!['/','/en/','/es/','/index.html'].includes(location.pathname))return;
  const query=new URLSearchParams(location.search);
  let seen=false,motion;
  try{seen=localStorage.getItem('chess-opening-seen')==='1';}catch{}
  try{seen=seen||sessionStorage.getItem('chess-opening-seen')==='1';motion=sessionStorage.getItem('orbital-motion');}catch{}
  const forced=['cinematic','knight','squares'].includes(query.get('intro'));
  if(!forced&&(matchMedia('(prefers-reduced-motion: reduce)').matches||query.get('motion')==='off'||(motion==='off'&&query.get('motion')!=='on')))return;
  if(forced||(!seen&&!location.hash)){
    document.documentElement.classList.add('intro-pending');
    window.chessIntroWatchdog=setTimeout(()=>document.documentElement.classList.remove('intro-pending'),12000);
  }
})();
