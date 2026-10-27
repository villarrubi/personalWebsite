import './solar-system.js';

const dialog = document.querySelector('.map-dialog');
if (dialog && typeof dialog.showModal === 'function') {
  const body = dialog.querySelector('.map-dialog-body');
  let opener;
  const close = () => dialog.close();
  for (const link of document.querySelectorAll('[data-project]')) {
    link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
      const template = document.getElementById(`project-info-${link.dataset.project}`);
      if (!template) return;
      event.preventDefault();
      opener = link;
      body.replaceChildren(template.content.cloneNode(true));
      dialog.showModal();
      dialog.scrollTop = 0;
      document.documentElement.classList.add('project-dialog-open');
      dialog.querySelector('button').focus({ preventScroll: true });
    });
  }
  dialog.querySelector('.map-dialog-close').addEventListener('click', close);
  // Native dialog handles Escape and keeps keyboard focus inside the modal.
  dialog.addEventListener('click', event => { if (event.target === dialog) {
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) close();
  }});
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('project-dialog-open');
    opener?.focus({ preventScroll: true });
  });
} else {
  document.querySelectorAll('[data-project]').forEach(link => link.removeAttribute('aria-haspopup'));
}
