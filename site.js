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

// ── Mobile navigation menu ──────────────────────────────────────────────────
// Independent of the lightbox above. Hamburger toggle + slide-in panel that
// consolidates the nav links and contact/social links on small screens.
// No-ops on any page that lacks the toggle/menu markup, so it's safe to load
// site.js everywhere.
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var menu   = document.getElementById('mobile-menu');
  if (!toggle || !menu) return;

  var isOpen = false;

  // Track the last input modality. A *pointer* close returns focus to the toggle
  // without painting a focus ring on it; a *keyboard* (Escape) close keeps the
  // ring. A click synthesised from Enter/Space carries no pointer event, so
  // watching the raw input is more reliable than inspecting the click itself.
  var keyboardMode = false;
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Tab' || e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
      keyboardMode = true;
    }
  }, true);
  document.addEventListener('pointerdown', function () { keyboardMode = false; }, true);

  // Collapsed panel is hidden from assistive tech (CSS visibility:hidden already
  // removes it; aria-hidden makes the intent explicit and robust across AT).
  menu.setAttribute('aria-hidden', 'true');

  // Toggle first, then every focusable inside the panel — the tab cycle wraps
  // across this whole set so the toggle (which doubles as the close control on
  // touch) stays reachable from the keyboard while the panel is open.
  function getFocusables() {
    var list = [toggle];
    menu.querySelectorAll('a[href], button:not([disabled])').forEach(function (el) {
      list.push(el);
    });
    return list;
  }

  function openMenu() {
    if (isOpen) return;
    isOpen = true;
    menu.classList.add('is-open');
    menu.removeAttribute('aria-hidden');   // expose before moving focus inside
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    // Move focus into the panel container (not the first link), so opening the
    // menu never paints a focus ring on an actionable item. The Tab focus-trap
    // still carries the first Tab onto "Work"; the panel is announced as the
    // "Mobile" nav landmark. preventScroll avoids an iOS viewport jump (the
    // panel is overflow-y:auto inside a fixed overlay with body overflow hidden).
    var panel = menu.querySelector('.mobile-menu__panel');
    if (panel) {
      if (!panel.hasAttribute('tabindex')) panel.setAttribute('tabindex', '-1');
      panel.focus({ preventScroll: true });
    }
  }

  // Focus always returns to the toggle before the panel is hidden, so aria-hidden
  // is never set on an element that still contains the focused node.
  function closeMenu() {
    if (!isOpen) return;
    isOpen = false;
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    if (toggle.focus) toggle.focus({ preventScroll: true });
    // Suppress the focus ring only for pointer-initiated closes (scrim / X /
    // link tap); a keyboard (Escape) close leaves the ring so keyboard users
    // can see where focus landed. Cleared on blur so a later Tab rings normally.
    toggle.toggleAttribute('data-quiet-focus', !keyboardMode);
    menu.setAttribute('aria-hidden', 'true');
  }

  toggle.addEventListener('click', function () {
    isOpen ? closeMenu() : openMenu();
  });

  // Once the toggle loses focus, drop the quiet-focus flag so a subsequent
  // keyboard focus (Tab back to it) shows the ring as normal.
  toggle.addEventListener('blur', function () {
    toggle.removeAttribute('data-quiet-focus');
  });

  // Close on the scrim / any explicit close control…
  menu.querySelectorAll('[data-menu-close]').forEach(function (el) {
    el.addEventListener('click', function () { closeMenu(); });
  });
  // …and after selecting any link in the panel (the page is navigating away).
  menu.querySelectorAll('.mobile-menu__panel a').forEach(function (a) {
    a.addEventListener('click', function () { closeMenu(); });
  });

  document.addEventListener('keydown', function (e) {
    if (!isOpen) return;
    if (e.key === 'Escape') { e.preventDefault(); closeMenu(); return; }
    if (e.key === 'Tab') {
      var f = getFocusables();
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }
  });

  // If the viewport grows back to desktop while the menu is open, reset cleanly
  // so the scroll lock is never left applied.
  window.addEventListener('resize', function () {
    if (isOpen && window.innerWidth > 768) closeMenu();
  });
}());

