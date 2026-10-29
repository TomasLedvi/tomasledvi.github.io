/* Konfigurátor pergoly / garážového stání / altánu – živý 3D náhled + orientační výpočet řeziva */
(function () {
  'use strict';
  const canvas = document.getElementById('konf3d');
  if (!canvas || !window.THREE) return;
  const T = THREE;
  const tex = (window.KROV && window.KROV.tex) || {};
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = id => document.getElementById(id);
  const fmt = (v, d = 1) => v.toFixed(d).replace('.', ',');

  const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputEncoding = T.sRGBEncoding;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(34, 1, .1, 100);
  scene.add(new T.HemisphereLight(0xcfe0ff, 0x3a2a1a, .65));
  const sun = new T.DirectionalLight(0xffd6a8, 2.2); sun.position.set(-6, 9, 7); sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8 }); sun.shadow.bias = -.0005; sun.shadow.normalBias = .02;
  scene.add(sun);
  const fill = new T.DirectionalLight(0x8fb0ff, .4); fill.position.set(6, 4, -6); scene.add(fill);

  const groundTex = tex.ground ? tex.ground.clone() : null; if (groundTex) { groundTex.needsUpdate = true; groundTex.repeat.set(5, 5); }
  const gnd = new T.Mesh(new T.CircleGeometry(9, 64), new T.MeshStandardMaterial({ map: groundTex, color: 0x9a9a84, roughness: 1 }));
  gnd.rotation.x = -Math.PI / 2; gnd.receiveShadow = true; scene.add(gnd);
  // paving under the structure
  const pave = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshStandardMaterial({ color: 0x2c2824, roughness: .95 }));
  pave.rotation.x = -Math.PI / 2; pave.position.y = .005; pave.receiveShadow = true; scene.add(pave);

  const wood = new T.MeshStandardMaterial({ map: tex.woodSide || null, bumpMap: tex.woodSideB || null, bumpScale: .01, roughness: .75 });
  const woodEnd = new T.MeshStandardMaterial({ map: tex.woodEnd || null, roughness: .85 });
  const woodMats = [woodEnd, woodEnd, wood, wood, wood, wood];

  function canvasTex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.encoding = T.sRGBEncoding; return t; }
  const polyTex = canvasTex(256, 64, (c, w, h) => { c.fillStyle = '#d9ecf7'; c.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 16) { c.fillStyle = 'rgba(255,255,255,.9)'; c.fillRect(x, 0, 3, h); c.fillStyle = 'rgba(80,120,150,.25)'; c.fillRect(x + 8, 0, 2, h); } });
  const plechTex = canvasTex(256, 64, (c, w, h) => { const g = c.createLinearGradient(0, 0, 32, 0); g.addColorStop(0, '#3b4047'); g.addColorStop(.3, '#596069'); g.addColorStop(.5, '#2a2e33'); g.addColorStop(1, '#3b4047'); c.fillStyle = g; for (let x = 0; x < w; x += 32) { c.save(); c.translate(x, 0); c.fillRect(0, 0, 32, h); c.restore(); } });
  const sindelTex = canvasTex(256, 256, (c, w, h) => {
    c.fillStyle = '#3b2622'; c.fillRect(0, 0, w, h);
    for (let row = 0; row < 8; row++) for (let i = -1; i < 5; i++) {
      const x = i * 64 + (row % 2 ? 32 : 0), y = row * 32;
      c.fillStyle = `hsl(${8 + Math.random() * 8},${30 + Math.random() * 10}%,${16 + Math.random() * 8}%)`;
      c.beginPath(); c.moveTo(x + 2, y); c.lineTo(x + 62, y); c.lineTo(x + 62, y + 22); c.lineTo(x + 32, y + 31); c.lineTo(x + 2, y + 22); c.closePath(); c.fill();
      c.fillStyle = 'rgba(255,255,255,.04)'; for (let k = 0; k < 40; k++) c.fillRect(x + Math.random() * 60, y + Math.random() * 30, 1.5, 1.5);
    }
  });
  const ROOF = {
    poly: new T.MeshStandardMaterial({ map: polyTex, color: 0xcfe3f2, transparent: true, opacity: .62, roughness: .2, metalness: .1, side: T.DoubleSide, depthWrite: false }),
    plech: new T.MeshStandardMaterial({ map: plechTex, roughness: .35, metalness: .7, side: T.DoubleSide }),
    sindel: new T.MeshStandardMaterial({ map: sindelTex, roughness: .9, side: T.DoubleSide }),
  };
  const carMat = new T.MeshStandardMaterial({ color: 0x2c3138, roughness: .35, metalness: .6 });
  const tyre = new T.MeshStandardMaterial({ color: 0x111111, roughness: .9 });
  const glassMat = new T.MeshStandardMaterial({ color: 0x121a24, roughness: .1, metalness: .5 });

  function timber(L, w, h) {
    const g = new T.BoxGeometry(L, h, w); const uv = g.attributes.uv;
    for (let i = 8; i < 24; i++) uv.setX(i, uv.getX(i) * L / 2.2);
    const m = new T.Mesh(g, woodMats); m.castShadow = m.receiveShadow = true; return m;
  }
  function beamBetween(a, b, w, h) {
    const d = new T.Vector3().subVectors(b, a); const m = timber(d.length(), w, h);
    m.position.copy(a).add(b).multiplyScalar(.5); m.quaternion.setFromUnitVectors(new T.Vector3(1, 0, 0), d.normalize()); return m;
  }
  function post(x, z, h, s = .12) { const m = timber(h, s, s); m.rotation.z = Math.PI / 2; m.position.set(x, h / 2, z); return m; }

  const state = { typ: 'pergola', W: 4, D: 3.5, str: 'pult', kry: 'poly', barva: '#ffffff', barvaN: 'přírodní' };
  let model = null, calc = {};
  const OV = .3;

  function build() {
    if (model) { scene.remove(model); model.traverse(o => { if (o.geometry) o.geometry.dispose(); }); }
    model = new T.Group(); scene.add(model);
    wood.color.set(state.barva);
    const { W, D } = state;
    const H = state.typ === 'garaz' ? 2.5 : 2.4;
    const base = state.typ === 'altan' ? .18 : 0;
    const len = { posts: 0, beams: 0, rafters: 0, other: 0 };
    // altán: wooden deck
    if (state.typ === 'altan') {
      const nj = Math.ceil(D / .6) + 1;
      for (let i = 0; i < nj; i++) { const j = timber(W, .08, .12); j.position.set(0, .06, -D / 2 + i * D / (nj - 1)); model.add(j); len.other += W; }
      const nb = Math.ceil(W / .145);
      for (let i = 0; i < nb; i++) { const b = timber(D + .04, .13, .028); b.rotation.y = Math.PI / 2; b.position.set(-W / 2 + .07 + i * (W - .14) / (nb - 1), .134, 0); model.add(b); len.other += D; }
    }
    // posts along both long sides, spacing ≤ 3 m
    const nz = Math.max(2, Math.ceil(D / 3) + 1);
    const pz = []; for (let i = 0; i < nz; i++) pz.push(-D / 2 + .1 + i * (D - .2) / (nz - 1));
    const slope = state.str === 'pult' ? 8 * Math.PI / 180 : 25 * Math.PI / 180;
    const dropPult = state.str === 'pult' ? W * Math.tan(slope) : 0; // left side higher
    const hL = H + dropPult, hR = H;
    pz.forEach(z => {
      [[-W / 2 + .06, hL], [W / 2 - .06, hR]].forEach(([x, h]) => { const m = post(x, z, h - base, .12); m.position.y += base; model.add(m); len.posts += h - base; });
    });
    // knee braces (pásky) at each post toward the beam
    pz.forEach((z, i) => [[-W / 2 + .06, hL], [W / 2 - .06, hR]].forEach(([x, h]) => {
      [-1, 1].forEach(dz => { if ((i === 0 && dz < 0) || (i === nz - 1 && dz > 0)) return; const b = beamBetween(new T.Vector3(x, h - .55, z), new T.Vector3(x, h - .12, z + dz * .45), .08, .08); model.add(b); len.other += .62; });
    }));
    // side beams (vaznice) along D on top of the posts
    [[-W / 2 + .06, hL], [W / 2 - .06, hR]].forEach(([x, h]) => { const b = timber(D + 2 * OV, .12, .2); b.rotation.y = Math.PI / 2; b.position.set(x, h + .1, 0); model.add(b); len.beams += D + 2 * OV; });
    // rafters across W every ~0.8 m
    const nr = Math.floor((D + 2 * OV - .1) / .8) + 1;
    const rz = []; for (let i = 0; i < nr; i++) rz.push(-D / 2 - OV + .05 + i * (D + 2 * OV - .1) / (nr - 1));
    let roofArea = 0;
    if (state.str === 'pult') {
      const a = new T.Vector3(-W / 2 - OV, hL + .2 + .08 + OV * Math.tan(slope), 0), b = new T.Vector3(W / 2 + OV, hR + .2 + .08 - OV * Math.tan(slope), 0);
      rz.forEach(z => { const r = beamBetween(a.clone().setZ(z), b.clone().setZ(z), .06, .14); model.add(r); len.rafters += a.distanceTo(b); });
      const L = a.distanceTo(b);
      const roof = new T.Mesh(new T.PlaneGeometry(L, D + 2 * OV + .1), ROOF[state.kry]);
      roof.material.map.repeat.set(state.kry === 'sindel' ? L / 1.2 : L / 1.6, state.kry === 'sindel' ? (D + .7) / 1.2 : (D + .7) / 1.6);
      roof.position.set(0, (a.y + b.y) / 2 + .1, 0); roof.rotation.set(-Math.PI / 2, 0, 0); roof.rotateOnWorldAxis(new T.Vector3(0, 0, 1), -slope);
      roof.castShadow = state.kry !== 'poly'; roof.receiveShadow = true; model.add(roof);
      roofArea = L * (D + 2 * OV);
    } else {
      const rise = (W / 2) * Math.tan(slope);
      const top = H + .28 + rise;
      // tie beams at the ends + king posts + ridge
      [rz[0] + .05, rz[rz.length - 1] - .05].forEach(z => { const t = timber(W, .08, .16); t.position.set(0, H + .28, z); model.add(t); len.other += W; const k = post(0, z, rise, .1); k.position.y = H + .28 + rise / 2; model.add(k); len.other += rise; });
      const ridge = timber(D + 2 * OV, .1, .16); ridge.rotation.y = Math.PI / 2; ridge.position.set(0, top, 0); model.add(ridge); len.beams += D + 2 * OV;
      const L = (W / 2 + OV) / Math.cos(slope);
      rz.forEach(z => [-1, 1].forEach(s => {
        const a = new T.Vector3(s * (W / 2 + OV), H + .28 - OV * Math.tan(slope), z), b = new T.Vector3(0, top + .05, z);
        model.add(beamBetween(a, b, .06, .14)); len.rafters += a.distanceTo(b);
      }));
      [-1, 1].forEach(s => {
        const roof = new T.Mesh(new T.PlaneGeometry(L + .05, D + 2 * OV + .1), ROOF[state.kry]);
        roof.material.map.repeat.set(state.kry === 'sindel' ? L / 1.2 : L / 1.6, state.kry === 'sindel' ? (D + .7) / 1.2 : (D + .7) / 1.6);
        roof.rotation.set(-Math.PI / 2, 0, 0); roof.rotateOnWorldAxis(new T.Vector3(0, 0, 1), -s * slope);
        roof.position.set(s * (W / 2 + OV) / 2, H + .28 + .1 + rise / 2 - OV * Math.tan(slope) / 2 + .07, 0);
        roof.castShadow = state.kry !== 'poly'; roof.receiveShadow = true; model.add(roof);
      });
      roofArea = 2 * L * (D + 2 * OV);
    }
    // altán railing on three sides
    if (state.typ === 'altan') {
      const rh = base + .95;
      const sides = [[[-W / 2 + .06, -D / 2], [-W / 2 + .06, D / 2]], [[W / 2 - .06, -D / 2], [W / 2 - .06, D / 2]], [[-W / 2, D / 2 - .06], [W / 2, D / 2 - .06]]];
      sides.forEach(([p, q]) => {
        const a = new T.Vector3(p[0], rh, p[1]), b = new T.Vector3(q[0], rh, q[1]);
        model.add(beamBetween(a, b, .1, .05)); len.other += a.distanceTo(b);
        const n = Math.round(a.distanceTo(b) / .14);
        for (let i = 1; i < n; i++) { const t = i / n; const x = lerp(p[0], q[0], t), z = lerp(p[1], q[1], t); const bal = post(x, z, rh - base - .04, .045); bal.position.y += base; model.add(bal); len.other += rh - base; }
      });
    }
    // car for scale
    if (state.typ === 'garaz') {
      const car = new T.Group();
      const body = new T.Mesh(new T.BoxGeometry(1.75, .62, Math.min(4.3, D - .3)), carMat); body.position.y = .55; body.castShadow = true; car.add(body);
      const cab = new T.Mesh(new T.BoxGeometry(1.5, .48, Math.min(2.2, D * .5)), glassMat); cab.position.set(0, 1.08, -.15); cab.castShadow = true; car.add(cab);
      const cl = Math.min(4.3, D - .3) / 2 - .7;
      [[-.8, cl], [.8, cl], [-.8, -cl], [.8, -cl]].forEach(([x, z]) => { const w = new T.Mesh(new T.CylinderGeometry(.32, .32, .22, 20), tyre); w.rotation.z = Math.PI / 2; w.position.set(x, .32, z); w.castShadow = true; car.add(w); });
      model.add(car);
    }
    pave.scale.set(W + .8, D + .8, 1);
    const total = len.posts + len.beams + len.rafters + len.other;
    calc = { plocha: roofArea, sloupy: nz * 2, krokve: state.str === 'pult' ? nr : nr * 2, rezivo: total, H: Math.max(hL, hR) + (state.str === 'sedlo' ? W / 2 * Math.tan(slope) + .3 : .3) };
    $('cPlocha').textContent = fmt(roofArea) + ' m²';
    $('cSloupy').textContent = calc.sloupy + ' ks';
    $('cKrokve').textContent = calc.krokve + ' ks';
    $('cRezivo').textContent = fmt(total, 0) + ' m';
    $('kDims').innerHTML = `šířka ${fmt(W)} m<br>hloubka ${fmt(D)} m<br>výška cca ${fmt(calc.H)} m`;
    frame();
  }
  const lerp = (a, b, t) => a + (b - a) * t;
  const NAMES = { pergola: 'Pergola', garaz: 'Garážové stání', altan: 'Altán', pult: 'pultová', sedlo: 'sedlová', poly: 'polykarbonát', sindel: 'bitumenový šindel', plech: 'plech' };

  // UI wiring
  function segGroup(id, key) {
    $(id).addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      [...b.parentNode.children].forEach(x => x.setAttribute('aria-pressed', x === b));
      state[key] = b.dataset.v;
      if (key === 'typ') {
        if (b.dataset.v === 'garaz') { setRange('kSirka', 3.4); setRange('kHloubka', 5.8); }
        if (b.dataset.v === 'altan') { setRange('kSirka', 3.2); setRange('kHloubka', 3.2); }
        if (b.dataset.v === 'pergola') { setRange('kSirka', 4); setRange('kHloubka', 3.5); }
      }
      build();
    });
  }
  function setRange(id, v) { $(id).value = v; state[id === 'kSirka' ? 'W' : 'D'] = v; $(id === 'kSirka' ? 'oSirka' : 'oHloubka').textContent = fmt(+v) + ' m'; }
  segGroup('kTyp', 'typ'); segGroup('kStr', 'str'); segGroup('kKry', 'kry');
  $('kBarva').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    [...b.parentNode.children].forEach(x => x.setAttribute('aria-pressed', x === b));
    state.barva = b.dataset.v; state.barvaN = b.dataset.n; $('oBarva').textContent = b.dataset.n; wood.color.set(state.barva);
  });
  ['kSirka', 'kHloubka'].forEach(id => $(id).addEventListener('input', e => { setRange(id, +e.target.value); build(); }));

  // orbit
  let yaw = -.65, pitch = .32, dist = 9, drag = null, idle = 0;
  canvas.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, yaw, pitch }; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', e => { if (!drag) return; yaw = drag.yaw - (e.clientX - drag.x) * .008; pitch = Math.max(.08, Math.min(.9, drag.pitch + (e.clientY - drag.y) * .005)); idle = 0; });
  canvas.addEventListener('pointerup', () => drag = null); canvas.addEventListener('pointercancel', () => drag = null);
  function frame() { const asp = camera.aspect || 1; dist = (Math.hypot(state.W, state.D) * 1.25 + 3.2) / Math.min(1, asp * .95 + .1); }
  function resize() { const r = canvas.getBoundingClientRect(); if (!r.width) return; renderer.setSize(r.width, r.height, false); camera.aspect = r.width / r.height; camera.updateProjectionMatrix(); frame(); }
  addEventListener('resize', resize); resize();
  let vis = false; new IntersectionObserver(e => vis = e[0].isIntersecting, { rootMargin: '100px' }).observe(canvas);
  let last = performance.now();
  (function loop(t) {
    requestAnimationFrame(loop); if (!vis) return;
    const dt = Math.min(.05, (t - last) / 1000); last = t;
    if (!drag && !reduce) { idle += dt; if (idle > 2) yaw += dt * .12; }
    const ty = 1.3;
    camera.position.set(Math.sin(yaw) * Math.cos(pitch) * dist, ty + Math.sin(pitch) * dist, Math.cos(yaw) * Math.cos(pitch) * dist);
    camera.lookAt(0, ty, 0);
    renderer.render(scene, camera);
  })(last);

  build();
  window.KONF = {
    state, calc: () => calc,
    summary() {
      return `Dobrý den, mám zájem o: ${NAMES[state.typ]}\n` +
        `Rozměry: ${fmt(state.W)} × ${fmt(state.D)} m, střecha ${NAMES[state.str]}, krytina ${NAMES[state.kry]}, barva dřeva ${state.barvaN}.\n` +
        `Orientačně z konfigurátoru: plocha střechy ${fmt(calc.plocha)} m², ${calc.sloupy} sloupků, ${calc.krokve} krokví.\n`;
    }
  };
})();
