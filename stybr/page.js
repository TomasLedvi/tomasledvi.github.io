(function () {
  'use strict';
  document.documentElement.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const seg = (p, a, b) => clamp((p - a) / (b - a), 0, 1);
  const CF = 'https://d2ol7oe51mr4n9.cloudfront.net/user_3JxAqGLPvN22taooKUlAO1hTSfT/';

  // ---------------------------------------------------------------- smooth scroll
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: .09 });
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf);
  }
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href'); if (id.length < 2) return;
    const el = document.querySelector(id); if (!el) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(el, { offset: -70, duration: 1.6 }); else el.scrollIntoView({ behavior: 'smooth' });
  }));

  // ---------------------------------------------------------------- story progress
  const story = document.getElementById('pribeh');
  const caps = [...document.querySelectorAll('.cap')].map(el => ({ el, a: +el.dataset.a, b: +el.dataset.b }));
  const lbls = [...document.querySelectorAll('.lbl')].map(el => ({ el, name: el.dataset.l, a: +el.dataset.a, b: +el.dataset.b }));
  const hint = document.getElementById('hint'), nav = document.getElementById('nav');
  const fill = document.getElementById('metrFill'), mval = document.getElementById('metrVal');
  const wide = () => innerWidth > 900;
  function storyP() {
    const r = story.getBoundingClientRect(); const span = r.height - innerHeight;
    return span > 0 ? clamp(-r.top / span, 0, 1) : 0;
  }
  function onScroll() {
    const p = storyP();
    if (window.KROV) window.KROV.setProgress(p);
    nav.classList.toggle('solid', scrollY > 30);
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  function ui(p) {
    for (const c of caps) {
      const fi = c.a < 0 ? 1 : seg(p, c.a, c.a + .02), fo = 1 - seg(p, c.b - .02, c.b), o = Math.min(fi, fo);
      c.el.style.opacity = o.toFixed(3);
      const dy = (1 - fi) * 26 - (1 - fo) * 26;
      c.el.style.transform = wide() ? `translateY(calc(-50% + ${dy}px))` : `translateY(${dy}px)`;
      c.el.classList.toggle('on', o > .5);
    }
    hint.style.opacity = (1 - seg(p, 0, .025)).toFixed(3);
    for (const l of lbls) {
      const on = p > l.a && p < l.b;
      let pt = on && window.KROV ? window.KROV.project(l.name) : null;
      const minX = wide() ? innerWidth * .42 : 10;
      if (pt && !pt.behind && pt.x > minX && pt.x < innerWidth - 70 && pt.y > 80 && pt.y < innerHeight - 20) {
        l.el.style.transform = `translate(${pt.x.toFixed(1)}px,${pt.y.toFixed(1)}px)`;
        l.el.classList.add('on');
      } else l.el.classList.remove('on');
    }
    fill.style.height = (p * 100).toFixed(2) + '%';
    mval.textContent = Math.round(p * 200) + ' cm';
  }
  if (window.KROV) window.KROV.onFrame = ui; else ui(0);

  // ruler numbers
  const metr = document.querySelector('.metr');
  for (let i = 1; i < 10; i++) { const s = document.createElement('span'); s.className = 'cm'; s.style.top = (i * 10 - 1.5) + '%'; s.textContent = i * 20; metr.appendChild(s); }

  // years since 1992
  const let_ = document.getElementById('let'); if (let_) let_.textContent = new Date().getFullYear() - 1992;

  // ---------------------------------------------------------------- reveal
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.remove('pre'); io.unobserve(e.target); } }), { threshold: .12 });
  document.querySelectorAll('.reveal.pre').forEach(el => io.observe(el));

  // ---------------------------------------------------------------- gallery (photos from the firm's current website)
  const PH = [
    ['d921c4b4-a3a5-446a-9322-4e72dffb9cef', 'krov', 'krov na hrubé stavbě'],
    ['071436c8-9327-413a-b5e4-b21bb8c896a1', 'krov', 'krov s vikýři'],
    ['043545a3-6d19-4cd9-85f9-ad4e13d2e528', 'strecha', 'střecha z vláknocementových šablon'],
    ['37f3c786-bd2d-473b-946d-3d516091edab', 'drevo', 'zahradní chatka'],
    ['11543985-7922-473c-a277-ce74a39ce111', 'krov', 'krov zevnitř'],
    ['ecbbaada-4f44-4cd8-b6c4-8290252cc68d', 'strecha', 'střešní okna v pálené tašce'],
    ['0b981c05-dff4-4fdf-8b1a-238be2148982', 'drevo', 'dřevostavba s dřevěným pláštěm'],
    ['9e8ca389-5102-4265-9833-4e65721d6e11', 'strecha', 'pokládka krytiny'],
    ['70191b2d-4915-4a06-a759-2830ed3da677', 'podkrovi', 'podkroví: izolace a rošt'],
    ['709aee4c-5de9-477a-9268-126bc1fc6846', 'drevo', 'kůlna s přístřeškem'],
    ['219f4a2d-57b0-4709-ae99-c2ee159b653a', 'strecha', 'střešní okna Velux'],
    ['b533227c-1308-4337-9577-a7cc96f0cd55', 'strecha', 'rekonstrukce střechy statku'],
    ['b2c57631-8ffa-4dab-95ce-e793b62a8489', 'drevo', 'dřevěné balkony'],
    ['35bba246-e019-44ad-a301-acbad49192dc', 'podkrovi', 'podkroví ze sádrokartonu'],
    ['e74ede7f-dc99-46ac-9bd9-b4b2c1844551', 'drevo', 'dětský domek s prolézačkou'],
    ['b43945b5-7a75-4caf-8fae-095e1faa1126', 'strecha', 'bitumenový šindel'],
    ['1ae6b5b3-e4ad-4c3d-b87d-fbdfce941c77', 'strecha', 'hotová střecha s korouhví'],
    ['5c2d4ca8-10a4-4efc-ab72-ca4f925caa3b', 'krov', 'krov a vazníky'],
  ];
  const gal = document.getElementById('gal');
  const AR = { 'e74ede7f-dc99-46ac-9bd9-b4b2c1844551': '9/16', '11543985-7922-473c-a277-ce74a39ce111': '3/4', 'b2c57631-8ffa-4dab-95ce-e793b62a8489': '3/4', '1ae6b5b3-e4ad-4c3d-b87d-fbdfce941c77': '16/9', '219f4a2d-57b0-4709-ae99-c2ee159b653a': '16/9', '709aee4c-5de9-477a-9268-126bc1fc6846': '16/9', 'b533227c-1308-4337-9577-a7cc96f0cd55': '16/9', '5c2d4ca8-10a4-4efc-ab72-ca4f925caa3b': '2592/824' };
  gal.innerHTML = PH.map(([id, cat, t], i) => `<figure data-c="${cat}" data-i="${i}"><img loading="lazy" decoding="async" src="${CF}${id}.png" alt="${t}" style="aspect-ratio:${AR[id] || '4/3'};object-fit:cover"><figcaption>${t}</figcaption></figure>`).join('');
  document.getElementById('chips').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    [...b.parentNode.children].forEach(x => x.setAttribute('aria-pressed', x === b));
    const f = b.dataset.f;
    gal.querySelectorAll('figure').forEach(fg => fg.hidden = !(f === 'all' || fg.dataset.c === f));
  });
  gal.addEventListener('click', e => {
    const fg = e.target.closest('figure'); if (!fg) return;
    const [id, , t] = PH[+fg.dataset.i];
    const lb = document.createElement('div'); lb.className = 'lb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-label', t);
    lb.innerHTML = `<div><img src="${CF}${id}.png" alt="${t}"><p>${t}</p></div><button type="button">Zavřít ✕</button>`;
    const close = () => { lb.remove(); if (lenis) lenis.start(); removeEventListener('keydown', esc); };
    const esc = ev => { if (ev.key === 'Escape') close(); };
    lb.addEventListener('click', ev => { if (ev.target === lb || ev.target.tagName === 'BUTTON') close(); });
    addEventListener('keydown', esc);
    document.body.appendChild(lb); if (lenis) lenis.stop(); lb.querySelector('button').focus();
  });

  // ---------------------------------------------------------------- snow
  const sc = document.getElementById('snow');
  if (sc && !reduce) {
    const ctx = sc.getContext('2d'); let w, h, flakes = [];
    const size = () => { const r = sc.getBoundingClientRect(); w = sc.width = r.width; h = sc.height = r.height; flakes = Array.from({ length: Math.round(w / 9) }, () => ({ x: Math.random() * w, y: Math.random() * h, r: .6 + Math.random() * 2, s: .3 + Math.random() * .9, d: Math.random() * 6 })); };
    size(); addEventListener('resize', size);
    let vis = false; new IntersectionObserver(e => vis = e[0].isIntersecting).observe(sc);
    (function tick(t) {
      requestAnimationFrame(tick); if (!vis) return;
      ctx.clearRect(0, 0, w, h); ctx.fillStyle = 'rgba(230,240,255,.8)';
      for (const f of flakes) { f.y += f.s; f.x += Math.sin(t * .001 + f.d) * .3; if (f.y > h) { f.y = -4; f.x = Math.random() * w; } ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 7); ctx.fill(); }
    })(0);
  }

  // ---------------------------------------------------------------- form (demo)
  const form = document.getElementById('form');
  form.addEventListener('submit', e => { e.preventDefault(); document.getElementById('fOk').classList.add('on'); });
  // configurator hand-off
  document.getElementById('kSend').addEventListener('click', () => {
    const s = window.KONF && window.KONF.summary ? window.KONF.summary() : '';
    if (s) { document.getElementById('fZprava').value = s; document.getElementById('fCo').value = 'Pergola / garážové stání / altán'; }
  });
})();
