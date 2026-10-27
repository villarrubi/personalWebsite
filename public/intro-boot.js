// The portfolio opens immediately. The cinematic entrance is opt-in.
(() => {
  if(!['/','/en/','/es/','/index.html'].includes(location.pathname))return;
  const query=new URLSearchParams(location.search);
  const forced=['cinematic','knight','squares'].includes(query.get('intro'));
  if(!forced)return;
  document.documentElement.classList.add('intro-pending');
  window.chessIntroWatchdog=setTimeout(()=>document.documentElement.classList.remove('intro-pending'),12000);
})();
