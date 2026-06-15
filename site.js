(function () {
  'use strict';

  // ── Lightbox ──────────────────────────────────────────────────────────────
  var overlay = document.getElementById('lightbox');
  if (!overlay) return;

  var img   = document.getElementById('lightbox-img');
  var close = document.getElementById('lightbox-close');

  document.querySelectorAll('[data-lightbox]').forEach(function (el) {
    el.addEventListener('click', function () {
      img.src = el.src;
      img.alt = el.alt;
      overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeLightbox() {
    overlay.classList.remove('is-open');
    img.src = '';
    document.body.style.overflow = '';
  }

  close.addEventListener('click', closeLightbox);

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeLightbox();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeLightbox();
  });
}());
