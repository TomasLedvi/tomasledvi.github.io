/* Střešní kalkulačka: tvar střechy, rozměry domu, sklon, krytina, barva, střešní okna → živý 3D dům + výpočet materiálu */
(function () {
  'use strict';
  const canvas = document.getElementById('strecha3d');
  if (!canvas || !window.THREE || !window.STAVBA) return;
  const T = THREE, S = STAVBA;
  const $ = id => document.getElementById(id);
  const fmt = (v, d = 1) => (Math.round(v * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d).replace('.', ',');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setClearColor(0, 0);
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, innerWidth < 760 ? 1.5 : 2));
  renderer.outputEncoding = T.sRGBEncoding; renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
  S.setRenderer(renderer);
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(32, 1, .1, 200);
  scene.add(new T.HemisphereLight(0xcfdcff, 0x3b2a1a, .62));
  const sun = new T.DirectionalLight(0xffdcb0, 2.3); sun.position.set(-9, 14, -8); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 60 });
  sun.shadow.bias = -.0004; sun.shadow.normalBias = .03; scene.add(sun);
  const fill = new T.DirectionalLight(0x9db8ff, .45); fill.position.set(10, 6, 8); scene.add(fill);
  const M = S.materials();
  const ground = new T.Mesh(new T.CircleGeometry(16, 64), M.ground); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  const lawnEdge = S.grass(4, 15, 2600, 7, (x, z) => Math.abs(x) < 7.5 && Math.abs(z) < 9.5); scene.add(lawnEdge);
  [[-11, 9, 8.5, 1], [12, 7, 7, 2], [10.5, -10, 9, 3], [-12.5, -8, 6.5, 4]].forEach(([x, z, h, s]) => { const t = S.spruce(h, s); t.position.set(x, 0, z); scene.add(t); });

  const state = { tvar: 'sedlova', L: 11, W: 8, sklon: 38, kryt: 'betonová', barva: 0, okna: 2, stav: 'novostavba' };
  let house = null, calc = {};

  function clear() { if (!house) return; scene.remove(house); house.traverse(o => { if (o.geometry) o.geometry.dispose(); }); }

  function build() {
    clear();
    house = new T.Group(); scene.add(house);
    const { L, W } = state, wallH = 3.0, a = state.sklon * Math.PI / 180, ta = Math.tan(a);
    const O = .55, V = .4;                        // eave overhang, verge overhang
    const cv = S.COVERS[state.kryt], color = cv.colors[Math.min(state.barva, cv.colors.length - 1)][1];
    const roofMat = S.coverMaterial(state.kryt, color);
    const capMat = new T.MeshStandardMaterial({ color: new T.Color(color).multiplyScalar(.85), roughness: cv.rough, metalness: cv.metal, side: T.DoubleSide });
    house.add(S.houseBody(L, W, wallH));
    const e = wallH + .18;                       // top of wall plate
    const y0 = e - O * ta;                       // eave edge height
    const faces = [];                            // {pts, u, n, up}
    let ridgeLen = 0, hipLen = 0, eaveLen = 0, vergeLen = 0, area = 0, svody = 2;
    const gutters = [], caps = [], gableWalls = [];
    const v3 = (x, y, z) => new T.Vector3(x, y, z);

    if (state.tvar === 'sedlova') {
      const yr = e + (W / 2) * ta, Z = L / 2 + V, X = W / 2 + O;
      faces.push({ pts: [v3(X, y0, -Z), v3(X, y0, Z), v3(0, yr, Z), v3(0, yr, -Z)], u: v3(0, 0, 1) });
      faces.push({ pts: [v3(-X, y0, Z), v3(-X, y0, -Z), v3(0, yr, -Z), v3(0, yr, Z)], u: v3(0, 0, -1) });
      ridgeLen = 2 * Z; eaveLen = 2 * 2 * Z; vergeLen = 4 * Math.hypot(X, yr - y0);
      caps.push([v3(0, yr + .02, -Z), v3(0, yr + .02, Z)]);
      gutters.push([v3(X + .05, y0 - .06, -Z), v3(X + .05, y0 - .06, Z)], [v3(-X - .05, y0 - .06, -Z), v3(-X - .05, y0 - .06, Z)]);
      [-1, 1].forEach(s => gableWalls.push([v3(-W / 2, wallH, s * L / 2), v3(W / 2, wallH, s * L / 2), v3(0, yr - .05, s * L / 2)]));
      area = 2 * (2 * Z) * Math.hypot(X, yr - y0);
    } else if (state.tvar === 'valbova') {
      const X = W / 2 + O, Z = L / 2 + O, run = X, yr = y0 + run * ta, zr = Math.max(0, Z - run);
      faces.push({ pts: [v3(X, y0, -Z), v3(X, y0, Z), v3(0, yr, zr), v3(0, yr, -zr)], u: v3(0, 0, 1) });
      faces.push({ pts: [v3(-X, y0, Z), v3(-X, y0, -Z), v3(0, yr, -zr), v3(0, yr, zr)], u: v3(0, 0, -1) });
      faces.push({ pts: [v3(-X, y0, -Z), v3(X, y0, -Z), v3(0, yr, -zr)], u: v3(1, 0, 0) });
      faces.push({ pts: [v3(X, y0, Z), v3(-X, y0, Z), v3(0, yr, zr)], u: v3(-1, 0, 0) });
      ridgeLen = 2 * zr; eaveLen = 2 * (2 * X) + 2 * (2 * Z); svody = 4;
      const hip = Math.sqrt(2 * run * run + (yr - y0) * (yr - y0)); hipLen = 4 * hip;
      if (zr > 0) caps.push([v3(0, yr + .02, -zr), v3(0, yr + .02, zr)]);
      [[X, -Z, -zr], [-X, -Z, -zr], [X, Z, zr], [-X, Z, zr]].forEach(([x, z, zz]) => caps.push([v3(x, y0 + .02, z), v3(0, yr + .02, zz)]));
      gutters.push([v3(X + .05, y0 - .06, -Z), v3(X + .05, y0 - .06, Z)], [v3(-X - .05, y0 - .06, -Z), v3(-X - .05, y0 - .06, Z)], [v3(-X, y0 - .06, -Z - .05), v3(X, y0 - .06, -Z - .05)], [v3(-X, y0 - .06, Z + .05), v3(X, y0 - .06, Z + .05)]);
      area = (2 * X) * (2 * Z) / Math.cos(a);
    } else { // pultová – vysoká strana vlevo (−x), nízká vpravo (+x)
      const X = W / 2 + O, Z = L / 2 + V, ylow = y0, yhigh = e + W * ta + O * ta;
      faces.push({ pts: [v3(X, ylow, -Z), v3(X, ylow, Z), v3(-X, yhigh, Z), v3(-X, yhigh, -Z)], u: v3(0, 0, 1) });
      eaveLen = 2 * Z; vergeLen = 2 * Math.hypot(2 * X, yhigh - ylow); ridgeLen = 0;
      gutters.push([v3(X + .05, ylow - .06, -Z), v3(X + .05, ylow - .06, Z)]);
      const yw = e + W * ta;
      [-1, 1].forEach(s => gableWalls.push([v3(-W / 2, wallH, s * L / 2), v3(W / 2, wallH, s * L / 2), v3(W / 2, e, s * L / 2), v3(-W / 2, yw - .05, s * L / 2)]));
      gableWalls.push([v3(-W / 2, wallH, -L / 2), v3(-W / 2, wallH, L / 2), v3(-W / 2, yw - .05, L / 2), v3(-W / 2, yw - .05, -L / 2)]);
      area = (2 * Z) * Math.hypot(2 * X, yhigh - ylow);
    }
    // gable / raised walls in plaster
    gableWalls.forEach(pts => { const m = S.faceMesh(pts, v3(1, 0, 0), M.wall); house.add(m); });
    // roof faces (+ a thin underside so the overhang looks solid)
    const lift = .16;
    faces.forEach(f => {
      const pts = f.pts.map(p => p.clone().add(v3(0, lift, 0)));
      const m = S.faceMesh(pts, f.u, roofMat);
      // make sure the normal points up
      const n = new T.Vector3().subVectors(pts[1], pts[0]).cross(new T.Vector3().subVectors(pts[2], pts[0])).normalize();
      if (n.y < 0) { m.geometry.dispose(); const r = pts.slice().reverse(); house.add(f.mesh = S.faceMesh(r, f.u, roofMat)); f.n = n.negate(); }
      else { house.add(f.mesh = m); f.n = n; }
      f.pts = pts;
      const under = S.faceMesh(f.pts.map(p => p.clone().add(v3(0, -.12, 0))), f.u, M.fascia); under.castShadow = false; house.add(under);
    });
    // fascia boards along eaves
    gutters.forEach(([a, b]) => {
      const fa = S.beamBetween(a.clone().add(v3(0, .12, 0)), b.clone().add(v3(0, .12, 0)), .03, .2, [M.fascia, M.fascia, M.fascia, M.fascia, M.fascia, M.fascia], house);
      const g = S.halfPipe(a, b, .075, M.metal, v3(0, 1, 0), 'up'); house.add(g);
    });
    // downpipes at the ends of gutters
    let nPipes = 0;
    gutters.forEach(([a, b], i) => { if (i > 1) return; [a, b].forEach(p => { const z = p.z - Math.sign(p.z) * .25; house.add(S.pipe(v3(p.x, p.y - .04, z), v3(p.x, .1, z), .045, M.metal)); nPipes++; }); });
    svody = nPipes;
    // ridge and hip caps
    caps.forEach(([a, b]) => { const c = S.halfPipe(a.clone().add(v3(0, lift, 0)), b.clone().add(v3(0, lift, 0)), .13, capMat, v3(0, 1, 0), 'down'); house.add(c); });
    // verge boards on gable ends
    if (state.tvar !== 'valbova') faces.forEach(f => {
      const p = f.pts; const pairs = state.tvar === 'sedlova' ? [[p[0], p[3]], [p[1], p[2]]] : [[p[0], p[3]], [p[1], p[2]]];
      pairs.forEach(([a, b]) => S.beamBetween(a.clone().add(v3(0, -.05, 0)), b.clone().add(v3(0, -.05, 0)), .04, .22, [M.fascia, M.fascia, M.fascia, M.fascia, M.fascia, M.fascia], house));
    });
    // roof windows on the face visible from the default camera (+x side)
    const f0 = faces[0]; const nOkna = state.okna;
    if (nOkna > 0) {
      const eA = f0.pts[0], eB = f0.pts[1], top = f0.pts[3];
      const along = new T.Vector3().subVectors(eB, eA), upDir = new T.Vector3().subVectors(top, eA).sub(along.clone().normalize().multiplyScalar(new T.Vector3().subVectors(top, eA).dot(along.clone().normalize()))).normalize();
      const slopeLen = new T.Vector3().subVectors(top, eA).dot(upDir);
      for (let i = 0; i < nOkna; i++) {
        const t = (i + 1) / (nOkna + 1);
        const pos = eA.clone().add(along.clone().multiplyScalar(t)).add(upDir.clone().multiplyScalar(slopeLen * .48)).add(f0.n.clone().multiplyScalar(.05));
        const w = S.roofWindow(); S.orientOnSlope(w, f0.n, upDir); w.position.copy(pos); house.add(w);
      }
    }
    // chimney
    const ch = new T.Mesh(new T.BoxGeometry(.6, 1, .6), M.brick); const chY = state.tvar === 'pultova' ? e + W * ta * .7 : e + (W / 2) * ta * .8;
    ch.scale.y = 2.4; ch.position.set(state.tvar === 'pultova' ? -W * .2 : -W * .18, chY + .6, L * .18); ch.castShadow = true; house.add(ch);

    // ------------- calculations (orientační)
    const krytina = area * 1.1;
    const tiles = cv.kind === 'tile' ? Math.round(area * (state.kryt === 'pálená' ? 13 : 10.5) / 10) * 10 : 0;
    const late = cv.kind === 'tile' ? area / .33 : 0;
    calc = { area, krytina, tiles, late, ridgeLen, hipLen, eaveLen, vergeLen, svody, okna: nOkna };
    $('rPlocha').textContent = fmt(area) + ' m²';
    $('rKrytina').textContent = cv.kind === 'tile' ? `≈ ${tiles.toLocaleString('cs-CZ')} ks` : fmt(krytina) + ' m²';
    $('rKrytinaL').textContent = cv.kind === 'tile' ? 'tašek (vč. rezervy na prořez)' : 'krytiny vč. 10 % prořezu';
    $('rLate').textContent = cv.kind === 'tile' ? fmt(late, 0) + ' bm' : fmt(area, 0) + ' m²';
    $('rLateL').textContent = cv.kind === 'tile' ? 'střešních latí' : 'bednění pod krytinu';
    $('rHreben').textContent = fmt(ridgeLen + hipLen) + ' bm';
    $('rHrebenL').textContent = state.tvar === 'valbova' ? 'hřeben a nároží' : state.tvar === 'pultova' ? 'hřeben (pultová ho nemá)' : 'hřeben';
    $('rOkap').textContent = fmt(eaveLen) + ' bm';
    $('rSvody').textContent = svody + ' ks';
    $('rDims').innerHTML = `dům ${fmt(L)} × ${fmt(W)} m<br>sklon ${state.sklon}°<br>${cv.label.toLowerCase()}`;
    frame();
  }

  // ------------- UI
  const NAMES = { sedlova: 'sedlová', valbova: 'valbová', pultova: 'pultová' };
  function seg(id, key, after) {
    $(id).addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      [...b.parentNode.children].forEach(x => x.setAttribute('aria-pressed', x === b));
      state[key] = isNaN(+b.dataset.v) ? b.dataset.v : +b.dataset.v; if (after) after(b); build();
    });
  }
  function swatches() {
    const cv = S.COVERS[state.kryt], box = $('rBarva');
    state.barva = Math.min(state.barva, cv.colors.length - 1);
    box.innerHTML = cv.colors.map(([n, c], i) => `<button type="button" id="rb-${i}" data-v="${i}" aria-pressed="${i === state.barva}" aria-label="${n}" title="${n}" style="background:${c}"></button>`).join('');
    $('oRBarva').textContent = cv.colors[state.barva][0];
  }
  seg('rTvar', 'tvar', b => { const s = $('rSklon'); if (b.dataset.v === 'pultova') { s.min = 6; s.max = 25; if (state.sklon > 25) setSklon(12); } else { s.min = 15; s.max = 50; if (state.sklon < 15) setSklon(38); } });
  seg('rKryt', 'kryt', () => swatches());
  seg('rStav', 'stav');
  $('rBarva').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    state.barva = +b.dataset.v; [...b.parentNode.children].forEach(x => x.setAttribute('aria-pressed', x === b));
    $('oRBarva').textContent = S.COVERS[state.kryt].colors[state.barva][0]; build();
  });
  function setSklon(v) { state.sklon = +v; $('rSklon').value = v; $('oSklon').textContent = v + '°'; }
  $('rSklon').addEventListener('input', e => { setSklon(e.target.value); build(); });
  $('rDelka').addEventListener('input', e => { state.L = +e.target.value; $('oDelka').textContent = fmt(state.L) + ' m'; build(); });
  $('rSirka').addEventListener('input', e => { state.W = +e.target.value; $('oSirkaD').textContent = fmt(state.W) + ' m'; build(); });
  $('rOkna').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    state.okna = Math.max(0, Math.min(6, state.okna + (+b.dataset.d))); $('oOkna').textContent = state.okna; build();
  });

  // ------------- orbit
  let yaw = 2.35, pitch = .38, dist = 30, drag = null, idle = 0;
  canvas.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, yaw, pitch }; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', e => { if (!drag) return; yaw = drag.yaw - (e.clientX - drag.x) * .007; pitch = Math.max(.1, Math.min(1.1, drag.pitch + (e.clientY - drag.y) * .004)); idle = 0; });
  canvas.addEventListener('pointerup', () => drag = null); canvas.addEventListener('pointercancel', () => drag = null);
  function frame() { const asp = camera.aspect || 1; dist = (Math.hypot(state.L, state.W) * 1.25 + 6) / Math.min(1, asp * .9 + .12); }
  function resize() { const r = canvas.getBoundingClientRect(); if (!r.width) return; renderer.setSize(r.width, r.height, false); camera.aspect = r.width / r.height; camera.updateProjectionMatrix(); frame(); }
  addEventListener('resize', resize); resize();
  let vis = false; new IntersectionObserver(e => vis = e[0].isIntersecting, { rootMargin: '150px' }).observe(canvas);
  let last = performance.now(), d = dist;
  (function loop(t) {
    requestAnimationFrame(loop); if (!vis) return;
    const dt = Math.min(.05, (t - last) / 1000); last = t;
    if (!drag && !reduce) { idle += dt; if (idle > 2.5) yaw += dt * .1; }
    d += (dist - d) * .08;
    const ty = 3.2;
    camera.position.set(Math.sin(yaw) * Math.cos(pitch) * d, ty + Math.sin(pitch) * d, Math.cos(yaw) * Math.cos(pitch) * d);
    camera.lookAt(0, ty, 0);
    renderer.render(scene, camera);
  })(last);

  swatches(); build();
  window.STRECHA = {
    state, calc: () => calc,
    summary() {
      const cv = S.COVERS[state.kryt];
      return `Dobrý den, poptávám ${state.stav === 'vymena' ? 'výměnu střechy' : 'novou střechu'}.\n` +
        `Dům cca ${fmt(state.L)} × ${fmt(state.W)} m, střecha ${NAMES[state.tvar]}, sklon cca ${state.sklon}°.\n` +
        `Krytina: ${cv.label.toLowerCase()} (${cv.colors[state.barva][0]}), střešní okna: ${state.okna} ks.\n` +
        `Z kalkulačky: plocha střechy ${fmt(calc.area)} m², okapy ${fmt(calc.eaveLen)} bm${state.tvar === 'pultova' ? '' : `, hřeben${state.tvar === 'valbova' ? ' a nároží' : ''} ${fmt(calc.ridgeLen + calc.hipLen)} bm`}.\n`;
    }
  };
})();
