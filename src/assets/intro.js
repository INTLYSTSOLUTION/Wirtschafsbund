(() => {
  'use strict';
  const overlay = document.querySelector('.brand-intro');
  const root = document.documentElement;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const navigation = performance.getEntriesByType('navigation')[0];
  const seenKey = 'wirtschaftsbund:intro-seen';
  let seen = false;
  try { seen = sessionStorage.getItem(seenKey) === '1'; } catch { /* Storage is optional. */ }
  // A same-origin login redirect is still the first visit; only a completed tab visit counts.
  if (!overlay || motion.matches || location.hash || navigation?.type === 'back_forward' ||
      (seen && navigation?.type !== 'reload') || typeof Element.prototype.animate !== 'function' ||
      getComputedStyle(overlay).position !== 'fixed') {
    overlay?.remove();
    return;
  }

  const logoUrl = new URL('./pferd-original.jpg', document.currentScript.src).href;
  const pending = new AbortController();
  const { signal } = pending;
  let finished = false;
  let released = false;
  let frame = 0;
  let content = [];
  let animations = [];
  let canvas;
  let context;
  let timer;

  function release() {
    if (released) return;
    released = true;
    root.classList.remove('intro-active');
    for (const [element, wasInert] of content) element.inert = wasInert;
    overlay.classList.add('is-released');
  }

  function finish(focusContent = false) {
    if (finished) return;
    finished = true;
    clearTimeout(timer);
    cancelAnimationFrame(frame);
    pending.abort();
    release();
    root.classList.remove('intro-revealing');
    for (const animation of animations) animation.cancel();
    const returnFocus = focusContent || overlay.contains(document.activeElement);
    overlay.remove();
    if (canvas) canvas.width = canvas.height = 0;
    if (returnFocus) {
      const main = document.querySelector('main');
      if (main) {
        const previous = main.getAttribute('tabindex');
        main.setAttribute('tabindex', '-1');
        main.focus({ preventScroll: true });
        main.addEventListener('blur', () => {
          if (previous === null) main.removeAttribute('tabindex');
          else main.setAttribute('tabindex', previous);
        }, { once: true });
      }
    }
  }

  timer = setTimeout(finish, 6000); // Recovery only; normal completion follows the animations.
  try { sessionStorage.setItem(seenKey, '1'); } catch { /* Private/blocked storage still works. */ }
  root.classList.add('intro-active');
  overlay.hidden = false;
  overlay.querySelector('.intro-skip').addEventListener('click', () => finish(true), { signal });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' || event.key === 'Tab') finish();
  }, { signal, capture: true });
  window.addEventListener('pagehide', () => finish(), { signal });
  // Mobile browser chrome can change height slightly without an actual orientation change.
  const initialWidth = innerWidth;
  const initialHeight = innerHeight;
  window.addEventListener('resize', () => {
    if (Math.abs(innerWidth - initialWidth) > 4 || Math.abs(innerHeight - initialHeight) > 120) finish();
  }, { signal });
  motion.addEventListener('change', () => { if (motion.matches) finish(); }, { signal });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') finish();
  }, { signal });
  overlay.querySelector('.intro-scene').addEventListener('animationend', event => {
    if (event.animationName === 'intro-scene-out') release();
  }, { signal });

  const clamp = value => Math.max(0, Math.min(1, value));
  const progress = (time, start, duration) => clamp((time - start) / duration);
  const easeOut = value => 1 - (1 - value) ** 3;
  const smooth = value => value * value * (3 - 2 * value);

  // Convert the supplied logo into a small cached alpha texture once.
  // No animated SVG filters, viewport-sized masks, or large filtered zoom layers.
  function prepareHorse(logo) {
    const texture = document.createElement('canvas');
    texture.width = texture.height = 500;
    const pixels = texture.getContext('2d', { willReadFrequently: true });
    if (!pixels) throw new Error('Canvas unavailable');
    pixels.drawImage(logo, 0, 0, 500, 500);
    const image = pixels.getImageData(0, 0, 500, 500);
    for (let i = 0; i < image.data.length; i += 4) {
      const light = .2126 * image.data[i] + .7152 * image.data[i + 1] + .0722 * image.data[i + 2];
      image.data[i + 3] = Math.round(clamp((light - 70) / 165) * 255);
      image.data[i] = 247;
      image.data[i + 1] = 249;
      image.data[i + 2] = 252;
    }
    pixels.putImageData(image, 0, 0);
    return texture;
  }

  function prepareBackdrop() {
    const texture = document.createElement('canvas');
    texture.width = texture.height = 512;
    const paint = texture.getContext('2d');
    if (!paint) throw new Error('Canvas unavailable');
    const light = paint.createRadialGradient(256, 220, 0, 256, 220, 360);
    light.addColorStop(0, '#142b51');
    light.addColorStop(.42, '#09162e');
    light.addColorStop(1, '#020610');
    paint.fillStyle = light;
    paint.fillRect(0, 0, 512, 512);
    return texture;
  }

  async function play() {
    if (finished) return;
    content = [...document.querySelectorAll('.site-header, main, .site-footer')]
      .map(element => [element, element.inert]);
    for (const [element] of content) element.inert = true;
    try {
      canvas = overlay.querySelector('.intro-scene');
      context = canvas.getContext('2d');
      if (!context) { finish(); return; }
      const logo = new Image();
      logo.src = logoUrl;
      let assetTimeout;
      const loaded = await Promise.race([
        Promise.all([logo.decode(), document.fonts.load('600 48px Cormorant')]).then(() => true),
        new Promise(resolve => { assetTimeout = setTimeout(() => resolve(false), 1000); }),
      ]).finally(() => clearTimeout(assetTimeout));
      if (finished) return;
      if (!loaded) { finish(); return; }
      const horse = prepareHorse(logo);
      const backdrop = prepareBackdrop();
      const width = root.clientWidth;
      const height = innerHeight;
      const density = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * density);
      canvas.height = Math.round(height * density);
      context.setTransform(density, 0, 0, density, 0, 0);
      context.imageSmoothingEnabled = true;
      const size = Math.min(600, width * 1.22, height * .68);
      const centerX = width * .5;
      const centerY = height * .43;

      function draw(time) {
        const push = progress(time, 1580, 900);
        // Continuous forward motion, then an accelerating camera push through the horse.
        const scale = (.94 + .09 * easeOut(progress(time, 0, 1580))) * Math.exp(3.6 * push * push);
        const extent = size * scale;
        const x = centerX - extent * .5;
        const y = centerY - extent * .5 + (1 - easeOut(progress(time, 0, 780))) * 13;
        const opening = smooth(progress(time, 1690, 340));
        const white = easeOut(progress(time, 30, 540)) * (1 - smooth(progress(time, 1720, 350)));
        context.globalCompositeOperation = 'source-over';
        context.globalAlpha = 1;
        context.clearRect(0, 0, width, height);
        context.drawImage(backdrop, 0, 0, width, height);
        if (opening > 0) {
          context.globalCompositeOperation = 'destination-out';
          context.globalAlpha = opening;
          context.drawImage(horse, x, y, extent, extent);
        }
        if (white > 0) {
          context.globalCompositeOperation = 'source-over';
          context.globalAlpha = white;
          context.drawImage(horse, x, y, extent, extent);
        }
        // Brief light columns stay inside the original silhouette.
        if (time < 850) {
          context.globalCompositeOperation = 'source-over';
          for (let i = 0; i < 7; i++) {
            const light = Math.sin(progress(time, i * 36, 520) * Math.PI) * .7;
            if (light <= 0) continue;
            const sx = 185 + i * 20;
            context.globalAlpha = light;
            context.drawImage(horse, sx, 0, 5, 500, x + sx / 500 * extent, y, extent * .01, extent);
          }
        }
        context.globalAlpha = 1;
        context.globalCompositeOperation = 'source-over';
      }

      // One document clock for the canvas and all compositor animations.
      draw(0);
      root.classList.add('intro-revealing');
      overlay.classList.add('is-playing');
      animations = document.getAnimations().filter(animation => animation.animationName?.startsWith('intro-'));
      const epoch = document.timeline.currentTime;
      for (const animation of animations) animation.startTime = epoch;
      function render(now) {
        if (finished) return;
        try {
          const elapsed = now - epoch;
          if (elapsed < 2500) {
            draw(elapsed);
            frame = requestAnimationFrame(render);
          }
        } catch { finish(); }
      }
      frame = requestAnimationFrame(render);
      Promise.all(animations.map(animation => animation.finished)).then(() => finish(), () => finish());
    } catch { finish(); }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', play, { once: true, signal });
  } else { play(); }
})();
