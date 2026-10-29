(function () {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const seg = (p, a, b) => clamp((p - a) / (b - a), 0, 1);
  const eio = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const $ = id => document.getElementById(id);
  const CF = 'https://d2ol7oe51mr4n9.cloudfront.net/user_3JxAqGLPvN22taooKUlAO1hTSfT/';
  const W = () => innerWidth, H = () => innerHeight;
  const wide = () => innerWidth > 900;
  const KROV = window.KROV;

  // ---------------------------------------------------------------- smooth scroll + jumps
  let lenis = null;
  if (!reduce && window.Lenis) { lenis = new Lenis({ lerp: .1 }); const raf = t => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf); }
  function go(el) {
    const y = el.id === 'uvod' ? 0 : el.getBoundingClientRect().top + scrollY - (el.classList.contains('track') ? 0 : 70);
    if (lenis) lenis.scrollTo(y, { duration: 1.6 }); else scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
  }
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href'); if (id.length < 2) return; const el = document.querySelector(id); if (!el) return;
    e.preventDefault(); go(el);
  }));

  // ---------------------------------------------------------------- carpenter's marks (SVG, carved by dash offset)
  const STROKES = {
    I: [[23, 8, 23, 38]],
    II: [[18, 8, 18, 38], [28, 8, 28, 38]],
    III: [[14, 8, 14, 38], [23, 8, 23, 38], [32, 8, 32, 38]],
    IIII: [[11, 8, 11, 38], [19, 8, 19, 38], [27, 8, 27, 38], [35, 8, 35, 38]],
    V: [[13, 8, 23, 38], [33, 8, 23, 38]],
  };
  function markSVG(n) {
    const s = STROKES[n] || STROKES.I;
    const d = s.map(([x1, y1, x2, y2]) => `M${x1} ${y1}L${x2} ${y2}`);
    return `<svg class="zn" viewBox="0 0 46 46" aria-hidden="true">${d.map(p => `<path class="g" d="${p}" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>`).join('')}${d.map(p => `<path class="h" d="${p}" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>`).join('')}</svg>`;
  }
  function carve(svg, t) { // t 0..1 over all strokes, one after another
    const g = svg.querySelectorAll('.g'), h = svg.querySelectorAll('.h'), n = g.length;
    for (let i = 0; i < n; i++) { const v = (1 - seg(t, i / n, (i + 1) / n)).toFixed(3); g[i].style.strokeDashoffset = v; h[i].style.strokeDashoffset = v; }
  }
  // section heads: carve once when seen
  document.querySelectorAll('.mk[data-n]').forEach(el => el.insertAdjacentHTML('afterbegin', markSVG(el.dataset.n)));
  const mkIO = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; mkIO.unobserve(e.target);
    const svg = e.target.querySelector('svg'); if (!svg) return;
    if (reduce) { carve(svg, 1); return; }
    const t0 = performance.now(), dur = 700;
    (function step(t) { const k = clamp((t - t0) / dur, 0, 1); carve(svg, eio(k)); if (k < 1) requestAnimationFrame(step); })(t0);
  }), { threshold: .6 });
  document.querySelectorAll('.mk[data-n]').forEach(el => mkIO.observe(el));

  // the beam: five waypoints, carved by scroll progress through each group
  const beam = $('beam');
  const GROUPS = [['uvod', 'uvod'], ['remeslo', 'spoj'], ['realizace', 'reference'], ['strecha', 'kalkulacka'], ['hotovo', 'kontakt']];
  const beamBtns = [...beam.querySelectorAll('button')];
  beamBtns.forEach(b => {
    b.insertAdjacentHTML('beforeend', markSVG(b.dataset.n));
    b.addEventListener('click', () => go($(b.dataset.go)));
  });

  // ---------------------------------------------------------------- hero: plate, title, krov cut-out
  const hero = $('hero'), uvod = $('uvod'), plBack = $('plBack'), plKrov = $('plKrov');
  const l2 = $('l2'), title = $('title'), low = hero.querySelector('.low'), heroFade = $('heroFade');
  const nav = $('nav'), mbar = $('mbar'), kontakt = $('kontakt');
  let loaded = 0;
  const ready = () => { if (++loaded >= 2) hero.classList.add('ready'); };
  [plBack, plKrov].forEach(img => { if (img.complete && img.naturalWidth) ready(); else { img.addEventListener('load', ready); img.addEventListener('error', ready); } });
  setTimeout(() => hero.classList.add('ready'), 4000);
  // both planes scale about one shared anchor: the middle of the top plate (where the cut-out fades into the plate)
  function anchor() {
    const mob = innerWidth <= 760;
    [plBack, plKrov].forEach(img => {
      const bw = img.clientWidth, bh = img.clientHeight, s = Math.max(bw / 2000, bh / 1500);
      const iw = 2000 * s, ih = 1500 * s, px = mob ? .22 : .5;
      const x = (bw - iw) * px, y = 0;
      img.style.transformOrigin = `${(x + iw * .5).toFixed(1)}px ${(y + ih * .5).toFixed(1)}px`;
    });
  }
  addEventListener('resize', anchor); anchor();

  // ---------------------------------------------------------------- the world: page scroll → camera progress
  const legs = [...document.querySelectorAll('[data-p0]')];
  function worldP() {
    const c = H() * .5;
    let p = 0;
    for (const el of legs) {
      const r = el.getBoundingClientRect();
      const p0 = +el.dataset.p0, p1 = +el.dataset.p1;
      if (r.top > c) break;
      p = r.bottom <= c ? p1 : p0 + (p1 - p0) * (c - r.top) / r.height;
    }
    return p;
  }

  // ---------------------------------------------------------------- cues: copy that arrives in the fixed layer
  const cues = [...document.querySelectorAll('.cue')].map(el => ({ el, tr: el.parentElement }));
  const cuescrim = $('cuescrim');
  const lbls = [...document.querySelectorAll('.lbl')].map(el => ({ el, name: el.dataset.l, a: +el.dataset.a, b: +el.dataset.b }));

  function frame() {
    const vh = H(), y = scrollY;
    // hero
    const h = clamp(y / Math.max(1, uvod.offsetHeight), 0, 1.2);
    const k = reduce ? 0 : eio(seg(h, 0, .8));
    plBack.style.transform = `scale(${(1 + .035 * k).toFixed(4)})`;
    plKrov.style.transform = `scale(${(1 + .075 * k).toFixed(4)}) translateY(${(-1 * k).toFixed(2)}%)`;
    const t2 = reduce ? 1 : seg(h, .08, .22);
    l2.style.opacity = t2.toFixed(3); l2.style.transform = `translateY(${((1 - t2) * 14).toFixed(1)}px)`;
    const lowO = 1 - seg(h, .4, .56);
    low.style.opacity = lowO.toFixed(3); low.style.pointerEvents = lowO > .3 ? 'auto' : 'none'; low.style.visibility = lowO > .01 ? 'visible' : 'hidden';
    title.style.opacity = (1 - seg(h, .6, .76)).toFixed(3);
    heroFade.style.opacity = seg(h, .68, .9).toFixed(3);
    hero.style.visibility = h >= .99 ? 'hidden' : 'visible';
    if (KROV) KROV.pause(h < .62);
    nav.classList.toggle('onphoto', h < .6);
    nav.classList.toggle('solid', h > .7);
    const kr = kontakt.getBoundingClientRect();
    mbar.classList.toggle('on', h > .9 && kr.top > vh * .6);

    // world
    if (KROV) KROV.setProgress(worldP());

    // cues
    let scr = 0;
    for (const c of cues) {
      const r = c.tr.getBoundingClientRect();
      let o;
      if (wide()) o = Math.min(clamp((vh * .3 - r.top) / (vh * .15), 0, 1), clamp((r.bottom - vh * .8) / (vh * .15), 0, 1));
      else o = Math.min(clamp((vh * .05 - r.top) / (vh * .15), 0, 1), clamp((r.bottom - vh * .55) / (vh * .12), 0, 1));
      c.el.style.opacity = o.toFixed(3);
      c.el.style.visibility = o > .01 ? 'visible' : 'hidden';
      c.el.classList.toggle('on', o > .5);
      if (!reduce) c.el.style.transform = (wide() ? 'translateY(-50%) ' : '') + `translateY(${((1 - o) * 16).toFixed(1)}px)`;
      scr = Math.max(scr, o);
    }
    cuescrim.style.opacity = scr.toFixed(3);
    beam.classList.toggle('cue-on', scr > .5);

    // beam
    beam.classList.toggle('on', h > .82);
    const c = y + vh * .5;
    let now = 0;
    GROUPS.forEach(([a, b], i) => {
      const A = $(a), B = $(b);
      const top = i === 0 ? 0 : A.getBoundingClientRect().top + y;
      const bot = i === 0 ? uvod.offsetHeight * .8 : B.getBoundingClientRect().bottom + y;
      const t = i === 0 ? clamp(y / bot, 0, 1) : clamp((c - top) / (bot - top), 0, 1);
      carve(beamBtns[i].querySelector('svg'), t);
      if (i === 0 ? true : c >= top) now = i;
    });
    beamBtns.forEach((b, i) => { b.classList.toggle('now', i === now); if (i === now) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
  }

  function labels(p) {
    for (const l of lbls) {
      const on = p > l.a && p < l.b, pt = on && KROV ? KROV.project(l.name) : null;
      const minX = wide() ? innerWidth * .46 : 10;
      if (pt && !pt.behind && pt.x > minX && pt.x < innerWidth - 150 && pt.y > 120 && pt.y < innerHeight - 20) {
        l.el.style.transform = `translate(${pt.x.toFixed(1)}px,${pt.y.toFixed(1)}px)`; l.el.classList.add('on');
      } else l.el.classList.remove('on');
    }
  }
  if (KROV) KROV.onFrame = labels;

  // run every animation frame (Lenis moves scroll smoothly; cheap DOM work only)
  (function tick() { frame(); requestAnimationFrame(tick); })();
  addEventListener('resize', () => { sizePan(); frame(); });

  // ---------------------------------------------------------------- reveal
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.remove('pre'); io.unobserve(e.target); } }), { threshold: .08 });
  document.querySelectorAll('.rv.pre').forEach(el => io.observe(el));

  // ---------------------------------------------------------------- calculator tabs + hand-off to the form
  document.querySelector('.tabs').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    [...b.parentNode.children].forEach(x => { x.setAttribute('aria-pressed', x === b); $(x.dataset.p).hidden = x !== b; });
    dispatchEvent(new Event('resize'));
  });
  function handoff(text, co) {
    $('fZprava').value = text; $('fCo').value = co;
    const f = $('fFilled'); f.classList.remove('on'); void f.offsetWidth; f.classList.add('on');
    setTimeout(() => $('fJmeno').focus({ preventScroll: true }), lenis ? 1700 : 300);
  }
  $('rSend').addEventListener('click', () => { if (window.STRECHA) handoff(window.STRECHA.summary(), 'Nová střecha / výměna krytiny'); });
  $('kSend').addEventListener('click', () => { if (window.KONF) handoff(window.KONF.summary(), 'Pergola / garážové stání / altán'); });
  $('form').addEventListener('submit', e => {
    e.preventDefault();
    const tel = $('fTel'), digits = tel.value.replace(/\D/g, '');
    const bad = digits.length < 9;
    tel.setAttribute('aria-invalid', bad);
    $('fErr').textContent = bad ? 'Vyplňte prosím telefon (aspoň 9 číslic), ať se vám můžeme ozvat.' : '';
    if (bad) { tel.focus(); $('fOk').classList.remove('on'); return; }
    $('fOk').classList.add('on');
  });
  $('fTel').addEventListener('input', () => { if ($('fErr').textContent) { $('fErr').textContent = ''; $('fTel').removeAttribute('aria-invalid'); } });

  // ---------------------------------------------------------------- realizace: lateral run of real photos
  const PH = [
    ['071436c8-9327-413a-b5e4-b21bb8c896a1', 'krov s vikýři', 4 / 3],
    ['0b981c05-dff4-4fdf-8b1a-238be2148982', 'dřevostavba s dřevěným pláštěm', 4 / 3],
    ['11543985-7922-473c-a277-ce74a39ce111', 'krov zevnitř', 3 / 4],
    ['ecbbaada-4f44-4cd8-b6c4-8290252cc68d', 'střešní okna v pálené tašce', 4 / 3],
    ['b533227c-1308-4337-9577-a7cc96f0cd55', 'rekonstrukce střechy statku', 16 / 9],
    ['37f3c786-bd2d-473b-946d-3d516091edab', 'zahradní chatka', 4 / 3],
    ['b2c57631-8ffa-4dab-95ce-e793b62a8489', 'dřevěné balkony', 3 / 4],
    ['043545a3-6d19-4cd9-85f9-ad4e13d2e528', 'střecha z vláknocementu', 4 / 3],
    ['709aee4c-5de9-477a-9268-126bc1fc6846', 'kůlna s přístřeškem', 16 / 9],
    ['9e8ca389-5102-4265-9833-4e65721d6e11', 'pokládka krytiny', 4 / 3],
    ['70191b2d-4915-4a06-a759-2830ed3da677', 'podkroví: izolace a rošt', 4 / 3],
    ['219f4a2d-57b0-4709-ae99-c2ee159b653a', 'střešní okna Velux', 16 / 9],
    ['35bba246-e019-44ad-a301-acbad49192dc', 'podkroví ze sádrokartonu', 4 / 3],
    ['e74ede7f-dc99-46ac-9bd9-b4b2c1844551', 'dětský domek s prolézačkou', 9 / 16],
    ['b43945b5-7a75-4caf-8fae-095e1faa1126', 'bitumenový šindel', 4 / 3],
    ['1ae6b5b3-e4ad-4c3d-b87d-fbdfce941c77', 'hotová střecha s korouhví', 16 / 9],
  ];
  const gal = $('gal'), pan = $('pan');
  gal.innerHTML = PH.map(([id, t, ar], i) => `<figure data-i="${i}" tabindex="0" role="button" aria-label="Zvětšit: ${t}" style="aspect-ratio:${ar}"><img loading="lazy" decoding="async" src="${CF}${id}.png" alt="${t}"><figcaption>${t}</figcaption></figure>`).join('');
  const panOn = () => innerWidth > 900 && !reduce;
  function sizePan() {
    if (!panOn()) { pan.style.height = ''; gal.style.transform = ''; return; }
    const travel = Math.max(0, gal.scrollWidth - innerWidth);
    pan.style.height = (innerHeight + travel * .55) + 'px';
  }
  sizePan(); addEventListener('load', sizePan);
  (function panTick() {
    if (panOn()) {
      const r = pan.getBoundingClientRect(), span = pan.offsetHeight - innerHeight;
      const t = span > 0 ? clamp(-r.top / span, 0, 1) : 0; // rail travels faster than the wheel: lateral = 1/.55 × vertical
      gal.style.transform = `translate3d(${(-t * Math.max(0, gal.scrollWidth - innerWidth)).toFixed(1)}px,0,0)`;
    }
    requestAnimationFrame(panTick);
  })();
  gal.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('figure')) { e.preventDefault(); e.target.click(); } });
  gal.addEventListener('click', e => {
    const fg = e.target.closest('figure'); if (!fg) return;
    const [id, t] = PH[+fg.dataset.i];
    const lb = document.createElement('div'); lb.className = 'lb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-label', t);
    lb.innerHTML = `<div><img src="${CF}${id}.png" alt="${t}"><p>${t}</p></div><button type="button" class="btn">Zavřít</button>`;
    const close = () => { lb.remove(); if (lenis) lenis.start(); removeEventListener('keydown', esc); fg.focus({ preventScroll: true }); };
    const esc = ev => { if (ev.key === 'Escape') close(); };
    lb.addEventListener('click', ev => { if (ev.target === lb || ev.target.closest('button')) close(); });
    addEventListener('keydown', esc); document.body.appendChild(lb); if (lenis) lenis.stop(); lb.querySelector('button').focus();
  });
})();
