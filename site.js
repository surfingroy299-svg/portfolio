(function () {
  'use strict';

  // ── Lightbox with zoom & pan ──────────────────────────────────────────────
  // One shared implementation for every [data-lightbox] image on the site.
  // Markup per page stays minimal: #lightbox > #lightbox-close + #lightbox-img.
  // The viewport wrapper and zoom bar are injected here so future pages that
  // reuse the same markup get the full experience automatically.

  var overlay = document.getElementById('lightbox');
  if (!overlay) return;

  var img   = document.getElementById('lightbox-img');
  var close = document.getElementById('lightbox-close');

  var MIN = 1, MAX = 4, STEP = 0.25, DBL = 2.5;

  // ── Injected structure ────────────────────────────────────────────────────
  var viewport = document.createElement('div');
  viewport.className = 'lightbox-viewport';
  overlay.insertBefore(viewport, img);
  viewport.appendChild(img);

  var errorBox = document.createElement('p');
  errorBox.className = 'lightbox-error';
  errorBox.textContent = 'This image could not be loaded.';
  errorBox.hidden = true;
  viewport.appendChild(errorBox);

  var bar = document.createElement('div');
  bar.className = 'lightbox-zoombar';
  bar.innerHTML =
    '<button type="button" class="lightbox-zoombtn" data-zoom="out" aria-label="Zoom out">&minus;</button>' +
    '<input type="range" class="lightbox-slider" min="100" max="400" step="5" value="100" aria-label="Zoom level">' +
    '<button type="button" class="lightbox-zoombtn" data-zoom="in" aria-label="Zoom in">+</button>' +
    '<span class="lightbox-percent" aria-hidden="true">100%</span>' +
    '<button type="button" class="lightbox-fit" aria-label="Fit image to screen">Fit</button>';
  overlay.appendChild(bar);

  var btnOut  = bar.querySelector('[data-zoom="out"]');
  var btnIn   = bar.querySelector('[data-zoom="in"]');
  var slider  = bar.querySelector('.lightbox-slider');
  var percent = bar.querySelector('.lightbox-percent');
  var btnFit  = bar.querySelector('.lightbox-fit');

  // ── State ─────────────────────────────────────────────────────────────────
  var scale = 1, tx = 0, ty = 0;
  var fitW = 0, fitH = 0;
  var pending = false;
  var lastFocus = null;
  var isOpen = false;

  function measureFit() {
    var r = img.getBoundingClientRect();
    fitW = r.width / scale;
    fitH = r.height / scale;
  }

  function clamp() {
    var vp = viewport.getBoundingClientRect();
    var maxX = Math.max(0, (fitW * scale - vp.width)  / 2);
    var maxY = Math.max(0, (fitH * scale - vp.height) / 2);
    tx = Math.min(maxX, Math.max(-maxX, tx));
    ty = Math.min(maxY, Math.max(-maxY, ty));
  }

  function render() {
    img.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + scale + ')';
    var pct = Math.round(scale * 100);
    slider.value = pct;
    slider.setAttribute('aria-valuetext', pct + '%');
    percent.textContent = pct + '%';
    btnOut.disabled = scale <= MIN + 0.001;
    btnIn.disabled  = scale >= MAX - 0.001;
    viewport.classList.toggle('is-zoomed', scale > 1.001);
  }

  // Batches high-frequency updates to one render per frame. A short timeout
  // races the rAF so rendering still happens in contexts where rAF is
  // suspended (hidden or offscreen tabs).
  function schedule() {
    if (pending) return;
    pending = true;
    var done = function () {
      if (!pending) return;
      pending = false;
      render();
    };
    requestAnimationFrame(done);
    setTimeout(done, 40);
  }

  // Zoom keeping the viewport point (px,py — relative to viewport centre) fixed.
  function setScale(next, px, py, animate) {
    next = Math.min(MAX, Math.max(MIN, next));
    if (px === undefined) { px = 0; py = 0; }
    tx = px - (next / scale) * (px - tx);
    ty = py - (next / scale) * (py - ty);
    scale = next;
    clamp();
    if (animate) animateOnce();
    schedule();
  }

  function animateOnce() {
    img.classList.add('is-anim');
    setTimeout(function () { img.classList.remove('is-anim'); }, 200);
  }

  function resetView(animate) {
    scale = 1; tx = 0; ty = 0;
    if (animate) animateOnce();
    schedule();
  }

  function pointFromEvent(e) {
    var vp = viewport.getBoundingClientRect();
    return {
      x: e.clientX - vp.left - vp.width  / 2,
      y: e.clientY - vp.top  - vp.height / 2
    };
  }

  // ── Open / close ──────────────────────────────────────────────────────────
  function openLightbox(el) {
    lastFocus = el;
    scale = 1; tx = 0; ty = 0;
    errorBox.hidden = true;
    img.hidden = false;
    img.style.transform = '';
    img.alt = el.alt || '';
    viewport.classList.add('is-loading');
    img.src = el.currentSrc || el.src;
    if (img.complete && img.naturalWidth > 0) onImgLoad();
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    isOpen = true;
    render();
    close.focus();
  }

  function onImgLoad() {
    viewport.classList.remove('is-loading');
    measureFit();
    schedule();
  }

  function onImgError() {
    if (!isOpen) return;
    viewport.classList.remove('is-loading');
    img.hidden = true;
    errorBox.hidden = false;
  }

  img.addEventListener('load', onImgLoad);
  img.addEventListener('error', onImgError);

  function closeLightbox() {
    overlay.classList.remove('is-open');
    img.src = '';
    img.style.transform = '';
    viewport.classList.remove('is-loading', 'is-zoomed', 'is-panning');
    document.body.style.overflow = '';
    isOpen = false;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
    lastFocus = null;
  }

  // ── Triggers: delegated, keyboard-accessible ──────────────────────────────
  document.querySelectorAll('[data-lightbox]').forEach(function (el) {
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
  });

  document.addEventListener('click', function (e) {
    var el = e.target.closest ? e.target.closest('[data-lightbox]') : null;
    if (el) openLightbox(el);
  });

  document.addEventListener('keydown', function (e) {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('[data-lightbox]')) {
      e.preventDefault();
      openLightbox(e.target);
    }
  });

  close.addEventListener('click', closeLightbox);

  // ── Controls ──────────────────────────────────────────────────────────────
  btnIn.addEventListener('click',  function () { setScale(scale + STEP, 0, 0, true); });
  btnOut.addEventListener('click', function () { setScale(scale - STEP, 0, 0, true); });
  btnFit.addEventListener('click', function () { resetView(true); });
  slider.addEventListener('input', function () { setScale(slider.value / 100, 0, 0, false); });

  // ── Wheel / trackpad zoom, anchored at pointer ────────────────────────────
  viewport.addEventListener('wheel', function (e) {
    e.preventDefault();
    var p = pointFromEvent(e);
    setScale(scale * Math.exp(-e.deltaY * 0.0015), p.x, p.y, false);
  }, { passive: false });

  // ── Pointer: drag to pan, pinch to zoom, double-tap ───────────────────────
  var pointers = new Map();
  var pinchDist = 0;
  var moved = 0;
  var lastTap = { t: 0, x: 0, y: 0 };
  var lastDblTap = 0;

  viewport.addEventListener('pointerdown', function (e) {
    if (e.target === close || bar.contains(e.target)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    moved = 0;
    if (pointers.size === 2) {
      var pts = Array.from(pointers.values());
      pinchDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
    } else if (scale > 1.001) {
      viewport.classList.add('is-panning');
    }
    try { viewport.setPointerCapture(e.pointerId); } catch (err) { /* pointer already gone */ }
  });

  viewport.addEventListener('pointermove', function (e) {
    if (!pointers.has(e.pointerId)) return;
    var prev = pointers.get(e.pointerId);
    var dx = e.clientX - prev.x, dy = e.clientY - prev.y;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    moved += Math.abs(dx) + Math.abs(dy);

    if (pointers.size === 2) {
      var pts = Array.from(pointers.values());
      var dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      var vp = viewport.getBoundingClientRect();
      var mx = (pts[0].x + pts[1].x) / 2 - vp.left - vp.width / 2;
      var my = (pts[0].y + pts[1].y) / 2 - vp.top - vp.height / 2;
      if (pinchDist > 0) setScale(scale * (dist / pinchDist), mx, my, false);
      pinchDist = dist;
    } else if (pointers.size === 1 && scale > 1.001) {
      tx += dx; ty += dy;
      clamp();
      schedule();
    }
  });

  function endPointer(e) {
    if (!pointers.has(e.pointerId)) return;
    pointers.delete(e.pointerId);
    pinchDist = 0;
    if (pointers.size === 0) viewport.classList.remove('is-panning');

    if (e.type === 'pointerup' && moved < 6 && pointers.size === 0 && e.pointerType === 'touch') {
      // Double-tap zoom for touch
      var now = Date.now();
      if (now - lastTap.t < 350 && Math.hypot(e.clientX - lastTap.x, e.clientY - lastTap.y) < 24) {
        var p = pointFromEvent(e);
        if (scale > 1.001) resetView(true); else setScale(DBL, p.x, p.y, true);
        lastTap.t = 0;
        lastDblTap = now;
        return;
      }
      lastTap = { t: now, x: e.clientX, y: e.clientY };
    }
  }

  viewport.addEventListener('pointerup', endPointer);
  viewport.addEventListener('pointercancel', endPointer);

  // Backdrop close on click (not pointerup) so the click is consumed by the
  // open dialog and can never fall through to the page underneath.
  viewport.addEventListener('click', function (e) {
    if (e.target === viewport && moved < 6 && Date.now() - lastDblTap > 400) closeLightbox();
  });

  // Double-click (mouse) zooms into the point, or resets if already zoomed
  viewport.addEventListener('dblclick', function (e) {
    if (bar.contains(e.target)) return;
    var p = pointFromEvent(e);
    if (scale > 1.001) resetView(true); else setScale(DBL, p.x, p.y, true);
  });

  // ── Keyboard while open ───────────────────────────────────────────────────
  document.addEventListener('keydown', function (e) {
    if (!isOpen) {
      return;
    }
    if (e.key === 'Escape') { closeLightbox(); return; }
    if (e.key === '+' || e.key === '=') { e.preventDefault(); setScale(scale + STEP, 0, 0, true); }
    else if (e.key === '-' || e.key === '_') { e.preventDefault(); setScale(scale - STEP, 0, 0, true); }
    else if (e.key === '0') { e.preventDefault(); resetView(true); }
    else if (e.key === 'Tab') {
      // Focus trap inside the dialog
      var focusables = [close, btnOut, slider, btnIn, btnFit].filter(function (el) { return !el.disabled; });
      var i = focusables.indexOf(document.activeElement);
      e.preventDefault();
      if (e.shiftKey) focusables[(i - 1 + focusables.length) % focusables.length].focus();
      else focusables[(i + 1) % focusables.length].focus();
    }
  });

  // Keep fit measurements honest if the window resizes while open
  window.addEventListener('resize', function () {
    if (!isOpen) return;
    img.style.transform = '';
    requestAnimationFrame(function () {
      var r = img.getBoundingClientRect();
      fitW = r.width;
      fitH = r.height;
      clamp();
      schedule();
    });
  });
}());
