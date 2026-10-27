// Select the saved view before first paint, including language navigation.
(() => {
 let saved;try{saved=sessionStorage.getItem('project-view');}catch{}
 const orbits=location.hash!=='#archive'&&(saved==='orbits'||location.hash==='#complementary');
 document.documentElement.dataset.projectView=orbits?'orbits':'cards';
 // If the module cannot start, expose the complete, navigable card archive.
 window.projectViewWatchdog=setTimeout(()=>{document.documentElement.dataset.projectView='cards';},6000);
})();
