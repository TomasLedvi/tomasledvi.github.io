/* Sdílené stavební díly pro 3D scény Štýbr: textury (dřevo, kůra, omítka, krytiny s normálovou mapou),
   trámy, plochy střechy s UV v metrech, okapy, hřebenáče, střešní okna, dům, stromy, tráva. */
(function () {
  'use strict';
  const T = THREE;
  const S = {};
  S.rng = function (seed) { let a = seed | 0; return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
  const rng = S.rng;
  let maxAniso = 4;
  S.setRenderer = r => { maxAniso = Math.min(8, r.capabilities.getMaxAnisotropy()); };

  function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function tex(c, srgb = true) {
    const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.anisotropy = maxAniso;
    if (srgb) t.encoding = T.sRGBEncoding; return t;
  }
  /** normal map from a height canvas (grey = height) */
  function normalFrom(hc, strength = 2) {
    const w = hc.width, h = hc.height, src = hc.getContext('2d').getImageData(0, 0, w, h).data;
    const out = canvas(w, h), ctx = out.getContext('2d'), img = ctx.createImageData(w, h), d = img.data;
    const H = (x, y) => src[(((y + h) % h) * w + ((x + w) % w)) * 4] / 255;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const dx = (H(x + 1, y) - H(x - 1, y)) * strength, dy = (H(x, y + 1) - H(x, y - 1)) * strength;
      let nx = -dx, ny = dy, nz = 1; const l = Math.hypot(nx, ny, nz); nx /= l; ny /= l; nz /= l;
      const i = (y * w + x) * 4; d[i] = (nx * .5 + .5) * 255; d[i + 1] = (ny * .5 + .5) * 255; d[i + 2] = (nz * .5 + .5) * 255; d[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0); return tex(out, false);
  }

  // ---------------------------------------------------------------- wood
  function grain(ctx, w, h, seed, mono) {
    const r = rng(seed);
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, mono ? '#9a9a9a' : '#ddb47c'); g.addColorStop(.5, mono ? '#b0b0b0' : '#e9c792'); g.addColorStop(1, mono ? '#959595' : '#d6ab72');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 9; i++) {
      const y0 = r() * h, hh = 10 + r() * 40, gb = ctx.createLinearGradient(0, y0 - hh, 0, y0 + hh);
      gb.addColorStop(0, 'rgba(0,0,0,0)'); gb.addColorStop(.5, mono ? `rgba(0,0,0,${.1 + r() * .12})` : `rgba(${150 + r() * 30},${90 + r() * 20},40,${.1 + r() * .14})`); gb.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gb; ctx.fillRect(0, y0 - hh, w, hh * 2);
    }
    for (let i = 0; i < 26; i++) {
      const y0 = r() * h, amp = 3 + r() * 14, fr = .0015 + r() * .004, ph = r() * 9;
      ctx.strokeStyle = mono ? `rgba(40,40,40,${.08 + r() * .18})` : `rgba(${130 + r() * 30},${78 + r() * 20},${30 + r() * 12},${.08 + r() * .17})`;
      ctx.lineWidth = .5 + r() * 1.6; ctx.beginPath();
      for (let x = 0; x <= w; x += 8) { const y = y0 + Math.sin(x * fr + ph) * amp + Math.sin(x * fr * 3.1 + ph * 2) * amp * .3; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();
    }
    for (let k = 0; k < 3; k++) {
      const kx = r() * w, ky = r() * h, kr = 6 + r() * 12;
      for (let j = 6; j > 0; j--) { ctx.fillStyle = mono ? `rgba(30,30,30,${.1 + j * .03})` : `rgba(${110 - j * 8},${60 - j * 4},25,${.1 + j * .05})`; ctx.beginPath(); ctx.ellipse(kx, ky, kr * j * .45, kr * j * .22, 0, 0, 7); ctx.fill(); }
      ctx.fillStyle = mono ? 'rgba(10,10,10,.6)' : 'rgba(70,35,12,.75)'; ctx.beginPath(); ctx.ellipse(kx, ky, kr * .5, kr * .32, 0, 0, 7); ctx.fill();
    }
    for (let i = 0; i < 1600; i++) { ctx.fillStyle = mono ? `rgba(0,0,0,${r() * .06})` : `rgba(90,50,20,${r() * .04})`; ctx.fillRect(r() * w, r() * h, 6 + r() * 30, 1); }
  }
  S.textures = function () {
    if (S._tx) return S._tx;
    const ws = canvas(1024, 256); grain(ws.getContext('2d'), 1024, 256, 7, false);
    const wb = canvas(1024, 256); grain(wb.getContext('2d'), 1024, 256, 7, true);
    const we = canvas(256, 256); { const c = we.getContext('2d'); c.fillStyle = '#e4c08c'; c.fillRect(0, 0, 256, 256); const r = rng(3), cx = 98, cy = 160;
      for (let i = 40; i > 0; i--) { c.strokeStyle = `rgba(${130 + r() * 30},${75 + r() * 20},30,${.25 + r() * .3})`; c.lineWidth = 1 + r() * 2.5; c.beginPath(); c.arc(cx + r() * 3, cy + r() * 3, i * 9 + r() * 4, 0, 7); c.stroke(); }
      for (let i = 0; i < 18; i++) { c.strokeStyle = 'rgba(80,40,10,.25)'; c.beginPath(); c.moveTo(cx, cy); const a = r() * 7; c.lineTo(cx + Math.cos(a) * 400, cy + Math.sin(a) * 400); c.stroke(); } }
    const bk = canvas(512, 1024); { const c = bk.getContext('2d'), w = 512, h = 1024; c.fillStyle = '#2a211b'; c.fillRect(0, 0, w, h); const r = rng(11);
      for (let i = 0; i < 1400; i++) { const x = r() * w, y = r() * h, pw = 10 + r() * 26, ph = 18 + r() * 60; c.fillStyle = `hsl(${22 + r() * 12},${8 + r() * 10}%,${28 + r() * 22}%)`; c.beginPath(); c.ellipse(x, y, pw / 2, ph / 2, (r() - .5) * .3, 0, 7); c.fill(); c.fillStyle = `rgba(255,240,220,${r() * .08})`; c.beginPath(); c.ellipse(x - pw * .12, y - ph * .15, pw * .3, ph * .3, 0, 0, 7); c.fill(); }
      for (let i = 0; i < 140; i++) { c.strokeStyle = `rgba(12,8,6,${.5 + r() * .4})`; c.lineWidth = 1.5 + r() * 3; let x = r() * w, y = r() * h; c.beginPath(); c.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (r() - .5) * 8; y += 15 + r() * 30; c.lineTo(x, y); } c.stroke(); }
      for (let i = 0; i < 260; i++) { c.fillStyle = `rgba(${110 + r() * 40},${120 + r() * 30},${70 + r() * 20},${r() * .25})`; c.fillRect(r() * w, r() * h, 2 + r() * 5, 2 + r() * 5); } }
    const gr = canvas(512, 512); { const c = gr.getContext('2d'); c.fillStyle = '#2b2a1f'; c.fillRect(0, 0, 512, 512); const r = rng(5);
      for (let i = 0; i < 9000; i++) { const v = r(); c.fillStyle = v < .55 ? `rgba(70,84,40,${r() * .5})` : v < .8 ? `rgba(110,90,60,${r() * .35})` : `rgba(20,18,12,${r() * .5})`; c.fillRect(r() * 512, r() * 512, 2 + r() * 3, 1 + r() * 3); } }
    const pl = canvas(512, 512); { const c = pl.getContext('2d'); c.fillStyle = '#ddd6c9'; c.fillRect(0, 0, 512, 512); const r = rng(9);
      for (let i = 0; i < 16000; i++) { const v = r() < .5 ? 255 : 0; c.fillStyle = `rgba(${v},${v},${v},${r() * .05})`; c.fillRect(r() * 512, r() * 512, 2, 2); } }
    const t = { woodSide: tex(ws), woodBump: tex(wb, false), woodEnd: tex(we), bark: tex(bk), ground: tex(gr), plaster: tex(pl) };
    t.bark.repeat.set(2, 2); t.ground.repeat.set(10, 10); t.plaster.repeat.set(.35, .35);
    return (S._tx = t);
  };

  // ---------------------------------------------------------------- roof coverings (1 texture repeat = 1 m × 1 m)
  const COVERS = {
    pálená: { label: 'Pálená taška', colors: [['cihlová', '#a8452b'], ['tmavě hnědá', '#4e2c22'], ['antracit', '#2f3236']], kind: 'tile', rowH: .34, colW: .24, wave: 1, rough: .62, metal: 0 },
    betonová: { label: 'Betonová taška', colors: [['antracit', '#33363a'], ['červená', '#8a3424'], ['hnědá', '#4a3326']], kind: 'tile', rowH: .34, colW: .3, wave: 1.2, rough: .55, metal: 0 },
    plech: { label: 'Plechová krytina', colors: [['grafit', '#2c3035'], ['tmavě hnědá', '#3d2c24'], ['vínová', '#5a2226']], kind: 'seam', rough: .38, metal: .55 },
    vlaknocement: { label: 'Vláknocement', colors: [['šedá', '#5c6066'], ['antracit', '#34373c'], ['cihlová', '#7d3e2c']], kind: 'diamond', rough: .7, metal: 0 },
    sindel: { label: 'Bitumenový šindel', colors: [['černá', '#2a2a2b'], ['červená', '#6b2b22'], ['zelená', '#2f4630']], kind: 'shingle', rough: .9, metal: 0 },
  };
  S.COVERS = COVERS;
  const covCache = {};
  function coverMaps(key) {
    if (covCache[key]) return covCache[key];
    const cv = COVERS[key], N = 512;
    const col = canvas(N, N), hc = canvas(N, N);
    const c = col.getContext('2d'), h = hc.getContext('2d');
    const r = rng(key.length * 17);
    h.fillStyle = '#000'; h.fillRect(0, 0, N, N);
    c.fillStyle = '#fff'; c.fillRect(0, 0, N, N);
    if (cv.kind === 'tile') {
      const rows = Math.round(1 / cv.rowH), cols = Math.round(1 / cv.colW), rh = N / rows, cw = N / cols;
      for (let y = 0; y < rows; y++) for (let x = -1; x <= cols; x++) {
        const ox = x * cw + (y % 2 ? cw * .0 : 0), oy = y * rh;
        // height: sinusoidal wave across each tile, rising towards the overlap at the top
        for (let px = 0; px < cw; px++) {
          const s = .5 + .5 * Math.cos((px / cw) * Math.PI * 2 * cv.wave);
          const g = h.createLinearGradient(0, oy, 0, oy + rh);
          const v = Math.round(60 + s * 150);
          g.addColorStop(0, `rgb(${v * .55 | 0},${v * .55 | 0},${v * .55 | 0})`); g.addColorStop(.85, `rgb(${v},${v},${v})`); g.addColorStop(1, `rgb(${v},${v},${v})`);
          h.fillStyle = g; h.fillRect(ox + px, oy, 1, rh);
        }
        // tile nose shadow line and tint variation
        const tint = .86 + r() * .22;
        c.fillStyle = `rgba(${255 * tint | 0},${255 * tint | 0},${255 * tint | 0},1)`; c.fillRect(ox, oy, cw, rh);
        c.fillStyle = 'rgba(0,0,0,.45)'; c.fillRect(ox, oy + rh - 4, cw, 4);
        c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(ox, oy, 2, rh);
        for (let px = 0; px < cw; px += 2) { const s = .5 + .5 * Math.cos((px / cw) * Math.PI * 2 * cv.wave); c.fillStyle = `rgba(0,0,0,${(1 - s) * .22})`; c.fillRect(ox + px, oy, 2, rh); }
      }
    } else if (cv.kind === 'seam') {
      const n = 2; const sw = N / n;
      for (let i = 0; i < n; i++) {
        const x = i * sw;
        const g = h.createLinearGradient(x, 0, x + 18, 0); g.addColorStop(0, '#fff'); g.addColorStop(.4, '#fff'); g.addColorStop(1, '#202020');
        h.fillStyle = '#202020'; h.fillRect(x, 0, sw, N); h.fillStyle = g; h.fillRect(x - 6, 0, 24, N);
        c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(x - 2, 0, 4, N); c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(x + 4, 0, 6, N);
      }
      for (let i = 0; i < 1500; i++) { c.fillStyle = `rgba(255,255,255,${r() * .04})`; c.fillRect(r() * N, r() * N, 1, 8); }
    } else if (cv.kind === 'diamond') {
      const s = N / 2.5;
      for (let y = -1; y < 6; y++) for (let x = -1; x < 4; x++) {
        const cx = x * s + (y % 2 ? s / 2 : 0), cy = y * s / 2;
        const tint = .82 + r() * .26;
        c.fillStyle = `rgb(${255 * tint | 0},${255 * tint | 0},${255 * tint | 0})`;
        c.beginPath(); c.moveTo(cx, cy - s / 2); c.lineTo(cx + s / 2, cy); c.lineTo(cx, cy + s / 2); c.lineTo(cx - s / 2, cy); c.closePath(); c.fill();
        c.strokeStyle = 'rgba(0,0,0,.45)'; c.lineWidth = 3; c.beginPath(); c.moveTo(cx - s / 2, cy); c.lineTo(cx, cy + s / 2); c.lineTo(cx + s / 2, cy); c.stroke();
        const g = h.createLinearGradient(0, cy - s / 2, 0, cy + s / 2); g.addColorStop(0, '#333'); g.addColorStop(1, '#ddd');
        h.fillStyle = g; h.beginPath(); h.moveTo(cx, cy - s / 2); h.lineTo(cx + s / 2, cy); h.lineTo(cx, cy + s / 2); h.lineTo(cx - s / 2, cy); h.closePath(); h.fill();
      }
    } else { // shingle tabs
      const rows = 6, rh = N / rows, tw = N / 3;
      for (let y = 0; y < rows; y++) for (let x = -1; x < 4; x++) {
        const ox = x * tw + (y % 2 ? tw / 2 : 0), oy = y * rh, tint = .75 + r() * .4;
        c.fillStyle = `rgb(${255 * tint | 0},${255 * tint | 0},${255 * tint | 0})`;
        c.beginPath(); c.moveTo(ox + 2, oy); c.lineTo(ox + tw - 2, oy); c.lineTo(ox + tw - 2, oy + rh * .75); c.lineTo(ox + tw / 2, oy + rh - 1); c.lineTo(ox + 2, oy + rh * .75); c.closePath(); c.fill();
        c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(ox, oy + rh - 4, tw, 4);
        const g = h.createLinearGradient(0, oy, 0, oy + rh); g.addColorStop(0, '#222'); g.addColorStop(1, '#bbb'); h.fillStyle = g; h.fillRect(ox, oy, tw, rh);
        for (let k = 0; k < 140; k++) { c.fillStyle = `rgba(255,255,255,${r() * .12})`; c.fillRect(ox + r() * tw, oy + r() * rh, 2, 2); }
      }
    }
    const res = { map: tex(col), normal: normalFrom(hc, cv.kind === 'seam' ? 3 : 4) };
    return (covCache[key] = res);
  }
  /** material for a covering + colour; pass clipping planes if needed */
  S.coverMaterial = function (key, color, opts = {}) {
    const cv = COVERS[key], m = coverMaps(key);
    const mat = new T.MeshStandardMaterial({ map: m.map, normalMap: m.normal, color: new T.Color(color), roughness: cv.rough, metalness: cv.metal, side: T.DoubleSide });
    mat.normalScale.set(1.1, 1.1);
    Object.assign(mat, opts);
    return mat;
  };

  // ---------------------------------------------------------------- geometry helpers
  S.timberGeo = function (L, w, h) {
    const g = new T.BoxGeometry(L, h, w), uv = g.attributes.uv;
    for (let i = 8; i < 24; i++) uv.setX(i, uv.getX(i) * L / 2.2);
    for (let i = 0; i < 8; i++) { uv.setX(i, uv.getX(i) * w * 3); uv.setY(i, uv.getY(i) * h * 3); }
    return g;
  };
  S.woodMats = function (color) {
    const t = S.textures();
    const side = new T.MeshStandardMaterial({ map: t.woodSide, bumpMap: t.woodBump, bumpScale: .012, roughness: .78, color: color || 0xffffff });
    const end = new T.MeshStandardMaterial({ map: t.woodEnd, roughness: .85, color: color || 0xffffff });
    return [end, end, side, side, side, side];
  };
  S.timber = function (L, w, h, mats, parent) {
    const m = new T.Mesh(S.timberGeo(L, w, h), mats); m.castShadow = m.receiveShadow = true; if (parent) parent.add(m); return m;
  };
  S.beamBetween = function (a, b, w, h, mats, parent, ext = 0) {
    const d = new T.Vector3().subVectors(b, a), L = d.length() + ext * 2;
    const m = S.timber(L, w, h, mats, parent);
    m.position.copy(a).add(b).multiplyScalar(.5);
    m.quaternion.setFromUnitVectors(new T.Vector3(1, 0, 0), d.normalize());
    return m;
  };
  /** planar polygon with UVs in metres (u along `uDir`, v along the in-plane perpendicular) */
  S.faceMesh = function (pts, uDir, mat) {
    const n = new T.Vector3().subVectors(pts[1], pts[0]).cross(new T.Vector3().subVectors(pts[2], pts[0])).normalize();
    const u = uDir.clone().normalize(), v = new T.Vector3().crossVectors(n, u).normalize();
    const pos = [], uv = [];
    for (let i = 1; i < pts.length - 1; i++) for (const p of [pts[0], pts[i], pts[i + 1]]) {
      pos.push(p.x, p.y, p.z); const d = new T.Vector3().subVectors(p, pts[0]); uv.push(d.dot(u), d.dot(v));
    }
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2));
    g.computeVertexNormals();
    // tangents are not needed for flat faces with r128 (derivative-based normal mapping)
    const m = new T.Mesh(g, mat); m.castShadow = m.receiveShadow = true; return m;
  };
  /** half-round pipe between two points (gutter / ridge cap) */
  S.halfPipe = function (a, b, r, mat, up = new T.Vector3(0, 1, 0), open = 'up') {
    const d = new T.Vector3().subVectors(b, a), L = d.length();
    const g = new T.CylinderGeometry(r, r, L, 18, 1, true, 0, Math.PI);
    const m = new T.Mesh(g, mat); m.castShadow = true;
    // cylinder axis = y; rotate so that axis follows d, and the open side faces `open`
    const q = new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 1, 0), d.clone().normalize());
    m.quaternion.copy(q);
    m.position.copy(a).add(b).multiplyScalar(.5);
    // half cylinder spans theta 0..PI (x from +r to -r through +z); turn so it opens upwards (gutter) or covers (cap)
    const local = new T.Vector3(0, 0, 1).applyQuaternion(q);
    const want = open === 'up' ? up.clone().negate() : up.clone();
    const ang = Math.atan2(new T.Vector3().crossVectors(local, want).dot(d.clone().normalize()), local.dot(want));
    m.rotateY(ang);
    return m;
  };
  S.pipe = function (a, b, r, mat) {
    const d = new T.Vector3().subVectors(b, a), L = d.length();
    const m = new T.Mesh(new T.CylinderGeometry(r, r, L, 14), mat); m.castShadow = true;
    m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), d.normalize()); m.position.copy(a).add(b).multiplyScalar(.5); return m;
  };
  S.materials = function () {
    if (S._m) return S._m;
    const t = S.textures();
    S._m = {
      wall: new T.MeshStandardMaterial({ map: t.plaster, roughness: .95 }),
      plinth: new T.MeshStandardMaterial({ color: 0x55504a, roughness: .9 }),
      frame: new T.MeshStandardMaterial({ color: 0x3d4248, roughness: .4, metalness: .55 }),
      glass: new T.MeshStandardMaterial({ color: 0x16202b, roughness: .06, metalness: .7, emissive: 0x2a1a08, emissiveIntensity: .25 }),
      metal: new T.MeshStandardMaterial({ color: 0x3a3e43, roughness: .35, metalness: .8, side: T.DoubleSide }),
      copper: new T.MeshStandardMaterial({ color: 0xa8643a, roughness: .35, metalness: .85, side: T.DoubleSide }),
      sill: new T.MeshStandardMaterial({ color: 0x8c9196, roughness: .4, metalness: .5 }),
      door: new T.MeshStandardMaterial({ map: t.woodSide, color: 0x6e4224, roughness: .6 }),
      brick: new T.MeshStandardMaterial({ color: 0x7e4632, roughness: .9 }),
      fascia: new T.MeshStandardMaterial({ map: t.woodSide, color: 0x8a5a33, roughness: .7 }),
      ground: new T.MeshStandardMaterial({ map: t.ground, roughness: 1, color: 0x8a8a78 }),
    };
    return S._m;
  };

  /** roof window (Velux-like) lying on a slope; returns a group to be placed at `pos` with slope normal `n` and up-slope dir `up` */
  S.roofWindow = function (w = .78, l = 1.18) {
    const M = S.materials(), g = new T.Group();
    const fr = new T.Mesh(new T.BoxGeometry(w + .12, .09, l + .12), M.frame); fr.castShadow = true; g.add(fr);
    const gl = new T.Mesh(new T.BoxGeometry(w, .095, l), M.glass); g.add(gl);
    const fl = new T.Mesh(new T.BoxGeometry(w + .26, .03, l + .3), M.metal); fl.position.y = -.03; g.add(fl);
    return g;
  };
  /** orient object so its local +y = n (slope normal), local +z = up-slope direction */
  S.orientOnSlope = function (obj, n, upDir) {
    const y = n.clone().normalize(), z = upDir.clone().normalize(), x = new T.Vector3().crossVectors(y, z).normalize();
    const m = new T.Matrix4().makeBasis(x, y, z); obj.quaternion.setFromRotationMatrix(m);
  };

  /** simple low-poly spruce */
  S.spruce = function (h, seed) {
    const r = rng(seed), g = new T.Group();
    const trunk = new T.Mesh(new T.CylinderGeometry(.08 * h / 6, .14 * h / 6, h * .3, 7), new T.MeshStandardMaterial({ color: 0x3a2a1e, roughness: 1 }));
    trunk.position.y = h * .15; g.add(trunk);
    const mat = new T.MeshStandardMaterial({ color: new T.Color().setHSL(.33 + r() * .04, .35, .13 + r() * .05), roughness: 1, flatShading: true });
    for (let i = 0; i < 5; i++) {
      const t = i / 5, cone = new T.Mesh(new T.ConeGeometry(h * (.26 - t * .18), h * .34, 8), mat);
      cone.position.y = h * (.28 + t * .16) + h * .08; cone.rotation.y = r() * 3; cone.castShadow = true; g.add(cone);
    }
    return g;
  };
  /** instanced grass tufts on a ring */
  S.grass = function (rMin, rMax, n, seed, exclude) {
    const r = rng(seed);
    const blade = new T.ConeGeometry(.025, .28, 3); blade.translate(0, .14, 0);
    const mat = new T.MeshStandardMaterial({ color: 0x55613a, roughness: 1 });
    const im = new T.InstancedMesh(blade, mat, n); const d = new T.Object3D(), c = new T.Color();
    let k = 0;
    for (let i = 0; i < n * 3 && k < n; i++) {
      const a = r() * Math.PI * 2, rr = rMin + Math.sqrt(r()) * (rMax - rMin), x = Math.cos(a) * rr, z = Math.sin(a) * rr;
      if (exclude && exclude(x, z)) continue;
      d.position.set(x, 0, z); d.rotation.set((r() - .5) * .5, r() * 6, (r() - .5) * .5); d.scale.setScalar(.6 + r() * 1.1); d.updateMatrix();
      im.setMatrixAt(k, d.matrix); c.setHSL(.2 + r() * .08, .3 + r() * .2, .18 + r() * .14); im.setColorAt(k, c); k++;
    }
    im.count = k; im.receiveShadow = true; return im;
  };

  /** house body: walls with windows on long sides, door on the front gable (−z) */
  S.houseBody = function (L, W, wallH, opts = {}) {
    const M = S.materials(), g = new T.Group(), WT = .4;
    const body = new T.Mesh(new T.BoxGeometry(W, wallH, L), M.wall); body.position.y = wallH / 2; body.castShadow = body.receiveShadow = true; g.add(body);
    const pl = new T.Mesh(new T.BoxGeometry(W + .08, .5, L + .08), M.plinth); pl.position.y = .25; pl.receiveShadow = true; g.add(pl);
    const nWin = Math.max(2, Math.round(L / 3.2));
    for (let i = 0; i < nWin; i++) for (const s of [-1, 1]) {
      const z = -L / 2 + (i + .5) * L / nWin;
      const fr = new T.Mesh(new T.BoxGeometry(.05, 1.4, 1.2), M.frame); fr.position.set(s * (W / 2 + .005), 1.65, z); g.add(fr);
      const gl = new T.Mesh(new T.BoxGeometry(.06, 1.26, 1.06), M.glass); gl.position.set(s * (W / 2 + .008), 1.65, z); g.add(gl);
      const mul = new T.Mesh(new T.BoxGeometry(.065, 1.26, .05), M.frame); mul.position.set(s * (W / 2 + .01), 1.65, z); g.add(mul);
      const si = new T.Mesh(new T.BoxGeometry(.18, .04, 1.3), M.sill); si.position.set(s * (W / 2 + .07), .93, z); g.add(si);
    }
    const door = new T.Mesh(new T.BoxGeometry(1.0, 2.1, .06), M.door); door.position.set(opts.doorX || 0, 1.3, -L / 2 - .02); g.add(door);
    const step = new T.Mesh(new T.BoxGeometry(1.6, .2, .6), M.plinth); step.position.set(opts.doorX || 0, .1, -L / 2 - .3); g.add(step);
    for (const s of [-1, 1]) { const gw = new T.Mesh(new T.BoxGeometry(.8, 1.0, .05), M.frame); gw.position.set(s * W * .27, 1.65, -L / 2 - .005); g.add(gw); const gg = new T.Mesh(new T.BoxGeometry(.68, .88, .06), M.glass); gg.position.set(s * W * .27, 1.65, -L / 2 - .01); g.add(gg); }
    return g;
  };

  window.STAVBA = S;
})();
