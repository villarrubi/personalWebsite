// Native page transitions are optional. A browser may cancel one during reload,
// back/forward restoration or a fast second navigation; content stays navigable.
for (const name of ['pageswap', 'pagereveal']) {
  window.addEventListener(name, event => {
    const transition = event.viewTransition;
    if (!transition) return;
    transition.ready.catch(() => {
      if (name === 'pagereveal') document.documentElement.classList.add('transition-fallback');
    });
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) transition.skipTransition();
  });
}
