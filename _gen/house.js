  /* ---------- materiálové varianty (dům) ---------- */
  function bricksCanvas(base,mortar,vary,seed,cols,rows){const S=MOBILE?512:1024;const [c,g]=cnv(S,S);const r=rng(seed);g.fillStyle=mortar;g.fillRect(0,0,S,S);
    const bw=S/cols,bh=S/rows;for(let j=0;j<rows;j++){const off=(j%2)*bw/2;for(let i=-1;i<=cols;i++){const t=r();g.fillStyle=vary[(t*vary.length)|0];g.globalAlpha=.85+r()*.15;g.fillRect(i*bw+off+1.5,j*bh+1.5,bw-3,bh-3)}}
    g.globalAlpha=1;for(let i=0;i<(MOBILE?1500:6000);i++){g.globalAlpha=.05+r()*.1;g.fillStyle=r()<.5?"#000":"#fff";g.fillRect(r()*S,r()*S,1+r()*2,1+r()*2)}g.globalAlpha=1;return c}
  function tilesCanvas(base,dark,light,seed){const S=MOBILE?512:1024;const [c,g]=cnv(S,S);const r=rng(seed);g.fillStyle=base;g.fillRect(0,0,S,S);const rows=16,cols=10,h=S/rows,w=S/cols;
    for(let j=0;j<rows;j++){const off=(j%2)*w/2;for(let i=-1;i<=cols;i++){g.globalAlpha=.25+r()*.25;g.fillStyle=r()<.6?dark:light;g.fillRect(i*w+off+2,j*h+2,w-4,h-6)}
      g.globalAlpha=.55;g.fillStyle=dark;g.fillRect(0,j*h+h-5,S,5)}g.globalAlpha=1;return c}
  function seamCanvas(base,line){const S=512;const [c,g]=cnv(S,S);g.fillStyle=base;g.fillRect(0,0,S,S);for(let x=0;x<S;x+=S/12){g.fillStyle=line;g.globalAlpha=.6;g.fillRect(x,0,3,S);g.globalAlpha=.25;g.fillStyle="#fff";g.fillRect(x+3,0,2,S)}g.globalAlpha=1;return c}
  function boardsCanvas(){const S=MOBILE?512:1024;const [c,g]=cnv(S,S);const r=rng(17);const n=10,w=S/n;
    for(let i=0;i<n;i++){const t=r();g.fillStyle=`rgb(${(150+t*40)|0},${(104+t*30)|0},${(66+t*20)|0})`;g.fillRect(i*w,0,w,S);
      for(let k=0;k<18;k++){g.globalAlpha=.08+r()*.12;g.strokeStyle=r()<.7?"#4a2f18":"#e0b585";g.lineWidth=.6+r()*1.6;g.beginPath();const x0=i*w+r()*w;for(let y=0;y<=S;y+=12){const X=x0+Math.sin(y*.012+k)*3;y?g.lineTo(X,y):g.moveTo(X,y)}g.stroke()}
      g.globalAlpha=.8;g.fillStyle="#2a1a0e";g.fillRect(i*w,0,3,S);g.globalAlpha=1}return c}
  function grassCanvas(){const S=MOBILE?512:1024;const [c,g]=cnv(S,S);const r=rng(23);g.fillStyle="#56703c";g.fillRect(0,0,S,S);
    for(let i=0;i<40;i++){const X=r()*S,Y=r()*S,R=80+r()*200,gr=g.createRadialGradient(X,Y,0,X,Y,R);gr.addColorStop(0,r()<.5?"rgba(120,150,70,.5)":"rgba(50,70,35,.5)");gr.addColorStop(1,"rgba(0,0,0,0)");g.fillStyle=gr;g.fillRect(0,0,S,S)}
    for(let i=0;i<(MOBILE?6000:22000);i++){g.globalAlpha=.2+r()*.4;g.fillStyle=r()<.5?"#3f5a2a":"#7d9a52";g.fillRect(r()*S,r()*S,1,2+r()*4)}g.globalAlpha=1;return c}
  function pavingCanvas(){const S=512;const [c,g]=cnv(S,S);const r=rng(31);g.fillStyle="#6d6a64";g.fillRect(0,0,S,S);const n=8,w=S/n;
    for(let j=0;j<n;j++)for(let i=0;i<n;i++){const t=r();g.fillStyle=`rgb(${(150+t*30)|0},${(146+t*28)|0},${(138+t*26)|0})`;g.fillRect(i*w+3,j*w+3,w-6,w-6)}return c}

  const FRONTS={
    raw:{n:"Hrubá stavba",brick:["#b5643f","#9a9087",["#b9653e","#a85a37","#c4744a","#9e5233"],5,6,26],r:.9},
    bila:{n:"Bílá omítka",c:0xf0ede7,r:.92,sw:"#efece6"},
    piskova:{n:"Písková omítka",c:0xd9c9ad,r:.92,sw:"#d9caae"},
    seda:{n:"Šedá omítka",c:0xa9a7a2,r:.9,sw:"#aaa8a3"},
    antracit:{n:"Antracit",c:0x3b3d40,r:.85,sw:"#3b3d40"},
    drevo:{n:"Dřevěný obklad",boards:1,r:.7,sw:"linear-gradient(90deg,#b07a4a,#8d5e36)"},
    cihla:{n:"Lícové cihly",brick:["#8e3f2a","#d7d0c6",["#93432c","#7f3826","#a2533a","#8a4a35"],9,7,30],r:.85,sw:"linear-gradient(135deg,#9a4a33,#7d3826)"}
  };
  const TOPS={
    raw:{n:"Bednění",wood:["#d8bb8c","#9a7444","#ecd3a8",29],r:.8},
    antracit:{n:"Tašky antracit",tiles:["#3a3c3f","#1c1d1f","#55585c",3],r:.6,sw:"#3a3c3f"},
    cervena:{n:"Tašky cihlové",tiles:["#a4472e","#6e2a1a","#c0603f",5],r:.65,sw:"#a4472e"},
    hneda:{n:"Tašky hnědé",tiles:["#5b3a2a","#2f1d14","#7a5139",7],r:.65,sw:"#5b3a2a"},
    plech:{n:"Plech grafit",seam:["#4a4d52","#2a2c30"],r:.35,me:.6,sw:"linear-gradient(90deg,#4a4d52,#3a3d42)"}
  };
  const HANDLES={bar:"Antracit",steel:"Bílé",none:"Dřevo"};

  /* ================= DŮM (sdílený model) ================= */
  function buildKitchen(opt){
    const BP=!!opt.blueprint,SH=!!opt.shadows;
    const root=new THREE.Group();
    const RAD=tex("radial",radialCanvas,null),VG=tex("vgrad",vgradCanvas,null),SHEET=tex("sheet",sheetCanvas,null);
    const M={
      slab:new THREE.MeshStandardMaterial({color:0x8d8a84,roughness:.9}),
      flat:new THREE.MeshStandardMaterial({color:0x2f3134,roughness:.7}),
      black:new THREE.MeshStandardMaterial({color:0x1a1a1c,roughness:.45,metalness:.5}),
      steel:new THREE.MeshStandardMaterial({color:0xcfd3d7,metalness:1,roughness:.25}),
      door:new THREE.MeshStandardMaterial({map:tex("wood:door",()=>woodCanvas("#7a5032","#3b2414","#9c6a45",19),[1,1]),roughness:.5}),
      deck:new THREE.MeshStandardMaterial({map:tex("planks",planksCanvas,[2,1]),roughness:.75}),
      grass:new THREE.MeshStandardMaterial({map:tex("grass",grassCanvas,[6,6]),roughness:.95,transparent:true}),
      paving:new THREE.MeshStandardMaterial({map:tex("paving",pavingCanvas,[1,4]),roughness:.9}),
      trunk:new THREE.MeshStandardMaterial({color:0x5a4030,roughness:.9}),
      leafA:new THREE.MeshStandardMaterial({color:0x4f7a3c,roughness:.85,flatShading:true}),
      leafB:new THREE.MeshStandardMaterial({color:0x6b8f45,roughness:.85,flatShading:true}),
      hedge:new THREE.MeshStandardMaterial({color:0x3f6532,roughness:.9,flatShading:true}),
      winGlass:new THREE.MeshBasicMaterial({color:0x1a2633}),
      bulb:new THREE.MeshBasicMaterial({color:0x2c2822})
    };
    const glowMat=(col)=>new THREE.MeshBasicMaterial({map:RAD,color:col,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4});
    const add=(geo,mat,parent,x,y,z,cast=true,recv=true)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=SH&&cast;m.receiveShadow=SH&&recv;(parent||root).add(m);return m};

    /* --- swipe materiálů (ořezové roviny) --- */
    const PA=new THREE.Plane(new THREE.Vector3(1,0,0),0),PB=new THREE.Plane(new THREE.Vector3(-1,0,0),0);
    const mc={};
    function mkMat(kind,id){const D=(kind==="top"?TOPS:FRONTS)[id];const p={roughness:D.r,metalness:D.me||0,envMapIntensity:.7,color:0xffffff};
      if(D.brick)p.map=tex("brick:"+id,()=>bricksCanvas(...D.brick.slice(0,4),D.brick[4],D.brick[5]),[1,1]);
      else if(D.boards)p.map=tex("boards",boardsCanvas,[1,1]);
      else if(D.tiles)p.map=tex("tiles:"+id,()=>tilesCanvas(...D.tiles),[1,1]);
      else if(D.seam)p.map=tex("seam:"+id,()=>seamCanvas(...D.seam),[1,1]);
      else if(D.wood)p.map=tex("wood:"+id+kind,()=>woodCanvas(...D.wood),[1,1]);
      else p.color=D.c;
      return new THREE.MeshStandardMaterial(p)}
    function getMat(kind,id,side){const k=kind+id;if(!mc[k])mc[k]=mkMat(kind,id);if(!side)return mc[k];
      const ks=k+side;if(!mc[ks]){mc[ks]=mc[k].clone();mc[ks].clippingPlanes=[side==="A"?PA:PB]}return mc[ks]}
    const skins=[],frameSets=[],carc=[],arr=[],pops=[],ghostSpecs=[];
    function skin(kind,geo,parent,cast=true){const a=new THREE.Mesh(geo,getMat(kind,"raw")),b=new THREE.Mesh(geo,getMat(kind,"raw"));
      [a,b].forEach(m=>{m.castShadow=SH&&cast;m.receiveShadow=SH;parent.add(m)});b.visible=false;const it={kind,a,b,x0:0,x1:0};skins.push(it);return it}
    // UV v jednotkách stěny: 1 dlaždice textury = 0,6 × 1,45
    const UW=.6,UH=1.45;
    function boxUV(w,h,d){const g=new THREE.BoxGeometry(w,h,d);const uv=g.attributes.uv,n=g.attributes.normal;
      for(let i=0;i<uv.count;i++){const nx=Math.abs(n.getX(i)),ny=Math.abs(n.getY(i));let U=uv.getX(i),V=uv.getY(i);
        if(nx>.5){U*=d/UW;V*=h/UH}else if(ny>.5){U*=w/UW;V*=d/UH}else{U*=w/UW;V*=h/UH}uv.setXY(i,U,V)}return g}

    /* --- geometrie domu --- */
    const T=.12;                          // tloušťka zdi
    const H={x0:-2.9,x1:.7,z0:.1,z1:3.1,h:1.45,ridge:1.05};   // hlavní objem se sedlovou střechou
    const Wg={x0:.7,x1:2.5,z0:.5,z1:3.5,h:1.3};                 // křídlo s plochou střechou
    const walls=new THREE.Group();root.add(walls);
    // podlahová deska
    const slabs=new THREE.Group();root.add(slabs);
    add(new THREE.BoxGeometry(H.x1-H.x0+.1,.08,H.z1-H.z0+.1),M.slab,slabs,(H.x0+H.x1)/2,.04,(H.z0+H.z1)/2,false,true);
    add(new THREE.BoxGeometry(Wg.x1-Wg.x0+.1,.08,Wg.z1-Wg.z0+.1),M.slab,slabs,(Wg.x0+Wg.x1)/2,.04,(Wg.z0+Wg.z1)/2,false,true);
    // stěny po segmentech (kvůli postupné „stavbě“ a swipe)
    function wallRun(xa,xb,z,h,face){const n=Math.max(1,Math.round((xb-xa)/.6)),w=(xb-xa)/n;
      for(let i=0;i<n;i++){const g=new THREE.Group();const cx=xa+w*(i+.5);g.position.set(cx,.08+h/2,z);walls.add(g);skin("front",boxUV(w,h,T),g);carc.push({m:g,x:cx-w/2})}
      ghostSpecs.push({x:(xa+xb)/2,y0:.08,z,w:xb-xa,h,d:T})}
    function wallSide(x,za,zb,h){const g=new THREE.Group();g.position.set(x,.08+h/2,(za+zb)/2);walls.add(g);skin("front",boxUV(T,h,zb-za),g);carc.push({m:g,x:x-T/2});ghostSpecs.push({x,y0:.08,z:(za+zb)/2,w:T,h,d:zb-za})}
    wallRun(H.x0,H.x1,H.z1-T/2,H.h);wallRun(H.x0,H.x1,H.z0+T/2,H.h);
    wallSide(H.x0+T/2,H.z0,H.z1,H.h);
    wallRun(Wg.x0,Wg.x1,Wg.z1-T/2,Wg.h);wallRun(Wg.x0,Wg.x1,Wg.z0+T/2,Wg.h);wallSide(Wg.x1-T/2,Wg.z0,Wg.z1,Wg.h);
    // štíty (trojúhelníky) – přijedou se střechou
    function gable(x){const s=new THREE.Shape(),hz=(H.z1-H.z0)/2;s.moveTo(-hz,0);s.lineTo(hz,0);s.lineTo(0,H.ridge);s.lineTo(-hz,0);
      const g=new THREE.ExtrudeGeometry(s,{depth:T,bevelEnabled:false});const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)/UW,uv.getY(i)/UH);
      g.rotateY(Math.PI/2);const grp=new THREE.Group();grp.position.set(x,.08+H.h,(H.z0+H.z1)/2);root.add(grp);skin("front",g,grp);return grp}
    const gL=gable(H.x0),gR=gable(H.x1-T);
    // sedlová střecha
    const roof=new THREE.Group();root.add(roof);
    {const hz=(H.z1-H.z0)/2+.22,len=Math.hypot(hz,H.ridge+.12),ang=Math.atan2(H.ridge+.12,hz),L=H.x1-H.x0+.4;
     [-1,1].forEach(sg=>{const p=new THREE.Group();p.position.set((H.x0+H.x1)/2,.08+H.h-.06+(H.ridge+.12)/2,(H.z0+H.z1)/2+sg*hz/2);p.rotation.x=sg*ang;roof.add(p);
       const g=new THREE.BoxGeometry(L,.06,len);const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*L/1.2,uv.getY(i)*len/1.2);skin("top",g,p)});
     add(new THREE.BoxGeometry(H.x1-H.x0+.42,.07,.07),M.flat,roof,(H.x0+H.x1)/2,.08+H.h+H.ridge+.04,(H.z0+H.z1)/2);}
    // plochá střecha křídla + atika
    const flatRoof=new THREE.Group();root.add(flatRoof);
    add(new THREE.BoxGeometry(Wg.x1-Wg.x0+.24,.1,Wg.z1-Wg.z0+.24),M.flat,flatRoof,(Wg.x0+Wg.x1)/2,.08+Wg.h+.05,(Wg.z0+Wg.z1)/2);
    // okna (rám ve 3 provedeních: antracit / bílá / dřevo)
    const frameM={bar:new THREE.MeshStandardMaterial({color:0x2c2e31,roughness:.45,metalness:.3}),steel:new THREE.MeshStandardMaterial({color:0xf4f4f2,roughness:.4}),none:new THREE.MeshStandardMaterial({map:tex("wood:frame",()=>woodCanvas("#9c6a40","#5a3a1e","#c08a5a",37),[1,1]),roughness:.5})};
    const winPanes=[],winGroups=[];
    function win(x,y,z,w,h,sideways){const grp=new THREE.Group();winGroups.push(grp);grp.position.set(x,y,z);if(sideways)grp.rotation.y=-Math.PI/2;root.add(grp);
      const gl=add(new THREE.PlaneGeometry(w-.06,h-.06),M.winGlass,grp,0,0,.012,false,false);winPanes.push(gl);
      const set={x};["bar","steel","none"].forEach(k=>{const f=new THREE.Group();grp.add(f);const fm=frameM[k],t=.045;
        add(new THREE.BoxGeometry(w,t,.05),fm,f,0,h/2-t/2,.02);add(new THREE.BoxGeometry(w,t,.05),fm,f,0,-h/2+t/2,.02);
        add(new THREE.BoxGeometry(t,h,.05),fm,f,-w/2+t/2,0,.02);add(new THREE.BoxGeometry(t,h,.05),fm,f,w/2-t/2,0,.02);
        if(w>.7)add(new THREE.BoxGeometry(t*.8,h,.04),fm,f,0,0,.02);
        add(new THREE.BoxGeometry(w+.04,.03,.09),M.black,f,0,-h/2-.015,.04);f.visible=false;set[k]=f});
      frameSets.push(set);arr.push({node:grp,home:grp.position.clone(),from:new THREE.Vector3(0,0,1.6),t0:.48+frameSets.length*.012,t1:.58+frameSets.length*.012});return grp}
    const fz=H.z1+.005,wz=Wg.z1+.005;
    win(-2.35,.08+.62,fz,.7,.85);win(-1.5,.08+.62,fz,.7,.85);win(-.25,.08+.5,fz,1.0,1.0);
    win(1.6,.08+.62,wz,1.5,1.05);                      // velké prosklení obýváku
    win(H.x0-.005,.08+.62,1.6,.8,.85,true);
    win(H.x0-.005,.08+H.h+.38,1.6,.55,.42,true);        // okno ve štítu (podkroví)
    // vchodové dveře (otevírají se během montáže)
    const doorPivot=new THREE.Group();doorPivot.position.set(-.95+.24,.08,fz);root.add(doorPivot);
    add(new THREE.BoxGeometry(.48,.98,.04),M.door,doorPivot,-.24,.49,.02);add(new THREE.BoxGeometry(.03,.22,.03),M.steel,doorPivot,-.42,.5,.06);
    arr.push({node:doorPivot,home:doorPivot.position.clone(),from:new THREE.Vector3(0,0,1.4),t0:.52,t1:.6});
    const entry=new THREE.Group();root.add(entry);
    add(new THREE.BoxGeometry(.7,.04,.4),M.flat,entry,-.95,.08+1.12,fz+.2);   // stříška nad vstupem
    arr.push({node:entry,home:entry.position.clone(),from:new THREE.Vector3(0,1.6,0),t0:.55,t1:.62});
    // příchody střechy a štítů
    arr.push({node:roof,home:roof.position.clone(),from:new THREE.Vector3(0,2.6,0),t0:.45,t1:.56});
    arr.push({node:gL,home:gL.position.clone(),from:new THREE.Vector3(0,2.2,0),t0:.44,t1:.53});
    arr.push({node:gR,home:gR.position.clone(),from:new THREE.Vector3(0,2.2,0),t0:.44,t1:.53});
    arr.push({node:flatRoof,home:flatRoof.position.clone(),from:new THREE.Vector3(0,2.2,0),t0:.47,t1:.57});

    // strop (jen pro rozložený dům)
    const ceiling=new THREE.Group();ceiling.visible=false;root.add(ceiling);
    add(new THREE.BoxGeometry(H.x1-H.x0,.09,H.z1-H.z0),M.slab,ceiling,(H.x0+H.x1)/2,.08+H.h+.045,(H.z0+H.z1)/2);
    add(new THREE.BoxGeometry(Wg.x1-Wg.x0,.09,Wg.z1-Wg.z0),M.slab,ceiling,(Wg.x0+Wg.x1)/2,.08+Wg.h+.045,(Wg.z0+Wg.z1)/2);
    /* --- pozemek --- */
    const ground=add(new THREE.PlaneGeometry(16,12).rotateX(-Math.PI/2),M.grass,root,-.2,0,2.4,false,true);
    const path=add(new THREE.BoxGeometry(.6,.02,1.6),M.paving,root,-.95,.01,3.95,false,true);
    const deck=new THREE.Group();deck.position.set(1.6,.04,3.95);root.add(deck);add(new THREE.BoxGeometry(1.8,.06,.85),M.deck,deck,0,0,0,false,true);
    arr.push({node:deck,home:deck.position.clone(),from:new THREE.Vector3(0,-.4,0),t0:.6,t1:.68});
    function pop(node,t0){node.userData.s=node.scale.x;pops.push({node,t0});return node}
    function tree(x,z,s,t0){const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(s);root.add(g);add(new THREE.CylinderGeometry(.05,.07,.8,8),M.trunk,g,0,.4,0);
      add(new THREE.IcosahedronGeometry(.48,1),M.leafA,g,0,1.05,0);add(new THREE.IcosahedronGeometry(.36,1),M.leafB,g,.16,1.38,.08);add(new THREE.IcosahedronGeometry(.3,1),M.leafA,g,-.18,1.3,-.06);pop(g,t0)}
    tree(-3.9,2.4,1.25,.66);tree(3.4,1.6,1.05,.68);tree(-3.4,4.4,.85,.7);
    for(let i=0;i<5;i++){const b=new THREE.Group();b.position.set(-2.8+i*.42,0,3.55);root.add(b);const m=add(new THREE.IcosahedronGeometry(.2,1),M.hedge,b,0,.16,0);m.scale.set(1,.8,1);pop(b,.69+i*.006)}
    // zahradní sloupková světla (pend)
    const pend=[];[[-.5,3.4],[-.5,4.4],[.55,4.6]].forEach(([x,z],i)=>{const g=new THREE.Group();g.position.set(x,0,z);root.add(g);
      add(new THREE.CylinderGeometry(.035,.035,.42,10),M.black,g,0,.21,0);const bulb=add(new THREE.BoxGeometry(.07,.05,.07),M.bulb.clone(),g,0,.38,0,false,false);
      const spr=new THREE.Sprite(new THREE.SpriteMaterial({map:RAD,color:0xffd9a0,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));spr.scale.set(.5,.5,1);spr.position.set(0,.38,0);g.add(spr);
      const pool=new THREE.Mesh(new THREE.PlaneGeometry(1.4,1.4).rotateX(-Math.PI/2),glowMat(0xffc98a));pool.position.set(0,.015,0);g.add(pool);
      let L=null;if(!MOBILE||i===0){L=new THREE.PointLight(0xffd29a,0,2.2,2);L.position.set(0,.45,0);g.add(L)}
      pop(g,.7+i*.01);pend.push({bulb,spr,pool,L})});
    // nástěnná světla u vchodu (hood)
    const scon=[];[-1.32,-.58].forEach(x=>{const b=add(new THREE.BoxGeometry(.06,.1,.05),M.bulb.clone(),entry,x,.08+.82,fz+.03,false,false);
      const wash=new THREE.Mesh(new THREE.PlaneGeometry(.5,.9),new THREE.MeshBasicMaterial({map:VG,color:0xffd7a2,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));wash.rotation.z=Math.PI;wash.position.set(x,.08+.4,fz+.02);root.add(wash);scon.push({b,wash})});
    const porchPool=new THREE.Mesh(new THREE.PlaneGeometry(1.6,1.2).rotateX(-Math.PI/2),glowMat(0xffc98a));porchPool.position.set(-.95,.03,fz+.6);root.add(porchPool);
    const porchL=new THREE.SpotLight(0xffd8a8,0,4,.9,.6,1.5);porchL.position.set(-.95,1.15,fz+.25);porchL.target.position.set(-.95,0,fz+.9);root.add(porchL,porchL.target);
    // světlo z oken (led): odlesky na terase a trávníku
    const spill=[[-2.35,fz+.55,.9],[-1.5,fz+.55,.9],[-.25,fz+.6,1.2],[1.6,wz+.7,1.8]].map(([x,z,s])=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(s,s*.8).rotateX(-Math.PI/2),glowMat(0xffc480));m.position.set(x,.05,z);root.add(m);return m});

    /* --- výkres: kreslí se postupně jako skutečný projekt --- */
    const planPts=[],Y0=.012;const seg=(x1,z1,x2,z2)=>planPts.push(x1,Y0,z1,x2,Y0,z2);
    const rect=(x0,z0,x1,z1)=>{seg(x0,z0,x1,z0);seg(x1,z0,x1,z1);seg(x1,z1,x0,z1);seg(x0,z1,x0,z0)};
    const arc=(cx,cz,r,a0,a1,n=12)=>{for(let i=0;i<n;i++){const t0=a0+(a1-a0)*i/n,t1=a0+(a1-a0)*(i+1)/n;seg(cx+Math.cos(t0)*r,cz+Math.sin(t0)*r,cx+Math.cos(t1)*r,cz+Math.sin(t1)*r)}};
    const dashed=(x0,z0,x1,z1,n=16,dot)=>{for(let i=0;i<n;i++){const a=i/n,b=(i+(dot?.35:.6))/n;seg(lerp(x0,x1,a),lerp(z0,z1,a),lerp(x0,x1,b),lerp(z0,z1,b))}};
    const tick=(x,z)=>{const t=.06;seg(x-t,z+t,x+t,z-t)};
    const DIMS=[],DT=[];      // kóty: pozice popisku a okamžik, kdy se dokreslí
    const chainX=(xs,z,ext)=>{seg(xs[0]-.1,z,xs[xs.length-1]+.1,z);xs.forEach(x=>{tick(x,z);seg(x,z-.08,x,ext)});for(let i=0;i<xs.length-1;i++){DIMS.push([(xs[i]+xs[i+1])/2,0,z-.09]);DT.push(planPts.length)}};
    const chainZ=(zs,x,ext)=>{seg(x,zs[0]-.1,x,zs[zs.length-1]+.1);zs.forEach(z=>{tick(x,z);seg(x+(ext>x?-.08:.08),z,ext,z)});for(let i=0;i<zs.length-1;i++){DIMS.push([x-.12,0,(zs[i]+zs[i+1])/2]);DT.push(planPts.length)}};
    // 1) hranice pozemku
    const PX0=-4.6,PX1=4.3,PZ0=-1.4,PZ1=5.6;dashed(PX0,PZ0,PX1,PZ0,24,1);dashed(PX1,PZ0,PX1,PZ1,18,1);dashed(PX1,PZ1,PX0,PZ1,24,1);dashed(PX0,PZ1,PX0,PZ0,18,1);
    // 2) osy konstrukce s kroužky
    const AX=[H.x0+T/2,-1.9,-.6,H.x1-T/2,Wg.x1-T/2],AZ=[H.z0+T/2,1.9,H.z1-T/2];
    AX.forEach(x=>{dashed(x,-.9,x,4.7,14,1);arc(x,-1.08,.17,0,6.283,14)});AZ.forEach(z=>{dashed(-4.1,z,3.5,z,18,1);arc(-4.28,z,.17,0,6.283,14)});
    // 3) obvodové zdi (dvojitá čára)
    rect(H.x0,H.z0,H.x1,H.z1);rect(H.x0+T,H.z0+T,H.x1-T,H.z1-T);rect(Wg.x0,Wg.z0,Wg.x1,Wg.z1);rect(Wg.x0+T,Wg.z0+T,Wg.x1-T,Wg.z1-T);
    // 4) příčky, dveře, okna, schodiště
    seg(-1.9,H.z0+T,-1.9,1.9);seg(H.x0+T,1.9,-.6,1.9);seg(-.6,H.z0+T,-.6,2.3);seg(-2.2,1.9,-2.2,H.z1-T);seg(Wg.x0+T,2.0,Wg.x1-T,2.0);
    arc(-.71,H.z1,.48,Math.PI,Math.PI*1.5);arc(-1.9,1.4,.4,0,Math.PI/2);arc(-.6,2.3,.4,Math.PI/2,Math.PI);arc(Wg.x0+T,2.0,.45,0,Math.PI/2);
    [[-2.35,.7,H.z1],[-1.5,.7,H.z1],[-.25,1.0,H.z1],[1.6,1.5,Wg.z1]].forEach(([x,w,z])=>{seg(x-w/2,z+.04,x+w/2,z+.04);seg(x-w/2,z-T-.04,x+w/2,z-T-.04)});
    for(let i=0;i<9;i++)seg(-1.78+i*.07,.5,-1.78+i*.07,1.3);seg(-1.78,.9,-1.22,.9);
    // terasa, chodník
    rect(.7,Wg.z1,2.5,Wg.z1+.85);for(let i=1;i<9;i++)seg(.7+i*.2,Wg.z1,.7+i*.2,Wg.z1+.85);rect(-1.25,H.z1,-.65,H.z1+1.6);
    // 5) kótovací řetězce
    chainX([H.x0,-1.9,-.6,H.x1,Wg.x1],H.z1+1.25,H.z1+.12);
    chainX([H.x0,Wg.x1],H.z1+1.65,H.z1+1.33);
    chainZ([H.z0,1.9,H.z1],H.x0-.7,H.x0-.06);
    chainZ([Wg.z0,Wg.z1],Wg.x1+.6,Wg.x1+.06);
    // 6) severka
    arc(3.6,-.6,.28,0,6.283,20);seg(3.6,-.95,3.6,-.25);seg(3.6,-.95,3.5,-.75);seg(3.6,-.95,3.7,-.75);
    const planGeo=new THREE.BufferGeometry();planGeo.setAttribute("position",new THREE.Float32BufferAttribute(planPts,3));
    const blueM=new THREE.LineBasicMaterial({color:0x9fd3ff,transparent:true,opacity:0,fog:false,depthWrite:false});
    const plan=new THREE.LineSegments(planGeo,blueM);plan.renderOrder=2;root.add(plan);const planN=planPts.length/3;
    const pen=new THREE.Sprite(new THREE.SpriteMaterial({map:RAD,color:0xffe2b8,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));pen.scale.set(.42,.42,1);pen.renderOrder=3;root.add(pen);
    // výškové kóty (pohled) – kreslí se při růstu obrysů
    const elevPts=[],EX=Wg.x1+1.15,EZ=H.z0+.4,lev=[0,.08+H.h,.08+H.h+H.ridge];const es=(a,b,c,d,e,f)=>elevPts.push(a,b,c,d,e,f);
    es(EX,0,EZ,EX,lev[2]+.15,EZ);lev.forEach(y=>{es(EX-.1,y,EZ,EX+.55,y,EZ);es(EX-.06,y-.06,EZ,EX+.06,y+.06,EZ);es(EX+.6,y,EZ,EX+.75,y,EZ)});
    const elevGeo=new THREE.BufferGeometry();elevGeo.setAttribute("position",new THREE.Float32BufferAttribute(elevPts,3));
    const elevM=new THREE.LineBasicMaterial({color:0x9fd3ff,transparent:true,opacity:0,fog:false,depthWrite:false});const elev=new THREE.LineSegments(elevGeo,elevM);elev.visible=false;root.add(elev);
    // popisky kót: půdorys (podle postupu kreslení) + výšky
    const dims=DIMS.map(p=>new THREE.Vector3(...p)).concat(lev.map(y=>new THREE.Vector3(EX+.35,y+.12,EZ)));
    const dimWin=DT.map(n=>{const f=(n/3)/planN;return [f*.22,.33]}).concat([[.2,.47],[.22,.47],[.24,.47]]);
    /* --- drátové obrysy --- */
    const ghostM=new THREE.LineBasicMaterial({color:0x8cc4ea,transparent:true,opacity:0,fog:false,depthWrite:false});
    ghostSpecs.push({x:(H.x0+H.x1)/2,y0:.08+H.h,z:(H.z0+H.z1)/2,w:H.x1-H.x0,h:H.ridge,d:H.z1-H.z0,roof:1});
    const ghosts=ghostSpecs.map(s=>{const g=new THREE.Group();g.position.set(s.x,s.y0,s.z);let geo;
      if(s.roof){const sh=new THREE.Shape(),hz=s.d/2;sh.moveTo(-hz,0);sh.lineTo(hz,0);sh.lineTo(0,s.h);sh.lineTo(-hz,0);geo=new THREE.ExtrudeGeometry(sh,{depth:s.w,bevelEnabled:false});geo.rotateY(Math.PI/2);geo.translate(-s.w/2,0,0)}
      else{geo=new THREE.BoxGeometry(s.w,s.h,s.d);geo.translate(0,s.h/2,0)}
      const l=new THREE.LineSegments(new THREE.EdgesGeometry(geo),ghostM);g.add(l);g.visible=false;root.add(g);return{g,x:s.x}});
    /* --- „laser“ stavby a swipe povrchů --- */
    const laser=new THREE.Group();laser.visible=false;root.add(laser);
    const sheetM=new THREE.MeshBasicMaterial({map:SHEET,color:0x9fd0ff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
    const sheet=new THREE.Mesh(new THREE.PlaneGeometry(4.2,3.2),sheetM);sheet.rotation.y=Math.PI/2;sheet.position.set(0,1.6,1.8);laser.add(sheet);
    const lineM=new THREE.MeshBasicMaterial({color:0xcfeaff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false});
    const lv=new THREE.Mesh(new THREE.BoxGeometry(.012,3.2,.012),lineM);lv.position.set(0,1.6,3.9);laser.add(lv);
    const lf=new THREE.Mesh(new THREE.BoxGeometry(.014,.004,4.2),lineM);lf.position.set(0,.02,1.8);laser.add(lf);
    const NP=MOBILE?120:360,pp=new Float32Array(NP*3),seeds=[];for(let i=0;i<NP;i++)seeds.push([Math.random(),Math.random(),Math.random(),.6+Math.random()*.8]);
    const pGeo=new THREE.BufferGeometry();pGeo.setAttribute("position",new THREE.BufferAttribute(pp,3));
    const dust=new THREE.Points(pGeo,new THREE.PointsMaterial({color:0xf3d2a0,size:MOBILE?.03:.022,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));dust.frustumCulled=false;dust.visible=false;root.add(dust);
    /* --- světla --- */
    const hemi=new THREE.HemisphereLight(0xfff1e0,0x2a2b20,.4);root.add(hemi);
    const key=new THREE.DirectionalLight(0xfff4e8,.8);key.position.set(-4.5,6.5,6);key.target.position.set(-.2,.8,1.8);root.add(key,key.target);
    if(SH){key.castShadow=true;key.shadow.mapSize.set(2048,2048);const sc=key.shadow.camera;sc.left=-5.5;sc.right=5.5;sc.top=5.5;sc.bottom=-5.5;sc.near=1;sc.far=20;key.shadow.bias=-.0004;key.shadow.normalBias=.03;key.shadow.radius=4}
    const fill=new THREE.DirectionalLight(0x9fc4ea,.25);fill.position.set(5,3.5,7);root.add(fill);
    root.updateMatrixWorld(true);
    const bb=new THREE.Box3();skins.forEach(it=>{bb.setFromObject(it.a);it.x0=bb.min.x;it.x1=bb.max.x});
    const doorHome=doorPivot.rotation.y;

    /* ================= API ================= */
    const RAW={front:"raw",top:"raw",handle:"none"};
    const cA=new THREE.Color(),cB=new THREE.Color();
    const K={root,RAW,
      setPlan(f,op){const n=Math.floor(planN*f/2)*2;planGeo.setDrawRange(0,n);blueM.opacity=op;plan.visible=op>.002&&f>0;
        if(n>=2&&f<1){const i=(n-1)*3;pen.position.set(planPts[i],.05,planPts[i+2]);pen.material.opacity=op*.95}else pen.material.opacity=0;pen.visible=pen.material.opacity>.01},
      dimPoints:dims,dimWin,
      setElev(op){elevM.opacity=op;elev.visible=op>.002},
      setGhost(P,op){ghostM.opacity=op;ghosts.forEach(gh=>{const d=cl((gh.x+3.2)/6),s=ease(sm(.2+d*.1,.28+d*.1,P));gh.g.visible=op>.002&&s>.002;gh.g.scale.y=Math.max(.001,s)})},
      setCarcass(sx){carc.forEach(c=>c.m.visible=c.x<sx)},
      setRoom(v){M.grass.opacity=v;M.grass.transparent=v<1;M.grass.depthWrite=v>.5;ground.visible=v>.002;path.visible=v>.3;slabs.visible=v>.002},
      setArrive(P){arr.forEach(a=>{const k=ease(sm(a.t0,a.t1,P));a.node.position.copy(a.home).addScaledVector(a.from,1-k);a.node.visible=k>.001})},
      setPop(P){pops.forEach(p=>{const k=sm(p.t0,p.t0+.05,P);const s=p.node.userData.s*(k<1?(1-Math.pow(1-k,3))*(1+.12*Math.sin(k*Math.PI)):1);p.node.scale.setScalar(Math.max(.0001,s));p.node.visible=k>.001})},
      setOpen(o){doorPivot.rotation.y=doorHome-1.1*o},
      setSkin(sa,sb,sx){PA.constant=-sx;PB.constant=sx;
        for(const it of skins){const ia=it.kind==="top"?sa.top:sa.front,ib=it.kind==="top"?sb.top:sb.front;
          if(ia===ib||sx<=it.x0){it.a.visible=true;it.b.visible=false;it.a.material=getMat(it.kind,ia)}
          else if(sx>=it.x1){it.a.visible=false;it.b.visible=true;it.b.material=getMat(it.kind,ib)}
          else{it.a.visible=it.b.visible=true;it.a.material=getMat(it.kind,ia,"A");it.b.material=getMat(it.kind,ib,"B")}}
        for(const f of frameSets){const st=f.x<sx?sb:sa;["bar","steel","none"].forEach(k=>f[k].visible=st.handle===k)}},
      setLaser(x,mode,op,t){laser.visible=op>.002;dust.visible=mode==="cut"&&op>.002;if(!laser.visible)return;laser.position.x=x;
        const col=mode==="cut"?0x9fd0ff:0xffd08a;sheetM.color.setHex(col);lineM.color.setHex(mode==="cut"?0xd8efff:0xffe7c0);sheetM.opacity=op*(mode==="cut"?.5:.65);lineM.opacity=op;
        if(dust.visible){dust.material.opacity=op*.9;for(let i=0;i<NP;i++){const s=seeds[i],f=((t||0)*.00022*s[3]+s[1])%1;pp[i*3]=x+(s[0]-.5)*.2+f*.3*(s[0]-.5);pp[i*3+1]=1.8*(1-f)*s[3]*.75;pp[i*3+2]=.1+s[2]*3.4}pGeo.attributes.position.needsUpdate=true}},
      setLights(L){const day=L.day||0;
        hemi.intensity=lerp(.16,.85,day);hemi.color.setHex(day>.5?0xf4f7fb:0xffe9d0);key.intensity=lerp(.22,1.5,day);key.color.lerpColors(cA.setHex(0x9fb4d8),cB.setHex(0xfff6ea),day);fill.intensity=lerp(.18,.35,day);
        M.grass.color.lerpColors(cA.setHex(0x5a6a5a),cB.setHex(0xffffff),day);
        const led=L.led||0;M.winGlass.color.lerpColors(cA.setHex(day>.5?0x7f97ab:0x0c1520),cB.setHex(0xffcf8a),led*(1-day*.6));spill.forEach(m=>m.material.opacity=led*(1-day)*.55);
        const hd=L.hood||0;scon.forEach(s=>{s.b.material.color.lerpColors(cA.setHex(0x2c2822),cB.setHex(0xfff2dc),hd);s.wash.material.opacity=hd*.5});porchPool.material.opacity=hd*.6*(1-day*.7);porchL.intensity=hd*1.6;
        const pv=L.pend||[0,0,0];pend.forEach((p,i)=>{const v=pv[i]||0;p.bulb.material.color.lerpColors(cA.setHex(0x2c2822),cB.setHex(0xfff0d6),v);p.spr.material.opacity=v*.9;p.pool.material.opacity=v*.45*(1-day*.7);if(p.L)p.L.intensity=v*(MOBILE?1.6:1.1)})},
      xplAnchors:[new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3()],
      setExplode(e){ground.visible=false;path.visible=false;deck.visible=false;plan.visible=false;pops.forEach(p=>p.node.visible=false);spill.forEach(m=>m.material.opacity=0);porchPool.material.opacity=0;slabs.visible=true;ceiling.visible=e>.01;
        const up=[walls,doorPivot,entry,...winGroups],tops=[roof,gL,gR,flatRoof],L1=e*1.15,L2=e*2.2,L3=e*3.3;
        up.concat(tops).forEach(n=>{if(n.userData.by===undefined)n.userData.by=n.position.y});
        up.forEach(n=>n.position.y=n.userData.by+L1);tops.forEach(n=>n.position.y=n.userData.by+L3);ceiling.position.y=L2;
        const ax=Wg.x1+.35,az=(Wg.z0+Wg.z1)/2,A=this.xplAnchors;A[0].set(ax,.06,az);A[1].set(ax,.08+Wg.h*.5+L1,az);A[2].set(ax,.08+Wg.h+.05+L2,az);A[3].set(ax,.08+H.h+H.ridge*.45+L3,az)},
      setSun(h,season,f){const sum=season!=="zima",rise=sum?5:7.8,set=sum?21:16.2,maxEl=(sum?63:17)*Math.PI/180,azMax=(sum?125:53)*Math.PI/180;
        const k=cl((h-rise)/(set-rise)),up=h>rise&&h<set,el=up?Math.sin(Math.PI*k)*maxEl:0,phi=lerp(-azMax,azMax,k),R=10;
        key.position.set(-.2-Math.sin(phi)*Math.cos(el)*R,.8+Math.max(.15,Math.sin(el)*R),1.8+Math.cos(phi)*Math.cos(el)*R);
        const s=Math.sin(el)/Math.sin(63*Math.PI/180);
        key.intensity=lerp(.22,up?lerp(.35,1.6,s):0,f);key.color.lerpColors(cA.setHex(0xffa860),cB.setHex(0xfff6ea),cl(el/(.45)));
        hemi.intensity=lerp(.16,up?lerp(.42,.85,s):.2,f)},
      finished(){this.setElev(0);this.setPlan(0,0);this.setGhost(1,0);this.setCarcass(99);this.setRoom(1);this.setArrive(1);this.setPop(1);this.setOpen(0);this.setLaser(0,"cut",0,0)}
    };
    return K;
  }

