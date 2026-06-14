// utils.js

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const backdrop = document.getElementById('modalBackdrop');
  const observer = new MutationObserver(() => {
    const anyOpen = document.querySelectorAll('.modal:not(.hidden)').length > 0;
    backdrop.classList.toggle('hidden', !anyOpen);
  });
  document.querySelectorAll('.modal').forEach(m => {
    observer.observe(m, { attributes: true, attributeFilter: ['class'] });
  });
});
