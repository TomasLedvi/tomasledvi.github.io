(function () {
  'use strict';
  document.documentElement.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const seg = (p, a, b) => clamp((p - a) / (b - a), 0, 1);
  const $ = id => document.getElementById(id);
  const CF = 'https://d2ol7oe51mr4n9.cloudfront.net/user_3JxAqGLPvN22taooKUlAO1hTSfT/';

  // ---------------------------------------------------------------- smooth scroll
  let lenis = null;
  if (!reduce && window.Lenis) { lenis = new Lenis({ lerp: .09 }); const raf = t => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf); }
  function go(el) { if (lenis) lenis.scrollTo(el, { offset: -76, duration: 1.6 }); else el.scrollIntoView({ behavior: 'smooth' }); }
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href'); if (id.length < 2) return; const el = document.querySelector(id); if (!el) return;
    e.preventDefault(); go(el);
  }));

  // ---------------------------------------------------------------- story
  const story = $('pribeh');
  const caps = [...document.querySelectorAll('.cap')].map(el => ({ el, a: +el.dataset.a, b: +el.dataset.b }));
  const lbls = [...document.querySelectorAll('.lbl')].map(el => ({ el, name: el.dataset.l, a: +el.dataset.a, b: +el.dataset.b }));
  const prog = [...document.querySelectorAll('#prog li')];
  const RANGES = [[.095, .2], [.205, .3], [.305, .44], [.48, .685], [.69, .885]];
  const hint = $('hint'), nav = $('nav'), mbar = $('mbar');
  const wide = () => innerWidth > 900;
  function storyP() { const r = story.getBoundingClientRect(), span = r.height - innerHeight; return span > 0 ? clamp(-r.top / span, 0, 1) : 0; }
  const kontakt = $('kontakt');
  function onScroll() {
    if (window.KROV) window.KROV.setProgress(storyP());
    nav.classList.toggle('solid', scrollY > 30);
    const kr = kontakt.getBoundingClientRect();
    mbar.classList.toggle('on', scrollY > innerHeight * .9 && kr.top > innerHeight * .6);
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  function ui(p) {
    for (const c of caps) {
      const fi = c.a < 0 ? 1 : seg(p, c.a, c.a + .02), fo = 1 - seg(p, c.b - .02, c.b), o = Math.min(fi, fo);
      c.el.style.opacity = o.toFixed(3);
      const dy = (1 - fi) * 28 - (1 - fo) * 28;
      c.el.style.transform = wide() ? `translateY(calc(-50% + ${dy}px))` : `translateY(${dy}px)`;
      c.el.classList.toggle('on', o > .5);
    }
    hint.style.opacity = (1 - seg(p, 0, .025)).toFixed(3);
    for (const l of lbls) {
      const on = p > l.a && p < l.b, pt = on && window.KROV ? window.KROV.project(l.name) : null;
      const minX = wide() ? innerWidth * .44 : 10;
      if (pt && !pt.behind && pt.x > minX && pt.x < innerWidth - 150 && pt.y > 120 && pt.y < innerHeight - 20) {
        l.el.style.transform = `translate(${pt.x.toFixed(1)}px,${pt.y.toFixed(1)}px)`; l.el.classList.add('on');
      } else l.el.classList.remove('on');
    }
    prog.forEach((li, i) => li.className = p >= RANGES[i][1] ? 'done' : p >= RANGES[i][0] ? 'now' : '');
  }
  if (window.KROV) window.KROV.onFrame = ui; else ui(0);
  const ly = $('let'); if (ly) ly.textContent = new Date().getFullYear() - 1992;

  // ---------------------------------------------------------------- reveal
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.remove('pre'); io.unobserve(e.target); } }), { threshold: .1 });
  document.querySelectorAll('.rv.pre').forEach(el => io.observe(el));

  // ---------------------------------------------------------------- calculator tabs + hand-off to the form
  document.querySelector('.tabs').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    [...b.parentNode.children].forEach(x => { x.setAttribute('aria-pressed', x === b); $(x.dataset.p).hidden = x !== b; });
    dispatchEvent(new Event('resize'));
  });
  $('rSend').addEventListener('click', () => {
    if (window.STRECHA) { $('fZprava').value = window.STRECHA.summary(); $('fCo').value = 'Nová střecha / výměna krytiny'; }
  });
  $('kSend').addEventListener('click', () => {
    if (window.KONF) { $('fZprava').value = window.KONF.summary(); $('fCo').value = 'Pergola / garážové stání / altán'; }
  });
  $('form').addEventListener('submit', e => { e.preventDefault(); $('fOk').classList.add('on'); });

  // ---------------------------------------------------------------- gallery (photos from the firm's current website)
  const PH = [
    ['d921c4b4-a3a5-446a-9322-4e72dffb9cef', 'krov', 'krov na hrubé stavbě', '4/3'],
    ['071436c8-9327-413a-b5e4-b21bb8c896a1', 'krov', 'krov s vikýři', '4/3'],
    ['043545a3-6d19-4cd9-85f9-ad4e13d2e528', 'strecha', 'střecha z vláknocementu', '4/3'],
    ['37f3c786-bd2d-473b-946d-3d516091edab', 'drevo', 'zahradní chatka', '4/3'],
    ['11543985-7922-473c-a277-ce74a39ce111', 'krov', 'krov zevnitř', '3/4'],
    ['ecbbaada-4f44-4cd8-b6c4-8290252cc68d', 'strecha', 'střešní okna v pálené tašce', '4/3'],
    ['0b981c05-dff4-4fdf-8b1a-238be2148982', 'drevo', 'dřevostavba s dřevěným pláštěm', '4/3'],
    ['9e8ca389-5102-4265-9833-4e65721d6e11', 'strecha', 'pokládka krytiny', '4/3'],
    ['70191b2d-4915-4a06-a759-2830ed3da677', 'podkrovi', 'podkroví: izolace a rošt', '4/3'],
    ['709aee4c-5de9-477a-9268-126bc1fc6846', 'drevo', 'kůlna s přístřeškem', '16/9'],
    ['219f4a2d-57b0-4709-ae99-c2ee159b653a', 'strecha', 'střešní okna Velux', '16/9'],
    ['b533227c-1308-4337-9577-a7cc96f0cd55', 'strecha', 'rekonstrukce střechy statku', '16/9'],
    ['b2c57631-8ffa-4dab-95ce-e793b62a8489', 'drevo', 'dřevěné balkony', '3/4'],
    ['35bba246-e019-44ad-a301-acbad49192dc', 'podkrovi', 'podkroví ze sádrokartonu', '4/3'],
    ['e74ede7f-dc99-46ac-9bd9-b4b2c1844551', 'drevo', 'dětský domek s prolézačkou', '9/16'],
    ['b43945b5-7a75-4caf-8fae-095e1faa1126', 'strecha', 'bitumenový šindel', '4/3'],
    ['1ae6b5b3-e4ad-4c3d-b87d-fbdfce941c77', 'strecha', 'hotová střecha s korouhví', '16/9'],
  ];
  const gal = $('gal');
  gal.innerHTML = PH.map(([id, cat, t, ar], i) => `<figure data-c="${cat}" data-i="${i}"><img loading="lazy" decoding="async" src="${CF}${id}.png" alt="${t}" style="aspect-ratio:${ar};object-fit:cover"><figcaption>${t}</figcaption></figure>`).join('');
  $('chips').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    [...b.parentNode.children].forEach(x => x.setAttribute('aria-pressed', x === b));
    gal.querySelectorAll('figure').forEach(fg => fg.hidden = !(b.dataset.f === 'all' || fg.dataset.c === b.dataset.f));
  });
  gal.addEventListener('click', e => {
    const fg = e.target.closest('figure'); if (!fg) return;
    const [id, , t] = PH[+fg.dataset.i];
    const lb = document.createElement('div'); lb.className = 'lb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-label', t);
    lb.innerHTML = `<div><img src="${CF}${id}.png" alt="${t}"><p>${t}</p></div><button type="button" class="btn">Zavřít</button>`;
    const close = () => { lb.remove(); if (lenis) lenis.start(); removeEventListener('keydown', esc); };
    const esc = ev => { if (ev.key === 'Escape') close(); };
    lb.addEventListener('click', ev => { if (ev.target === lb || ev.target.closest('button')) close(); });
    addEventListener('keydown', esc); document.body.appendChild(lb); if (lenis) lenis.stop(); lb.querySelector('button').focus();
  });

  // ---------------------------------------------------------------- snow
  const sc = $('snow');
  if (sc && !reduce) {
    const ctx = sc.getContext('2d'); let w, h, fl = [];
    const size = () => { const r = sc.getBoundingClientRect(); w = sc.width = r.width; h = sc.height = r.height; fl = Array.from({ length: Math.round(w / 7) }, () => ({ x: Math.random() * w, y: Math.random() * h, r: .6 + Math.random() * 2, s: .3 + Math.random() * .9, d: Math.random() * 6 })); };
    size(); addEventListener('resize', size);
    let vis = false; new IntersectionObserver(e => vis = e[0].isIntersecting).observe(sc);
    (function tick(t) { requestAnimationFrame(tick); if (!vis) return; ctx.clearRect(0, 0, w, h); ctx.fillStyle = 'rgba(230,240,255,.85)';
      for (const f of fl) { f.y += f.s; f.x += Math.sin(t * .001 + f.d) * .3; if (f.y > h) { f.y = -4; f.x = Math.random() * w; } ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 7); ctx.fill(); } })(0);
  }
})();
