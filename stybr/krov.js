/* Tesařství Štýbr – „Od kmene ke střeše“
   Procedurální 3D scéna (Three.js r128) řízená scrollem: kmen → hranění → šňůra → čep a dlab → krov → laťování → krytina.
   window.KROV.setProgress(p) – p 0..1 ; window.KROV.labels – body pro HTML popisky */
(function () {
  'use strict';
  const canvas = document.getElementById('krov3d');
  if (!canvas || !window.THREE) return;
  const T = THREE;
  const isMobile = matchMedia('(max-width: 820px)').matches;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------------------------------------------------------------- helpers
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const seg = (p, a, b) => clamp((p - a) / (b - a), 0, 1);
  const eio = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const eout = t => 1 - Math.pow(1 - t, 3);
  const back = t => { const c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
  function rng(seed) { let a = seed | 0; return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  // ---------------------------------------------------------------- renderer
  const renderer = new T.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
  renderer.outputEncoding = T.sRGBEncoding;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  const scene = new T.Scene();
  scene.fog = new T.Fog(0x14110e, 16, 46);
  const camera = new T.PerspectiveCamera(36, 1, .05, 120);

  // ---------------------------------------------------------------- canvas textures
  function canvasTex(w, h, draw, srgb = true) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    const t = new T.CanvasTexture(c);
    t.wrapS = t.wrapT = T.RepeatWrapping;
    t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    if (srgb) t.encoding = T.sRGBEncoding;
    return t;
  }
  // spruce side grain (u along the length)
  function grain(ctx, w, h, seed, mono) {
    const r = rng(seed);
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, mono ? '#9a9a9a' : '#e1bb84'); g.addColorStop(.5, mono ? '#b0b0b0' : '#ebc995'); g.addColorStop(1, mono ? '#959595' : '#d9b078');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    // broad colour bands (early/late wood)
    for (let i = 0; i < 9; i++) {
      const y0 = r() * h, hh = 10 + r() * 40;
      const gb = ctx.createLinearGradient(0, y0 - hh, 0, y0 + hh);
      gb.addColorStop(0, 'rgba(0,0,0,0)'); gb.addColorStop(.5, mono ? `rgba(0,0,0,${.1 + r() * .12})` : `rgba(${150 + r() * 30},${90 + r() * 20},${40},${.1 + r() * .14})`); gb.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gb; ctx.fillRect(0, y0 - hh, w, hh * 2);
    }
    // annual rings as long wavy lines
    for (let i = 0; i < 26; i++) {
      const y0 = r() * h, amp = 3 + r() * 14, fr = .0015 + r() * .004, ph = r() * 9, wd = .5 + r() * 1.6;
      ctx.strokeStyle = mono ? `rgba(40,40,40,${.08 + r() * .18})` : `rgba(${130 + r() * 30},${78 + r() * 20},${30 + r() * 12},${.08 + r() * .17})`;
      ctx.lineWidth = wd; ctx.beginPath();
      for (let x = 0; x <= w; x += 8) { const y = y0 + Math.sin(x * fr + ph) * amp + Math.sin(x * fr * 3.1 + ph * 2) * amp * .3; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();
    }
    // knots (suky)
    for (let k = 0; k < 3; k++) {
      const kx = r() * w, ky = r() * h, kr = 6 + r() * 12;
      for (let j = 6; j > 0; j--) {
        ctx.fillStyle = mono ? `rgba(30,30,30,${.10 + j * .03})` : `rgba(${110 - j * 8},${60 - j * 4},${25},${.10 + j * .05})`;
        ctx.beginPath(); ctx.ellipse(kx, ky, kr * j * .45, kr * j * .22, 0, 0, 7); ctx.fill();
      }
      ctx.fillStyle = mono ? 'rgba(10,10,10,.6)' : 'rgba(70,35,12,.75)'; ctx.beginPath(); ctx.ellipse(kx, ky, kr * .5, kr * .32, 0, 0, 7); ctx.fill();
    }
    // fine fibres
    for (let i = 0; i < 1600; i++) {
      ctx.fillStyle = mono ? `rgba(0,0,0,${r() * .06})` : `rgba(90,50,20,${r() * .04})`;
      ctx.fillRect(r() * w, r() * h, 6 + r() * 30, 1);
    }
  }
  const woodSide = canvasTex(1024, 256, (c, w, h) => grain(c, w, h, 7, false));
  const woodSideB = canvasTex(1024, 256, (c, w, h) => grain(c, w, h, 7, true), false);
  const woodEnd = canvasTex(256, 256, (c, w, h) => {
    c.fillStyle = '#e4c08c'; c.fillRect(0, 0, w, h);
    const r = rng(3), cx = w * .38, cy = h * .62;
    for (let i = 40; i > 0; i--) {
      c.strokeStyle = `rgba(${130 + r() * 30},${75 + r() * 20},30,${.25 + r() * .3})`; c.lineWidth = 1 + r() * 2.5;
      c.beginPath(); c.arc(cx + r() * 3, cy + r() * 3, i * 9 + r() * 4, 0, 7); c.stroke();
    }
    for (let i = 0; i < 18; i++) { c.strokeStyle = 'rgba(80,40,10,.25)'; c.beginPath(); c.moveTo(cx, cy); const a = r() * 7; c.lineTo(cx + Math.cos(a) * 400, cy + Math.sin(a) * 400); c.stroke(); }
    c.fillStyle = 'rgba(255,255,255,.06)'; for (let i = 0; i < 900; i++) c.fillRect(r() * w, r() * h, 2, 2);
  });
  const bark = canvasTex(512, 1024, (c, w, h) => {
    // spruce bark: grey-brown scaly plates separated by dark fissures running along the trunk
    c.fillStyle = '#2a211b'; c.fillRect(0, 0, w, h); const r = rng(11);
    for (let i = 0; i < 1400; i++) {
      const x = r() * w, y = r() * h, pw = 10 + r() * 26, ph = 18 + r() * 60;
      const l = 28 + r() * 22, sat = 8 + r() * 10;
      c.fillStyle = `hsl(${22 + r() * 12},${sat}%,${l}%)`;
      c.beginPath(); c.ellipse(x, y, pw / 2, ph / 2, (r() - .5) * .3, 0, 7); c.fill();
      c.fillStyle = `rgba(255,240,220,${r() * .08})`; c.beginPath(); c.ellipse(x - pw * .12, y - ph * .15, pw * .3, ph * .3, 0, 0, 7); c.fill();
      if (x < 40) { c.beginPath(); c.ellipse(x + w, y, pw / 2, ph / 2, 0, 0, 7); c.fill(); }
    }
    for (let i = 0; i < 140; i++) {
      c.strokeStyle = `rgba(12,8,6,${.5 + r() * .4})`; c.lineWidth = 1.5 + r() * 3;
      let x = r() * w, y = r() * h; c.beginPath(); c.moveTo(x, y);
      for (let k = 0; k < 6; k++) { x += (r() - .5) * 8; y += 15 + r() * 30; c.lineTo(x, y); }
      c.stroke();
    }
    // a little moss/lichen
    for (let i = 0; i < 260; i++) { c.fillStyle = `rgba(${110 + r() * 40},${120 + r() * 30},${70 + r() * 20},${r() * .25})`; c.fillRect(r() * w, r() * h, 2 + r() * 5, 2 + r() * 5); }
  });
  bark.repeat.set(2, 2);
  const ground = canvasTex(512, 512, (c, w, h) => {
    c.fillStyle = '#2b2a1f'; c.fillRect(0, 0, w, h); const r = rng(5);
    for (let i = 0; i < 9000; i++) { const v = r(); c.fillStyle = v < .5 ? `rgba(70,80,40,${r() * .5})` : v < .8 ? `rgba(110,90,60,${r() * .35})` : `rgba(20,18,12,${r() * .5})`; c.fillRect(r() * w, r() * h, 2 + r() * 3, 1 + r() * 3); }
  });
  ground.repeat.set(10, 10);
  const plaster = canvasTex(512, 512, (c, w, h) => {
    c.fillStyle = '#d9d2c5'; c.fillRect(0, 0, w, h); const r = rng(9);
    for (let i = 0; i < 14000; i++) { c.fillStyle = `rgba(${r() < .5 ? 255 : 0},${r() < .5 ? 250 : 0},${r() < .5 ? 240 : 0},${r() * .05})`; c.fillRect(r() * w, r() * h, 2, 2); }
  });
  plaster.repeat.set(3, 1.2);
  const tileTex = canvasTex(256, 256, (c, w, h) => {
    const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#3a3e44'); g.addColorStop(1, '#25282c');
    c.fillStyle = g; c.fillRect(0, 0, w, h); const r = rng(13);
    for (let i = 0; i < 3000; i++) { c.fillStyle = `rgba(255,255,255,${r() * .04})`; c.fillRect(r() * w, r() * h, 2, 2); }
    c.fillStyle = 'rgba(0,0,0,.45)'; c.fillRect(0, h - 10, w, 10);
  });

  // ---------------------------------------------------------------- materials
  const M = {
    side: new T.MeshStandardMaterial({ map: woodSide, bumpMap: woodSideB, bumpScale: .012, roughness: .78, metalness: 0 }),
    end: new T.MeshStandardMaterial({ map: woodEnd, roughness: .85 }),
    bark: new T.MeshStandardMaterial({ map: bark, bumpMap: bark, bumpScale: .03, roughness: .95 }),
    ground: new T.MeshStandardMaterial({ map: ground, roughness: 1, color: 0x8a8a78 }),
    wall: new T.MeshStandardMaterial({ map: plaster, roughness: .95 }),
    plinth: new T.MeshStandardMaterial({ color: 0x5c5650, roughness: .9 }),
    tile: new T.MeshStandardMaterial({ map: tileTex, roughness: .48, metalness: .15 }),
    glass: new T.MeshStandardMaterial({ color: 0x1b2633, roughness: .08, metalness: .6, emissive: 0x2a1a08, emissiveIntensity: .35 }),
    frame: new T.MeshStandardMaterial({ color: 0x40464d, roughness: .4, metalness: .6 }),
    chalk: new T.MeshBasicMaterial({ color: 0x4f8fe0, transparent: true, opacity: .9 }),
    chalkDust: new T.MeshBasicMaterial({ color: 0x5b9be8, transparent: true, opacity: 0, depthWrite: false }),
    pencil: new T.MeshBasicMaterial({ color: 0xd23b2a, transparent: true, opacity: 0, depthWrite: false }),
    steel: new T.MeshStandardMaterial({ color: 0x8b8f94, roughness: .35, metalness: .9 }),
    brick: new T.MeshStandardMaterial({ color: 0x8a4a33, roughness: .9 }),
  };
  const woodMats = [M.end, M.end, M.side, M.side, M.side, M.side];

  /** timber along X: length L, width (z) w, height (y) h; side-face UVs scaled so grain repeats per ~2 m */
  function timberGeo(L, w, h) {
    const g = new T.BoxGeometry(L, h, w);
    const uv = g.attributes.uv;
    // faces 2..5 (+y,-y,+z,-z) each have 4 verts: indices 8..23
    for (let i = 8; i < 24; i++) uv.setX(i, uv.getX(i) * L / 2.2);
    // ends: square-ish
    for (let i = 0; i < 8; i++) { uv.setX(i, uv.getX(i) * w * 3); uv.setY(i, uv.getY(i) * h * 3); }
    return g;
  }
  function timber(L, w, h, parent) {
    const m = new T.Mesh(timberGeo(L, w, h), woodMats);
    m.castShadow = true; m.receiveShadow = true;
    if (parent) parent.add(m);
    return m;
  }
  /** timber between two points (local), section w×h, 'up' hint for orientation of h */
  function beamBetween(a, b, w, h, parent, ext = 0) {
    const dir = new T.Vector3().subVectors(b, a); const L = dir.length() + ext * 2;
    const m = timber(L, w, h, parent);
    m.position.copy(a).add(b).multiplyScalar(.5);
    const q = new T.Quaternion().setFromUnitVectors(new T.Vector3(1, 0, 0), dir.normalize());
    m.quaternion.copy(q);
    return m;
  }

  // ---------------------------------------------------------------- lights & environment
  const hemi = new T.HemisphereLight(0xbcd2ff, 0x3b2a1a, .55); scene.add(hemi);
  const sun = new T.DirectionalLight(0xffd2a1, 2.2);
  sun.position.set(-9, 12, 8); sun.castShadow = true;
  sun.shadow.mapSize.set(isMobile ? 1024 : 2048, isMobile ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12, near: 1, far: 50 });
  sun.shadow.bias = -.0004; sun.shadow.normalBias = .02;
  scene.add(sun); scene.add(sun.target);
  const rim = new T.DirectionalLight(0x7fa6ff, .55); rim.position.set(8, 6, -10); scene.add(rim);
  const work = new T.PointLight(0xffb36b, 0, 8, 2); work.position.set(1.2, 2.2, 11.4); scene.add(work);

  // sky dome (gradient)
  const skyGeo = new T.SphereGeometry(80, 32, 16);
  const skyMat = new T.ShaderMaterial({
    side: T.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new T.Color(0x0e1320) }, mid: { value: new T.Color(0x3a2a2a) }, bot: { value: new T.Color(0xd77a3c) }, glow: { value: 0 } },
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader: 'uniform vec3 top; uniform vec3 mid; uniform vec3 bot; uniform float glow; varying vec3 vP; void main(){ float h = vP.y; vec3 c = mix(bot, mid, smoothstep(-0.02, 0.18, h)); c = mix(c, top, smoothstep(0.15, 0.7, h)); c = mix(vec3(0.075,0.062,0.05), c, glow); gl_FragColor = vec4(c,1.0);}'
  });
  scene.add(new T.Mesh(skyGeo, skyMat));

  const groundMesh = new T.Mesh(new T.CircleGeometry(40, 64), M.ground);
  groundMesh.rotation.x = -Math.PI / 2; groundMesh.receiveShadow = true; scene.add(groundMesh);

  // ================================================================ PART 1: workbench (log → beam → chalk line → joint)
  const BZ = 9.4;
  const bench = new T.Group(); bench.position.set(0, 0, BZ); scene.add(bench);
  // sawhorses (kozy)
  function sawhorse(x) {
    const g = new T.Group(); g.position.set(x, 0, 0);
    timber(1.0, .1, .08, g).position.set(0, .78, 0);
    [[-.32, 1], [.32, 1], [-.32, -1], [.32, -1]].forEach(([dx, s]) => {
      const leg = beamBetween(new T.Vector3(dx, 0, s * .28), new T.Vector3(dx * .6, .74, 0), .06, .06, g);
      leg.rotation.z += 0;
    });
    // rotate 90° so the top bar is across the log
    g.rotation.y = Math.PI / 2;
    bench.add(g); return g;
  }
  sawhorse(-1.35); sawhorse(1.35);
  const LOGL = 4.2, LOGY = .98;
  const logGroup = new T.Group(); logGroup.position.set(0, LOGY, 0); bench.add(logGroup);
  // inner squared beam
  const beam = timber(LOGL, .2, .22, logGroup);
  // bark shell: 4 quarter slabs (cylinder segments) around the beam
  const shells = [];
  for (let i = 0; i < 4; i++) {
    const g = new T.CylinderGeometry(.19, .2, LOGL, 18, 1, false, i * Math.PI / 2 + Math.PI / 4, Math.PI / 2);
    g.rotateZ(Math.PI / 2);
    const m = new T.Mesh(g, [M.bark, M.end, M.end]); m.castShadow = true;
    // outer thickness: second, slightly smaller, open cylinder for the inside wood
    const inner = new T.Mesh(new T.CylinderGeometry(.165, .175, LOGL, 18, 1, true, i * Math.PI / 2 + Math.PI / 4, Math.PI / 2).rotateZ(Math.PI / 2), new T.MeshStandardMaterial({ map: woodSide, side: T.BackSide, roughness: .8 }));
    m.add(inner);
    const a = i * Math.PI / 2 + Math.PI / 2;
    m.userData.dir = new T.Vector3(0, Math.sin(a), Math.cos(a));
    logGroup.add(m); shells.push(m);
  }
  // end caps of the round log (rings), fade when the shell flies off
  const capMat = new T.MeshStandardMaterial({ map: woodEnd, roughness: .85, transparent: true });
  const caps = [-1, 1].map(s => { const c = new T.Mesh(new T.CircleGeometry(.2, 32), capMat); c.position.x = s * (LOGL / 2 + .002); c.rotation.y = s * Math.PI / 2; logGroup.add(c); return c; });

  // chalk line (provázek) along top face
  const chalkLine = new T.Mesh(new T.CylinderGeometry(.0035, .0035, 1, 6).rotateZ(Math.PI / 2), M.chalk);
  logGroup.add(chalkLine);
  const chalkMark = new T.Mesh(new T.PlaneGeometry(LOGL - .1, .012), M.chalkDust);
  chalkMark.rotation.x = -Math.PI / 2; chalkMark.position.set(0, .111, .03); logGroup.add(chalkMark);
  // red pencil marks: dimension ticks and an "X"
  const pencil = new T.Group(); logGroup.add(pencil);
  [[-1.2], [1.2]].forEach(([x]) => { const t = new T.Mesh(new T.PlaneGeometry(.008, .18), M.pencil); t.rotation.x = -Math.PI / 2; t.position.set(x, .112, 0); pencil.add(t); });
  [-1, 1].forEach(s => { const t = new T.Mesh(new T.PlaneGeometry(.008, .16), M.pencil); t.rotation.set(-Math.PI / 2, 0, s * .7); t.position.set(.6, .112, -.02); pencil.add(t); });

  // joint (čep a dlab): horizontal beam with a mortise + post with tenon + peg
  const joint = new T.Group(); joint.position.set(0, 1.25, 0); joint.visible = false; bench.add(joint);
  const JW = .16, JH = .18, ML = .08, MW = .06; // mortise length (x) and width (z)
  const jBeam = new T.Group(); joint.add(jBeam);
  // beam split around the mortise hole (through, vertical)
  const halfL = .7 - ML / 2;
  timber(halfL, JW, JH, jBeam).position.x = -(ML / 2 + halfL / 2);
  timber(halfL, JW, JH, jBeam).position.x = ML / 2 + halfL / 2;
  const cheek = (JW - MW) / 2;
  [-1, 1].forEach(s => { const c = timber(ML, cheek, JH, jBeam); c.position.z = s * (MW / 2 + cheek / 2); });
  // post with tenon (rotate a timber to vertical)
  const jPost = new T.Group(); joint.add(jPost);
  const post = timber(1.0, JW, JW, jPost); post.rotation.z = Math.PI / 2; post.position.y = -JH / 2 - .5;
  const tenon = timber(JH, MW, ML, jPost); tenon.rotation.z = Math.PI / 2; tenon.position.y = 0;
  // peg (kolík) – through the beam side
  const peg = new T.Mesh(new T.CylinderGeometry(.012, .012, JW + .06, 12).rotateX(Math.PI / 2), M.side); peg.castShadow = true; joint.add(peg);
  // drill hole marks
  const hole = new T.Mesh(new T.CircleGeometry(.013, 16), new T.MeshBasicMaterial({ color: 0x2a170b })); hole.position.set(0, 0, JW / 2 + .001); joint.add(hole);

  // ================================================================ PART 2: house + truss
  const house = new T.Group(); scene.add(house);
  const HX = 8.4, HZ = 10.2, WALL = 2.9, WT = .38;     // footprint (outer), wall height, wall thickness
  const PITCH = 40 * Math.PI / 180;
  const SPAN = HX - WT;                                 // between wall-plate centres
  const RISE = SPAN / 2 * Math.tan(PITCH);
  const TOP = WALL + .14;                               // top of the wall plate
  const N_PAIRS = 12;
  const zs = []; for (let i = 0; i < N_PAIRS; i++) zs.push(-HZ / 2 + .35 + i * (HZ - .7) / (N_PAIRS - 1));

  // walls (rise from the ground)
  const walls = new T.Group(); house.add(walls);
  const wallParts = [
    [HX, WALL, WT, 0, WALL / 2, HZ / 2 - WT / 2], [HX, WALL, WT, 0, WALL / 2, -HZ / 2 + WT / 2],
    [WT, WALL, HZ - 2 * WT, HX / 2 - WT / 2, WALL / 2, 0], [WT, WALL, HZ - 2 * WT, -HX / 2 + WT / 2, WALL / 2, 0],
  ];
  wallParts.forEach(([w, h, d, x, y, z]) => { const m = new T.Mesh(new T.BoxGeometry(w, h, d), M.wall); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; walls.add(m); });
  const plinth = new T.Mesh(new T.BoxGeometry(HX + .1, .45, HZ + .1), M.plinth); plinth.position.y = .225; plinth.receiveShadow = true; walls.add(plinth);
  // windows on the long walls (dark openings with frames)
  for (let i = 0; i < 3; i++) for (const s of [-1, 1]) {
    const wx = s * (HX / 2 + .005), wz = -3 + i * 3;
    const fr = new T.Mesh(new T.BoxGeometry(.06, 1.35, 1.15), M.frame); fr.position.set(wx, 1.6, wz); walls.add(fr);
    const gl = new T.Mesh(new T.BoxGeometry(.065, 1.2, 1.0), M.glass); gl.position.set(wx, 1.6, wz); walls.add(gl);
  }
  // door on the front gable
  const door = new T.Mesh(new T.BoxGeometry(1.0, 2.1, .06), new T.MeshStandardMaterial({ map: woodSide, color: 0x7a4a26, roughness: .7 }));
  door.position.set(0, 1.05 + .2, -HZ / 2 - .01); walls.add(door);

  const truss = new T.Group(); truss.position.y = 0; house.add(truss);
  const parts = { joists: [], plates: [], posts: [], purlins: [], rafters: [], collars: [], battens: [], ridge: [] };

  // ceiling joists (stropní trámy) across X on top of walls
  zs.forEach(z => parts.joists.push(timber(HX + .3, .12, .2, truss)));
  parts.joists.forEach((m, i) => m.position.set(0, WALL + .1 - .14, zs[i]));
  // wall plates (pozednice) along Z
  [-1, 1].forEach(s => { const m = timber(HZ + .2, .14, .14, truss); m.rotation.y = Math.PI / 2; m.position.set(s * SPAN / 2, TOP - .07, 0); parts.plates.push(m); });
  // posts (sloupky) + purlins (vaznice) – two rows at 1/2 of the half-span
  const PX = SPAN / 4, PH = RISE / 2 - .1;
  [-1, 1].forEach(s => {
    [-3.4, 0, 3.4].forEach(z => { const m = timber(PH, .14, .14, truss); m.rotation.z = Math.PI / 2; m.position.set(s * PX, TOP + PH / 2 - .02, z); parts.posts.push(m); });
    const pu = timber(HZ + .2, .14, .16, truss); pu.rotation.y = Math.PI / 2; pu.position.set(s * PX, TOP + PH + .06, 0); parts.purlins.push(pu);
  });
  // rafters (krokve): pairs from eave overhang to ridge
  const OVER = .55, RAFT_W = .08, RAFT_H = .16;
  const rafterPairs = [];
  zs.forEach((z, i) => {
    const pair = new T.Group(); pair.position.z = z; truss.add(pair);
    [-1, 1].forEach(s => {
      const a = new T.Vector3(s * (SPAN / 2 + OVER), TOP - OVER * Math.tan(PITCH) + RAFT_H * .45, 0);
      const b = new T.Vector3(0, TOP + RISE + RAFT_H * .45, 0);
      const r = beamBetween(a, b, RAFT_W, RAFT_H, pair);
      // keep h vertical-ish: rotate around length so the section stands upright
      r.userData.side = s;
    });
    // collar tie (kleština) pair at purlin height
    const cy = TOP + PH + .2;
    const cw = (SPAN / 2 - (cy - TOP) / Math.tan(PITCH)) * 2 + .3;
    [-1, 1].forEach(sz => { const c = timber(cw, .05, .16, pair); c.position.set(0, cy, sz * .07); parts.collars.push(c); c.userData.pair = i; });
    pair.userData.i = i;
    rafterPairs.push(pair);
  });
  // ridge board
  const slopeLen = (SPAN / 2 + OVER) / Math.cos(PITCH);
  // battens (laťování) along Z on both slopes
  const battenGroup = new T.Group(); truss.add(battenGroup);
  const NB = Math.floor(slopeLen / .34);
  const batRows = [];
  for (let k = 0; k < NB; k++) {
    const row = new T.Group(); battenGroup.add(row);
    [-1, 1].forEach(s => {
      const d = .15 + k * .34; // distance along slope from the eave
      const x = s * (SPAN / 2 + OVER - d * Math.cos(PITCH));
      const y = TOP - OVER * Math.tan(PITCH) + RAFT_H * .95 + d * Math.sin(PITCH) + .02;
      const m = timber(HZ + .5, .05, .03, row); m.rotation.y = Math.PI / 2; m.position.set(x, y, 0);
    });
    batRows.push(row);
  }

  // roof covering: instanced tiles (concrete roof tile look), rows from eave to ridge
  const TILE_W = .3, TILE_L = .42, COURSES = Math.floor((slopeLen - .05) / .34), PER_ROW = Math.ceil((HZ + .6) / TILE_W);
  const tileGeo = new T.BoxGeometry(TILE_L, .04, TILE_W * .97);
  const tiles = new T.InstancedMesh(tileGeo, M.tile, COURSES * PER_ROW * 2);
  tiles.castShadow = true; tiles.receiveShadow = true; house.add(tiles);
  const tileData = []; // {row, base matrix parts}
  const win = [{ s: -1, z0: -2.6, z1: -1.4, k0: 5, k1: 8 }, { s: -1, z0: 1.6, z1: 2.8, k0: 5, k1: 8 }];
  let ti = 0; const dummy = new T.Object3D(); const tcol = new T.Color();
  const tr = rng(21);
  for (let k = 0; k < COURSES; k++) for (const s of [-1, 1]) for (let j = 0; j < PER_ROW; j++) {
    const z = -HZ / 2 - .3 + TILE_W / 2 + j * TILE_W + (k % 2 ? TILE_W / 2 : 0);
    const inWin = win.some(w => w.s === s && k >= w.k0 && k <= w.k1 && z > w.z0 && z < w.z1);
    const d = .2 + k * .34;
    const x = s * (SPAN / 2 + OVER + .02 - d * Math.cos(PITCH));
    const y = TOP - OVER * Math.tan(PITCH) + RAFT_H * .95 + .08 + d * Math.sin(PITCH);
    tileData.push({ k, s, x, y, z, hide: inWin });
    tcol.setHSL(.58, .06, .15 + tr() * .1);
    tiles.setColorAt(ti, tcol); ti++;
  }
  tiles.count = ti;
  // roof windows (Velux-type) on the front slope (s = -1)
  const roofWins = [];
  win.forEach(w => {
    const g = new T.Group();
    const dmid = .2 + (w.k0 + w.k1) / 2 * .34;
    g.position.set(-(SPAN / 2 + OVER + .02 - dmid * Math.cos(PITCH)), TOP - OVER * Math.tan(PITCH) + RAFT_H * .95 + .1 + dmid * Math.sin(PITCH), (w.z0 + w.z1) / 2);
    g.rotation.z = PITCH; // tilt with the slope (slope s=-1 rises towards +x)
    const fr = new T.Mesh(new T.BoxGeometry(1.25, .1, 1.05), M.frame); fr.castShadow = true; g.add(fr);
    const gl = new T.Mesh(new T.BoxGeometry(1.08, .11, .88), M.glass); g.add(gl);
    g.scale.setScalar(.001); house.add(g); roofWins.push(g);
  });
  // gable cladding (dřevěný štít) – vertical boards in the triangle, front and back
  const gables = [];
  [-1, 1].forEach(sz => {
    const g = new T.Group(); g.position.z = sz * (HZ / 2 - .02); house.add(g);
    const n = 26, bw = SPAN / n;
    for (let i = 0; i < n; i++) {
      const x = -SPAN / 2 + bw / 2 + i * bw;
      const h = Math.max(.05, (SPAN / 2 - Math.abs(x)) * Math.tan(PITCH) - .05);
      const b = timber(h, .025, bw * .96, g); b.rotation.z = Math.PI / 2; b.position.set(x, TOP + h / 2, 0);
      b.material = [M.end, M.end, M.side, M.side, M.side, M.side];
      b.userData.h = h;
    }
    g.scale.y = .001; gables.push(g);
  });
  // chimney
  const chimney = new T.Mesh(new T.BoxGeometry(.6, 1.6, .6), M.brick); chimney.position.set(1.4, TOP + RISE - .1, 2.2); chimney.castShadow = true; house.add(chimney);

  // carpenter's marks (tesařské značky) – sprites over each rafter pair
  const ROMAN = ['I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  const marks = ROMAN.map((txt, i) => {
    const t = canvasTex(256, 128, (c, w, h) => {
      c.font = '700 84px "Caveat", "Segoe Script", cursive'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillStyle = '#d23b2a'; c.fillText(txt, w / 2, h / 2 + 4);
    });
    const sp = new T.Sprite(new T.SpriteMaterial({ map: t, transparent: true, opacity: 0, depthTest: false }));
    sp.scale.set(.9, .45, 1); sp.position.set(0, TOP + RISE + .65, zs[i]); house.add(sp);
    return sp;
  });

  // sawdust particles around the bench
  const DUST = isMobile ? 160 : 320;
  const dustGeo = new T.BufferGeometry(); const dpos = new Float32Array(DUST * 3); const dseed = new Float32Array(DUST);
  const dr = rng(4); for (let i = 0; i < DUST; i++) { dpos[i * 3] = (dr() - .5) * 5; dpos[i * 3 + 1] = dr() * 2.6; dpos[i * 3 + 2] = BZ + (dr() - .5) * 2; dseed[i] = dr(); }
  dustGeo.setAttribute('position', new T.BufferAttribute(dpos, 3));
  const dust = new T.Points(dustGeo, new T.PointsMaterial({ color: 0xffd9a0, size: .022, transparent: true, opacity: .55, depthWrite: false }));
  scene.add(dust);

  // ---------------------------------------------------------------- camera path
  const K = [ // p, camera position, target, fov
    [0.00, [3.9, 1.32, BZ + 1.75], [1.3, 1.02, BZ], 36],
    [0.10, [2.6, 1.7, BZ + 2.3], [0.4, 1.0, BZ], 36],
    [0.22, [-.4, 1.95, BZ + 1.4], [-.2, 1.0, BZ], 34],
    [0.30, [1.2, 1.85, BZ + 1.55], [0, 1.2, BZ], 32],
    [0.40, [1.05, 1.55, BZ + 1.3], [0, 1.15, BZ], 32],
    [0.47, [7.5, 5.0, 18], [0, 2.4, 2.5], 40],
    [0.58, [13.8, 8.8, 12.6], [0, 3.2, 0], 38],
    [0.70, [-12, 8.5, 10], [0, 3.6, 0], 36],
    [0.86, [-14, 6.6, -10.5], [0, 3.4, 0], 36],
    [1.00, [-13.2, 3.6, -17], [0, 3.2, 0], 34],
  ];
  const tmpA = new T.Vector3(), tmpB = new T.Vector3(), tgt = new T.Vector3();
  function camAt(p) {
    let i = 0; while (i < K.length - 2 && p > K[i + 1][0]) i++;
    const a = K[i], b = K[i + 1]; const t = eio(seg(p, a[0], b[0]));
    tmpA.fromArray(a[1]).lerp(tmpB.fromArray(b[1]), t); camera.position.copy(tmpA);
    tgt.fromArray(a[2]).lerp(tmpB.fromArray(b[2]), t);
    camera.fov = lerp(a[3], b[3], t);
    if (W / H > 1.2) { const off = lerp(.12, .2, seg(p, .44, .6)); camera.setViewOffset(W, H, -W * off, 0, W, H); }
    camera.updateProjectionMatrix();
    camera.lookAt(tgt);
  }

  // ---------------------------------------------------------------- label anchors (projected to HTML by page.js)
  const labelPts = {
    cep: () => joint.localToWorld(new T.Vector3(0, -.35, .1)),
    dlab: () => joint.localToWorld(new T.Vector3(.35, .06, .09)),
    kolik: () => joint.localToWorld(peg.position.clone().add(new T.Vector3(0, 0, .13))),
    snura: () => logGroup.localToWorld(new T.Vector3(-1.4, .12, .03)),
    pozednice: () => new T.Vector3(SPAN / 2, TOP, -HZ / 2 + .4),
    vaznice: () => new T.Vector3(PX, TOP + PH + .1, -HZ / 2 + .9),
    krokev: () => new T.Vector3(-SPAN / 4 - .2, TOP + RISE / 2 + .2, zs[0]),
    klestina: () => new T.Vector3(-.4, TOP + PH + .2, zs[1]),
    sloupek: () => new T.Vector3(-PX, TOP + PH / 2, -3.4),
    lati: () => new T.Vector3(SPAN / 2 - .4, TOP + .6, HZ / 2 - .2),
  };
  const proj = new T.Vector3();
  function project(fn) {
    proj.copy(fn()); proj.project(camera);
    return { x: (proj.x * .5 + .5) * W, y: (-proj.y * .5 + .5) * H, behind: proj.z > 1 };
  }

  // ---------------------------------------------------------------- state update
  let W = 1, H = 1, P = 0, Psmooth = 0;
  function apply(p) {
    // ------------ workbench
    const vBench = p < .5;
    bench.visible = vBench;
    // log slowly turning in ch. I
    logGroup.rotation.x = reduce ? 0 : -(1 - seg(p, 0, .12)) * .9 + Math.sin(performance.now() * .0003) * .03 * (1 - seg(p, .08, .12));
    // shell flies off
    const sh = eout(seg(p, .1, .2));
    shells.forEach((m, i) => {
      m.position.copy(m.userData.dir).multiplyScalar(sh * (1.4 + i * .2)); m.position.y += sh * sh * -.6 + sh * .5;
      m.rotation.x = m.userData.dir.y * sh * .8; m.visible = sh < .995;
    });
    capMat.opacity = 1 - seg(p, .1, .13); caps.forEach(c => c.visible = capMat.opacity > .01);
    // chalk line: appears taut above, sags, snaps
    const cl = seg(p, .2, .29);
    chalkLine.visible = cl > 0 && cl < 1 && p < .31;
    const snap = seg(cl, .55, .7);
    chalkLine.scale.x = LOGL - .1;
    const lift = cl < .55 ? .09 * (1 - seg(cl, 0, .3)) + .02 : lerp(.05, 0, back(snap));
    chalkLine.position.set(0, .111 + Math.max(0, lift), .03);
    M.chalkDust.opacity = seg(cl, .62, .7) * .85 * (1 - seg(p, .33, .36));
    M.pencil.opacity = seg(p, .25, .29) * (1 - seg(p, .33, .36));
    // beam hands over to the joint
    const jv = seg(p, .3, .34);
    logGroup.position.y = LOGY - jv * 1.5; logGroup.visible = jv < .99;
    joint.visible = p > .3;
    const jx = eio(seg(p, .32, .38));
    jBeam.position.set(0, (1 - jx) * .55, 0);
    jPost.position.set(0, -(1 - jx) * .45, 0);
    jBeam.rotation.y = (1 - jx) * .6; jPost.rotation.y = -(1 - jx) * .4;
    const pg = eio(seg(p, .385, .43));
    peg.position.set(0, 0, lerp(.45, 0, pg)); peg.visible = p > .37;
    hole.visible = pg > .98;
    joint.rotation.y = reduce ? 0 : lerp(-.35, .25, seg(p, .3, .46));
    joint.position.y = 1.25 + seg(p, .44, .48) * 1.5;
    work.intensity = 2.2 * (1 - seg(p, .42, .48));
    // dust
    dust.visible = p < .45; dust.material.opacity = .55 * (1 - seg(p, .4, .45));

    // ------------ house and truss
    const hv = seg(p, .46, .52);
    house.visible = p > .455;
    walls.scale.y = Math.max(.001, eout(hv)); walls.position.y = 0;
    const show = (m, a, b, from) => { const t = seg(p, a, b); m.visible = t > 0; if (!m.visible) return 0; return t; };
    // joists
    parts.joists.forEach((m, i) => { const t = show(m, .51 + i * .003, .53 + i * .003); m.position.y = WALL + .1 - .14 + (1 - back(t)) * 2.4; });
    parts.plates.forEach((m, i) => { const t = show(m, .53 + i * .005, .55 + i * .005); m.position.y = TOP - .07 + (1 - back(t)) * 2.4; });
    parts.posts.forEach((m, i) => { const t = show(m, .545 + i * .003, .565 + i * .003); m.scale.x = Math.max(.001, eout(t)); m.position.y = TOP + PH / 2 * m.scale.x - .02; });
    parts.purlins.forEach((m, i) => { const t = show(m, .565 + i * .006, .585 + i * .006); m.position.y = TOP + PH + .06 + (1 - back(t)) * 2.4; });
    rafterPairs.forEach((g, i) => {
      const a = .585 + i * .0078, t = seg(p, a, a + .02);
      g.visible = t > 0; g.position.y = (1 - back(t)) * 3; g.rotation.y = (1 - eout(t)) * .25;
      const mk = marks[i]; mk.material.opacity = seg(p, a + .012, a + .02) * (1 - seg(p, .7, .74));
    });
    // battens
    batRows.forEach((r, k) => { const t = seg(p, .69 + k * .0025, .7 + k * .0025); r.visible = t > 0; r.position.y = (1 - eout(t)) * .8; });
    // tiles course by course
    let n = 0;
    for (let i = 0; i < tileData.length; i++) {
      const d = tileData[i]; const a = .745 + d.k * .0068, t = seg(p, a, a + .012);
      if (d.hide || t <= 0) { dummy.position.set(0, -50, 0); dummy.scale.setScalar(.0001); }
      else {
        dummy.position.set(d.x, d.y + (1 - eout(t)) * .6, d.z);
        dummy.rotation.set(0, 0, d.s * -PITCH); dummy.scale.set(1, 1, 1);
      }
      dummy.updateMatrix(); tiles.setMatrixAt(n++, dummy.matrix);
    }
    tiles.instanceMatrix.needsUpdate = true;
    roofWins.forEach((g, i) => { const t = seg(p, .86 + i * .01, .885 + i * .01); g.scale.setScalar(Math.max(.001, back(t))); g.visible = t > 0; });
    gables.forEach((g, i) => { const t = seg(p, .88 + i * .02, .92 + i * .02); g.scale.y = Math.max(.001, eout(t)); g.visible = t > 0; });
    chimney.visible = p > .9; chimney.scale.y = Math.max(.001, eout(seg(p, .9, .93)));

    // light: workshop → golden hour
    const gold = seg(p, .44, .62);
    skyMat.uniforms.glow.value = gold;
    scene.fog.color.setRGB(lerp(.078, .19, gold), lerp(.066, .13, gold), lerp(.055, .12, gold));
    scene.fog.near = lerp(10, 22, gold); scene.fog.far = lerp(30, 70, gold);
    sun.intensity = lerp(1.2, 2.6, gold); hemi.intensity = lerp(.35, .6, gold);
    sun.position.set(lerp(-4, -10, gold), lerp(8, 7, gold), lerp(9, 6, gold));
    renderer.toneMappingExposure = lerp(1.0, 1.08, gold);

    camAt(p);
  }

  function resize() {
    const r = canvas.getBoundingClientRect(); W = r.width; H = r.height;
    renderer.setSize(W, H, false); camera.aspect = W / H;
    // portrait screens: pull the camera a bit wider
    camera.zoom = W / H < .8 ? .62 : W / H < 1.2 ? .82 : 1;
    if (W / H > 1.2) camera.setViewOffset(W, H, -W * .14, 0, W, H); else camera.clearViewOffset();
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize); resize();

  let visible = true;
  new IntersectionObserver(e => { visible = e[0].isIntersecting; }, { rootMargin: '200px' }).observe(canvas);
  let last = -1;
  function loop() {
    requestAnimationFrame(loop);
    if (!visible) return;
    Psmooth += (P - Psmooth) * (reduce ? 1 : .12);
    if (Math.abs(P - Psmooth) < 1e-4) Psmooth = P;
    apply(Psmooth);
    renderer.render(scene, camera);
    if (window.KROV.onFrame) window.KROV.onFrame(Psmooth);
  }
  window.KROV = {
    setProgress(p) { P = clamp(p, 0, 1); },
    get progress() { return Psmooth; },
    project(name) { return labelPts[name] ? project(labelPts[name]) : null; },
    snap() { Psmooth = P; apply(P); renderer.render(scene, camera); },
    onFrame: null,
    tex: { woodSide, woodSideB, woodEnd, tileTex, ground },
  };
  apply(0); renderer.render(scene, camera);
  loop();
})();