// ── Contact anchor: smooth scroll + focus + arrival spotlight ────────────────
// Progressive enhancement over the native #contact fragment link. Works on every
// page (the global Contact footer, or the About page's local Contact section) and
// from inside the mobile menu. No-ops when #contact is absent.
(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function spotlight(el) {
    if (reduceMotion.matches) return;
    el.classList.remove('is-contact-spotlight');
    void el.offsetWidth;                 // force reflow so the animation restarts on repeat visits
    el.classList.add('is-contact-spotlight');
  }

  function goToContact(updateHash) {
    var target = document.getElementById('contact');
    if (!target) return false;
    target.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
    target.focus({ preventScroll: true }); // move focus without a second, competing scroll
    spotlight(target);
    if (updateHash && window.history && history.replaceState) {
      history.replaceState(null, '', '#contact');
    }
    return true;
  }

  // Delegated so it also covers the Contact link rendered inside the mobile menu
  // (whose own handler closes the menu first; this runs on bubble, after).
  document.addEventListener('click', function (e) {
    var link = e.target.closest ? e.target.closest('a[href="#contact"]') : null;
    if (!link || !document.getElementById('contact')) return;
    e.preventDefault();
    goToContact(true);
  });

  // Let the spotlight be re-triggered on subsequent visits.
  document.addEventListener('animationend', function (e) {
    if (e.animationName === 'contact-spotlight') {
      e.target.classList.remove('is-contact-spotlight');
    }
  });

  // Deep link: if the page opens at #contact, apply the same treatment once.
  if (window.location.hash === '#contact') {
    window.addEventListener('load', function () {
      setTimeout(function () { goToContact(false); }, 60);
    });
  }
}());

// ── Email actions copy to clipboard (toast + graceful fallback) ──────────────
// Every Email button/link (a mailto: address) copies the address instead of
// opening a mail client. Progressive enhancement: with JS off, the mailto still
// works. A small, quiet "copy" icon is added to each Email button, and an
// accessible, auto-dismissing toast confirms the copy. Applies on every page,
// component and breakpoint, since all Email actions share the same mailto href.
(function () {
  var mailLinks = document.querySelectorAll('a[href^="mailto:"]');
  if (!mailLinks.length) return;

  // Shared toast — polite live region, visible but restrained, auto-dismissing.
  var toast = document.createElement('div');
  toast.className = 'copy-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  document.body.appendChild(toast);
  var toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('is-visible'); }, 2600);
  }

  // Legacy execCommand copy, used where the Clipboard API is missing or rejects.
  function execCommandCopy(text) {
    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.top = '-1000px';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        var ok = document.execCommand('copy');
        document.body.removeChild(ta);
        ok ? resolve() : reject(new Error('execCommand failed'));
      } catch (err) { reject(err); }
    });
  }
  // Clipboard API first; fall back to execCommand if it's absent or rejects.
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(function () { return execCommandCopy(text); });
    }
    return execCommandCopy(text);
  }

  // Quiet, decorative copy glyph appended to the right of each Email button.
  var COPY_ICON = '<svg class="btn-copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
  mailLinks.forEach(function (link) {
    if (!link.querySelector('.btn-copy-icon')) link.insertAdjacentHTML('beforeend', COPY_ICON);
  });

  // Delegated so it covers Email actions anywhere (footer, menu, About section).
  document.addEventListener('click', function (e) {
    var link = e.target.closest ? e.target.closest('a[href^="mailto:"]') : null;
    if (!link) return;
    e.preventDefault();
    var email = link.getAttribute('href').replace(/^mailto:/i, '').split('?')[0].trim();
    copyText(email).then(function () {
      showToast(email + ' copied to your clipboard.');
    }).catch(function () {
      showToast('Email: ' + email);   // last-resort fallback: surface it to copy manually
    });
  });
}());
