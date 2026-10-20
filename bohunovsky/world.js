/* Bohuňovský – celý web jako jeden 3D svět.
   Kamera jede po "kolejích" svázaných se sekcemi stránky (stěna s rozvody → rozdělovač → koupelna → zpět ke stěně).
   Místo baterky je u kurzoru rentgen: druhý průchod scény (vrstva 1) s průsvitnými rozvody, proudící vodou a výkresovým rastrem.
   Úvod: průlet trubkou v rentgenu, rozložený lisovaný spoj s popisky, pak se rentgen stáhne do kurzoru. */
(function(){
const host=document.getElementById('bg3d');if(!host||!window.THREE)return;
const V3=THREE.Vector3;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse=matchMedia('(pointer: coarse)').matches;
const mobile=innerWidth<760||coarse;
let R;try{R=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'})}catch(e){host.classList.add('nogl');return}
R.setPixelRatio(Math.min(devicePixelRatio,mobile?1.6:1.75));
R.outputEncoding=THREE.sRGBEncoding;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.0;
R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFShadowMap;
host.appendChild(R.domElement);
const S=new THREE.Scene();const BG=new THREE.Color(0xece8e2);S.background=BG;S.fog=new THREE.Fog(0xece8e2,70,190);
const cam=new THREE.PerspectiveCamera(34,1,.02,420);
const XL=1; // vrstva rentgenu

/* ================= textury ================= */
function canvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return [c,c.getContext('2d')]}
function rnd(seed){let s=seed;return()=>{s=(s*16807)%2147483647;return s/2147483647}}
function heightToNormal(src,strength){const w=src.width,h=src.height;const sx=src.getContext('2d').getImageData(0,0,w,h).data;
  const [c,x]=canvas(w,h);const out=x.createImageData(w,h);const H=(i,j)=>sx[(((j+h)%h)*w+((i+w)%w))*4]/255;
  for(let j=0;j<h;j++)for(let i=0;i<w;i++){const dx=(H(i+1,j)-H(i-1,j))*strength,dy=(H(i,j+1)-H(i,j-1))*strength;
    const l=Math.hypot(dx,dy,1),k=(j*w+i)*4;out.data[k]=(-dx/l*.5+.5)*255;out.data[k+1]=(dy/l*.5+.5)*255;out.data[k+2]=(1/l*.5+.5)*255;out.data[k+3]=255}
  x.putImageData(out,0,0);return c}
function tex(c,srgb=true,rep){const t=new THREE.CanvasTexture(c);if(srgb)t.encoding=THREE.sRGBEncoding;t.anisotropy=8;if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping}return t}

// mramor Calacatta: atlas 3x2 desek 60x120 (3 skeny z Higgsfieldu, druhá řada otočená o 180°)
const U=mobile?384:640,NX=3,NY=2,TWp=U,THp=U*2,gr=Math.max(2,U/200);
const [tc,tx]=canvas(TWp*NX,THp*NY),[th,thx]=canvas(TWp*NX,THp*NY),[trc,trx]=canvas(TWp*NX,THp*NY);
const r1=rnd(11);
tx.fillStyle='#cfc8bf';tx.fillRect(0,0,tc.width,tc.height);thx.fillStyle='#000';thx.fillRect(0,0,tc.width,tc.height);trx.fillStyle='#d8d8d8';trx.fillRect(0,0,tc.width,tc.height);
const slot=(i,j)=>[i*TWp+gr/2,j*THp+gr/2,TWp-gr,THp-gr];
for(let j=0;j<NY;j++)for(let i=0;i<NX;i++){const [x0,y0,w,h]=slot(i,j);
  tx.fillStyle='#f1eee9';tx.fillRect(x0,y0,w,h);thx.fillStyle='#f2f2f2';thx.fillRect(x0+1,y0+1,w-2,h-2);
  trx.fillStyle='#2e2e2e';trx.fillRect(x0,y0,w,h);
  for(let k=0;k<700;k++){trx.fillStyle=`rgba(${r1()<.5?255:0},${r1()<.5?255:0},${r1()<.5?255:0},.04)`;trx.fillRect(x0+r1()*w,y0+r1()*h,8,8)}}
const MARBLE='https://d8j0ntlcm91z4.cloudfront.net/user_3JxAqGLPvN22taooKUlAO1hTSfT/hf_20261020_172439_';
const SLABS=['74825f30-f5cb-48ab-89bd-c68249e5baa7','c1d66879-6027-4746-aedc-491ae8f7ef01','38e33f39-c769-4615-b609-52f35a31b214'];
const LAYOUT=[[0,0,0,false],[1,0,1,false],[2,0,2,false],[0,1,2,true],[1,1,0,true],[2,1,1,true]];
const tileMap=tex(tc,true,true),tileNorm=tex(heightToNormal(th,mobile?1.0:1.4),false,true),tileRough=tex(trc,false,true);
const tileMapB=tex(tc,true,false); // pro jednotlivé dlaždice v koupelně (bez opakování)
SLABS.forEach((id,n)=>{const im=new Image();im.crossOrigin='anonymous';
  im.onload=()=>{LAYOUT.filter(l=>l[2]===n).forEach(([i,j,,flip])=>{const [x0,y0,w,h]=slot(i,j);tx.save();
      if(flip){tx.translate(x0+w,y0+h);tx.rotate(Math.PI);tx.drawImage(im,0,0,w,h)}else tx.drawImage(im,x0,y0,w,h);tx.restore()});
    tileMap.needsUpdate=true;tileMapB.needsUpdate=true};
  im.src=MARBLE+id+'_min.webp'});
// měď
const [cc,cx]=canvas(512,128),[cr,crx]=canvas(512,128);const r2=rnd(3);
cx.fillStyle='#c9814f';cx.fillRect(0,0,512,128);crx.fillStyle='#5a5a5a';crx.fillRect(0,0,512,128);
for(let i=0;i<900;i++){const y=r2()*128,l=40+r2()*260,x=r2()*512,a=.04+r2()*.08;cx.strokeStyle=r2()<.5?`rgba(255,214,170,${a})`:`rgba(90,40,15,${a})`;cx.lineWidth=.6+r2();cx.beginPath();cx.moveTo(x,y);cx.lineTo(x+l,y);cx.stroke();
  crx.strokeStyle=`rgba(${r2()<.5?140:40},${r2()<.5?140:40},${r2()<.5?140:40},.25)`;crx.beginPath();crx.moveTo(x,y);crx.lineTo(x+l,y);crx.stroke();}
for(let i=0;i<26;i++){const x=r2()*512,y=r2()*128,rr=6+r2()*26;const g=cx.createRadialGradient(x,y,0,x,y,rr);g.addColorStop(0,'rgba(120,58,30,.28)');g.addColorStop(1,'rgba(120,58,30,0)');cx.fillStyle=g;cx.fillRect(x-rr,y-rr,rr*2,rr*2)}
const cuMap=tex(cc,true,true),cuRough=tex(cr,false,true);cuMap.center.set(.5,.5);cuMap.rotation=Math.PI/2;cuRough.center.set(.5,.5);cuRough.rotation=Math.PI/2;cuMap.repeat.set(4,1);cuRough.repeat.set(4,1);
// omítka
function plasterCanvas(w,h,seed,base){const [c,x]=canvas(w,h);const r=rnd(seed);x.fillStyle=base;x.fillRect(0,0,w,h);
  for(let k=0;k<w*h/60;k++){const a=r()*.05;x.fillStyle=r()<.5?`rgba(255,255,255,${a})`:`rgba(0,0,0,${a})`;x.fillRect(r()*w,r()*h,1+r()*2,1+r()*2)}
  for(let k=0;k<18;k++){const X=r()*w,Y=r()*h,rr=40+r()*160;const g=x.createRadialGradient(X,Y,0,X,Y,rr);{const v=r()<.5?255:0;g.addColorStop(0,`rgba(${v},${v},${v},.04)`)}g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(X-rr,Y-rr,rr*2,rr*2)}
  return [c,x]}
const [pc0]=plasterCanvas(512,512,5,'#d8d4cd');const plasterTex=tex(pc0,true,true);plasterTex.repeat.set(3,3);
// dřevo dubové
const [wc,wx]=canvas(512,512);{const r=rnd(8);wx.fillStyle='#b88b5c';wx.fillRect(0,0,512,512);
  for(let i=0;i<220;i++){const y0=r()*512,a=.05+r()*.12,amp=2+r()*6,f=.01+r()*.02;wx.strokeStyle=r()<.6?`rgba(92,56,26,${a})`:`rgba(232,196,150,${a})`;wx.lineWidth=.6+r()*2.2;wx.beginPath();
    for(let x=0;x<=512;x+=8){const y=y0+Math.sin(x*f+i)*amp;x?wx.lineTo(x,y):wx.moveTo(x,y)}wx.stroke()}}
const woodTex=tex(wc,true,true);
// podlahová dlažba (teplá šedá, jemný beton)
const [fc0]=plasterCanvas(512,512,21,'#4a4744');const floorTex=tex(fc0,true,false);const [fc1]=plasterCanvas(512,1024,23,'#5b5752');const darkTex=tex(fc1,true,false);

/* ================= prostředí, materiály ================= */
const envS=new THREE.Scene();envS.background=new THREE.Color(0x2f2b28);
[[0xffffff,2.2,[0,7,3],[9,2.5]],[0xffd8b5,1.2,[-7,1,2],[2,7]],[0xcfe3ef,1.1,[7,0,3],[2,6]],[0xffffff,.6,[0,-1,8],[10,3]]].forEach(([c,i,p,s])=>{
  const m=new THREE.Mesh(new THREE.PlaneGeometry(s[0],s[1]),new THREE.MeshBasicMaterial({color:new THREE.Color(c).multiplyScalar(i),side:THREE.DoubleSide}));m.position.set(...p);m.lookAt(0,0,0);envS.add(m)});
const pm=new THREE.PMREMGenerator(R);S.environment=pm.fromScene(envS,.03).texture;
const MP=(o)=>new THREE.MeshPhysicalMaterial(o);
const M={
  marble:MP({map:tileMap,normalMap:tileNorm,roughnessMap:tileRough,roughness:1,clearcoat:1,clearcoatRoughness:.08,envMapIntensity:.6}),
  plaster:new THREE.MeshStandardMaterial({map:plasterTex,roughness:.95,color:0xffffff,envMapIntensity:.45}),
  cu:MP({map:cuMap,roughnessMap:cuRough,roughness:.42,metalness:1,clearcoat:.6,clearcoatRoughness:.15,envMapIntensity:1.1}),
  bronze:MP({color:0x9c7230,metalness:1,roughness:.26,clearcoat:.4,envMapIntensity:.9}),
  bead:MP({color:0x8f6526,metalness:1,roughness:.45}),
  steel:MP({color:0xaeb6ba,metalness:1,roughness:.38}),
  chrome:MP({color:0xe9ecee,metalness:1,roughness:.07,envMapIntensity:1.25}),
  rubber:new THREE.MeshStandardMaterial({color:0x1d1f21,roughness:.85}),
  gas:MP({color:0xd49a00,roughness:.45,clearcoat:.6,clearcoatRoughness:.3,envMapIntensity:.6}),
  red:MP({color:0xc11f1f,roughness:.35,clearcoat:.9}),
  blue:MP({color:0x1d63b0,roughness:.35,clearcoat:.9}),
  yellow:MP({color:0xe0b000,roughness:.35,clearcoat:.9}),
  blueTape:new THREE.MeshStandardMaterial({color:0x1667b8,roughness:.6}),
  redTape:new THREE.MeshStandardMaterial({color:0xc4271d,roughness:.6}),
  white:new THREE.MeshStandardMaterial({color:0xffffff,roughness:.6}),
  ceramic:MP({color:0xf6f6f3,roughness:.16,clearcoat:1,clearcoatRoughness:.05,envMapIntensity:.55}),
  ht:MP({color:0x9aa0a4,roughness:.5,clearcoat:.3}),
  wood:new THREE.MeshStandardMaterial({map:woodTex,roughness:.62,envMapIntensity:.5}),
  floor:MP({map:floorTex,roughness:.38,clearcoat:.4,clearcoatRoughness:.3,envMapIntensity:.4}),
  darkTile:MP({map:darkTex,roughness:.3,clearcoat:.8,clearcoatRoughness:.15,envMapIntensity:.45}),
  geberit:new THREE.MeshStandardMaterial({color:0x6b7a86,roughness:.5,metalness:.4}),
  cistern:new THREE.MeshStandardMaterial({color:0x2f6fb0,roughness:.55}),
  mirror:MP({color:0xdfe4e6,metalness:1,roughness:.02,envMapIntensity:1.4}),
  led:new THREE.MeshBasicMaterial({color:0xfff2dc,toneMapped:false}),
  glass:MP({color:0xdff1f6,roughness:.05,transparent:true,opacity:.22,clearcoat:1}),
  water:MP({color:0x9fd2e4,roughness:.04,transparent:true,opacity:.6,clearcoat:1,envMapIntensity:1.3}),
};

/* rentgenový materiál: Fresnel, aditivní, prosvítá vším */
function xrMat(color,k){return new THREE.ShaderMaterial({uniforms:{c:{value:new THREE.Color(color)},k:{value:k}},
  vertexShader:'varying vec3 vN;varying vec3 vV;varying float vD;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);vD=-mv.z;gl_Position=projectionMatrix*mv;}',
  fragmentShader:'uniform vec3 c;uniform float k;varying vec3 vN;varying vec3 vV;varying float vD;void main(){float f=1.-abs(dot(normalize(vN),normalize(vV)));f=pow(f,2.);float near=smoothstep(.04,1.6,vD);gl_FragColor=vec4(c*(f*1.5+.05)*k*near,1.);}',
  blending:THREE.AdditiveBlending,depthTest:false,depthWrite:false,transparent:true,side:THREE.DoubleSide})}
const XM={pipe:xrMat(0x7fd0ff,.95),hot:xrMat(0xff9a7a,.9),fit:xrMat(0xcfeeff,1.05),dim:xrMat(0x5aa8e0,.45),gas:xrMat(0xffd27a,.85),drain:xrMat(0x9fc7e0,.7),fixture:xrMat(0xd8f0ff,.32),hidden:xrMat(0x58b4ff,.8),hiddenHot:xrMat(0xff7a5c,.75)};
function twin(m,mat){if(!mat)return;const t=new THREE.Mesh(m.geometry,mat);t.layers.set(XL);t.frustumCulled=false;m.add(t);return t}
function xrOnly(geo,mat,parent){const m=new THREE.Mesh(geo,mat);m.layers.set(XL);parent.add(m);return m}

/* ================= stavebnice potrubí ================= */
const R0=.11;
const flowRuns=[];
function mesh(geo,mat,parent,x){const m=new THREE.Mesh(geo,mat);m.castShadow=true;m.receiveShadow=true;parent.add(m);if(x)twin(m,x);return m}
function cylBetween(A,B,r,mat,parent,x,seg=24){const len=A.distanceTo(B);const m=mesh(new THREE.CylinderGeometry(r,r,len,seg,1,true),mat,parent,x);
  m.position.copy(A).add(B).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new V3(0,1,0),B.clone().sub(A).normalize());m.userData={A:A.clone(),B:B.clone(),len};return m}
function pressRing(pos,dir,r,parent){const t=mesh(new THREE.TorusGeometry(r*1.32,r*.16,10,32),M.bead,parent,XM.fit);t.position.copy(pos);t.quaternion.setFromUnitVectors(new V3(0,0,1),dir);return t}
function elbow(C,dIn,dOut,r,parent,mat=M.bronze,x=XM.fit,press=true){const rad=r*2.6;const a=C.clone().sub(dIn.clone().multiplyScalar(rad)),b=C.clone().add(dOut.clone().multiplyScalar(rad));
  const g=new THREE.Group();parent.add(g);
  mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a,C,b),16,r*(press?1.18:1.05),24,false),mat,g,x);
  if(press)[[a,dIn,1],[b,dOut,-1]].forEach(([p,d,s])=>{const col=mesh(new THREE.CylinderGeometry(r*1.28,r*1.28,r*1.6,24),mat,g,x);col.position.copy(p).sub(d.clone().multiplyScalar(r*.8*s));
    col.quaternion.setFromUnitVectors(new V3(0,1,0),d);pressRing(p.clone().sub(d.clone().multiplyScalar(r*1.3*s)),d,r,g)});
  return g}
function clampAt(pos,dir,r,parent,wallN=new V3(0,0,1)){const ring=mesh(new THREE.TorusGeometry(r*1.25,r*.22,10,28),M.steel,parent,XM.dim);ring.position.copy(pos);ring.quaternion.setFromUnitVectors(new V3(0,0,1),dir);
  const depth=Math.abs(pos.clone().dot(wallN))-0;const rod=mesh(new THREE.CylinderGeometry(r*.22,r*.22,1,10),M.steel,parent);
  rod.quaternion.setFromUnitVectors(new V3(0,1,0),wallN);const back=pos.clone().sub(wallN.clone().multiplyScalar(depth));rod.position.copy(pos).add(back).multiplyScalar(.5);rod.scale.y=Math.max(.01,depth)}
// pravoúhlá trasa po zdi; vrací segmenty (pro růst v koupelně)
function route(pts,{mat=M.cu,r=R0,flow=null,clampEvery=2.4,parent=world,x,press=true,clamps=true,wallN}={}){
  const V=pts.map(p=>new V3(...p));const segs=[];const xm=x||(mat===M.gas?XM.gas:mat===M.ht?XM.drain:(flow==='red'?XM.hot:XM.pipe));
  for(let i=0;i<V.length-1;i++){const a=V[i],b=V[i+1];const d=b.clone().sub(a).normalize();
    const sa=a.clone(),sb=b.clone();
    if(i>0)sa.add(d.clone().multiplyScalar(r*2.6));
    let el=null;if(i<V.length-2){const dn=V[i+2].clone().sub(b).normalize();sb.sub(d.clone().multiplyScalar(r*2.6));el=elbow(b,d,dn,r,parent,mat===M.cu?M.bronze:mat,mat===M.cu?XM.fit:xm,press&&mat===M.cu)}
    const m=cylBetween(sa,sb,r,mat,parent,xm);if(mat===M.cu){m.material=M.cu}
    segs.push({m,a:sa,b:sb,d,el,len:sa.distanceTo(sb)});
    if(clamps){const L=sa.distanceTo(sb);for(let k=clampEvery*.5;k<L-.3;k+=clampEvery)clampAt(sa.clone().add(d.clone().multiplyScalar(k)),d,r,parent,wallN||new V3(0,0,1))}}
  if(flow){const path=new THREE.CurvePath();segs.forEach(s=>path.add(new THREE.LineCurve3(s.a,s.b)));flowRuns.push({path,len:path.getLength(),tape:flow,items:[],parent,tag:null})}
  return segs}
function roundedPath(pts,rad){const P=pts.map(p=>new V3(...p));const path=new THREE.CurvePath();let cur=P[0].clone();
  for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i];if(i<P.length-1){const d1=b.clone().sub(a).normalize(),d2=P[i+1].clone().sub(b).normalize();
      const p1=b.clone().sub(d1.clone().multiplyScalar(rad)),p2=b.clone().add(d2.clone().multiplyScalar(rad));path.add(new THREE.LineCurve3(cur,p1));path.add(new THREE.QuadraticBezierCurve3(p1,b,p2));cur=p2}
    else path.add(new THREE.LineCurve3(cur,b))}
  return path}
function hidden(pts,hot,rad=.5,parent=world){const path=roundedPath(pts,rad);const geo=new THREE.TubeGeometry(path,Math.max(20,Math.round(path.getLength()*3)),R0*.9,10,false);
  xrOnly(geo,hot?XM.hiddenHot:XM.hidden,parent);flowRuns.push({path,len:path.getLength(),tape:hot?'red':'blue',items:[],hidden:true,parent})}

/* ================= svět: mramorová stěna ================= */
const world=new THREE.Group();S.add(world);
const WALL_W=40,WALL_H=96,TW=1.3,TH=2.6;
{const g=new THREE.BoxGeometry(WALL_W,WALL_H,2);const wall=new THREE.Mesh(g,[M.plaster,M.plaster,M.plaster,M.plaster,M.marble,M.plaster]);
  wall.position.set(0,-WALL_H/2+8,-1);wall.receiveShadow=true;world.add(wall);
  [tileMap,tileNorm,tileRough].forEach(t=>t.repeat.set(WALL_W/(TW*NX),WALL_H/(TH*NY)));}
const Zc=.32,Zh=.62,Zg=.9,JX=6.2;
route([[-7.4,9,Zc],[-7.4,-46,Zc]],{flow:'blue'});
route([[-6.7,9,Zh],[-6.7,-1.2,Zh],[-5.2,-1.2,Zh],[-5.2,-46,Zh]],{flow:'red'});
const introRun=route([[17,3.2,Zc],[JX+.035,3.2,Zc]],{flow:'blue',clampEvery:3.2});
route([[JX-.035,3.2,Zc],[3.2,3.2,Zc],[3.2,.6,Zc],[6.6,.6,Zc],[6.6,-14,Zc],[5.0,-14,Zc],[5.0,-46,Zc]],{flow:'blue'});
route([[17,2.3,Zh],[4.2,2.3,Zh],[4.2,-1.6,Zh],[7.4,-1.6,Zh],[7.4,-46,Zh]],{flow:'red'});
route([[20,-9,Zg],[2.8,-9,Zg],[2.8,-46,Zg]],{mat:M.gas,r:R0*1.05,clampEvery:2.8});
flowRuns.forEach((f,i)=>{if(f.path.getPointAt(.99).y<-40){f.tag=Math.abs(f.path.getPointAt(.99).x-5)<.2?'voda':Math.abs(f.path.getPointAt(.99).x-7.4)<.2?'topeni':null}});
// skryté rozvody ve zdi (jen v rentgenu): stěnové topení, ležaté rozvody, stoupačky
{const zz=-.35;const s=[];for(let i=0;i<8;i++){const y=8.4-i*1.25;s.push(i%2?[-10,y,zz]:[-17.5,y,zz]);s.push(i%2?[-17.5,y,zz]:[-10,y,zz])}
  hidden([[-19.5,9.5,zz],...s,[-19.5,-1.6,zz]],true,.55);
  hidden([[-19.5,-4.5,zz],[ -1.5,-4.5,zz],[-1.5,8.8,zz]],false);
  hidden([[19.5,-5.6,zz],[11,-5.6,zz],[11,9.5,zz]],true);
  hidden([[19.5,-6.6,zz],[12,-6.6,zz],[12,9.5,zz]],false);
  hidden([[-19.5,-12,zz],[-11,-12,zz],[-11,-30,zz],[0,-30,zz],[0,-46,zz]],false);
  hidden([[-19.5,-13,zz],[-12,-13,zz],[-12,-31,zz],[-1,-31,zz],[-1,-46,zz]],true);
  hidden([[19.5,-28,zz],[10,-28,zz],[10,-46,zz]],true);}
// kulový kohout v úvodní zóně
const valve=new THREE.Group();valve.position.set(3.2,1.9,Zc);world.add(valve);
mesh(new THREE.SphereGeometry(R0*2.1,32,20),M.bronze,valve,XM.fit).scale.set(1,1.25,1);
[-1,1].forEach(s=>{mesh(new THREE.CylinderGeometry(R0*1.75,R0*1.75,R0*1.1,6),M.bronze,valve,XM.fit).position.y=s*R0*2.6});
{const st=mesh(new THREE.CylinderGeometry(R0*.35,R0*.35,R0*1.6,12),M.steel,valve);st.rotation.x=Math.PI/2;st.position.z=R0*2.4}
const lever=new THREE.Group();lever.position.z=R0*3.2;valve.add(lever);
mesh(new THREE.BoxGeometry(R0*1.1,R0*7.5,R0*.5),M.red,lever,XM.hot).position.y=R0*3.2;
// lisovaná spojka pro úvod (rozkládá se)
const joint=new THREE.Group();joint.position.set(JX,3.2,Zc);world.add(joint);const JP=[];
function jpart(m,off,rot,label,ldx,ldy){m.userData.base=m.position.clone();m.userData.off=new V3(...off);m.userData.rot=rot||0;JP.push(m);if(label)LBL.push({obj:m,text:label,dx:ldx,dy:ldy});return m}
const LBL=[];
{const r=R0;const body=mesh(new THREE.CylinderGeometry(r*1.3,r*1.3,r*6,32,1,true),M.bronze,joint,XM.fit);body.rotation.z=Math.PI/2;
  jpart(body,[0,.62,.25],.35,'Lisovací spojka z bronzu',30,-70);
  [-1,1].forEach(s=>{const b=pressRing(new V3(s*r*2.55,0,0),new V3(1,0,0),r,joint);jpart(b,[s*.42,.62,.25],0,s>0?'Lisovací lem':null,40,-40);
    const o=mesh(new THREE.TorusGeometry(r*1.02,r*.14,12,36),M.rubber,joint,XM.fit);o.rotation.y=Math.PI/2;o.position.x=s*r*1.9;jpart(o,[s*.62,.28,.12],0,s<0?'O-kroužek EPDM, těsní spoj':null,-60,50);});
  // měděné konce trubek viditelné uvnitř
  [-1,1].forEach(s=>{const e=mesh(new THREE.CylinderGeometry(r*1.005,r*1.005,r*2.6,24,1,true),M.cu,joint,XM.pipe);e.rotation.z=Math.PI/2;e.position.x=s*r*1.3;jpart(e,[s*.16,0,0],0,s>0?'Měděná trubka Cu 22 × 1 mm':null,60,60)});}
LBL.push({pos:new V3(JX+1.3,3.2,Zc),text:'Studená voda pod tlakem',dx:20,dy:40,water:true});
// žebra uvnitř úvodní trubky (tunel v rentgenu)
for(let x=16.8;x>JX+.3;x-=.32){const t=xrOnly(new THREE.TorusGeometry(R0*.97,.004,6,32),XM.dim,world);t.rotation.y=Math.PI/2;t.position.set(x,3.2,Zc)}

/* ================= servisní stěna: ventily, vodoměr, manometr ================= */
const MANI={};
function dial(kind){const [c,x]=canvas(256,256);x.fillStyle='#f6f4ef';x.beginPath();x.arc(128,128,124,0,7);x.fill();x.strokeStyle='#222';x.lineWidth=3;x.stroke();
  x.fillStyle='#1a1a1a';x.textAlign='center';
  if(kind==='bar'){for(let i=0;i<=30;i++){const a=Math.PI*.75+i/30*Math.PI*1.5;const l=i%5?10:20;x.lineWidth=i%5?2:4;x.beginPath();x.moveTo(128+Math.cos(a)*108,128+Math.sin(a)*108);x.lineTo(128+Math.cos(a)*(108-l),128+Math.sin(a)*(108-l));x.stroke();
      if(i%5===0){x.font='600 22px Arial';x.fillText(i/5,128+Math.cos(a)*70,136+Math.sin(a)*70)}}
    x.strokeStyle='#c4271d';x.lineWidth=8;x.beginPath();x.arc(128,128,100,Math.PI*.75+Math.PI*1.5*.8,Math.PI*.75+Math.PI*1.5);x.stroke();x.font='600 20px Arial';x.fillText('bar',128,196)}
  else{x.fillStyle='#1d63b0';x.font='700 20px Arial';x.fillText('m³',128,70);x.fillStyle='#111';x.fillRect(58,100,140,44);x.fillStyle='#fff';x.font='600 30px monospace';x.fillText('00274',128,133);
    x.fillStyle='#c4271d';x.fillRect(150,104,44,36);x.fillStyle='#fff';x.fillText('3',172,133);x.fillStyle='#333';x.font='500 15px Arial';x.fillText('Q3 2,5',128,182)}
  return tex(c)}
function handwheel(mat,parent){const g=new THREE.Group();parent.add(g);
  mesh(new THREE.TorusGeometry(.42,.06,10,40),mat,g,XM.fit);for(let i=0;i<4;i++){const s=mesh(new THREE.BoxGeometry(.8,.07,.07),mat,g);s.rotation.z=i*Math.PI/4*2}
  mesh(new THREE.CylinderGeometry(.11,.11,.14,16),M.steel,g).rotation.x=Math.PI/2;return g}
function gateValve(x,y,z,mat,id){const g=new THREE.Group();g.position.set(x,y,z);world.add(g);
  mesh(new THREE.CylinderGeometry(R0*2.1,R0*2.1,R0*5,24),M.bronze,g,XM.fit);
  [-1,1].forEach(s=>mesh(new THREE.CylinderGeometry(R0*1.6,R0*1.6,R0*1.1,6),M.bronze,g,XM.fit).position.y=s*R0*3.2);
  const bon=mesh(new THREE.CylinderGeometry(R0*1.1,R0*1.4,.5,16),M.bronze,g,XM.fit);bon.rotation.x=Math.PI/2;bon.position.z=.3;
  const st=mesh(new THREE.CylinderGeometry(.03,.03,.5,8),M.steel,g);st.rotation.x=Math.PI/2;st.position.z=.6;
  const w=handwheel(mat,g);w.position.z=.82;g.userData={id,wheel:w,ang:0};MANI[id]=g;return g}
gateValve(5.0,-21,Zc,M.blue,'voda');gateValve(7.4,-21,Zh,M.red,'topeni');
{// plynový kulový kohout se žlutou pákou
  const g=new THREE.Group();g.position.set(2.8,-21,Zg);world.add(g);mesh(new THREE.SphereGeometry(R0*2.2,24,16),M.bronze,g,XM.fit).scale.set(1,1.3,1);
  [-1,1].forEach(s=>mesh(new THREE.CylinderGeometry(R0*1.7,R0*1.7,R0*1.1,6),M.bronze,g,XM.fit).position.y=s*R0*2.7);
  const lv=new THREE.Group();lv.position.z=R0*3;g.add(lv);mesh(new THREE.BoxGeometry(R0*1.2,R0*8,R0*.5),M.yellow,lv,XM.gas).position.y=R0*3.4;g.userData={id:'plyn',lever:lv,ang:0};MANI.plyn=g}
{// vodoměr
  const g=new THREE.Group();g.position.set(5.0,-23.8,Zc);world.add(g);mesh(new THREE.CylinderGeometry(.42,.42,.6,32),M.bronze,g,XM.fit).rotation.x=Math.PI/2;
  const face=new THREE.Mesh(new THREE.CircleGeometry(.36,48),new THREE.MeshStandardMaterial({map:dial('m3'),roughness:.3}));face.position.z=.31;g.add(face);
  const gl=new THREE.Mesh(new THREE.CircleGeometry(.38,48),M.glass);gl.position.z=.33;g.add(gl);
  [-1,1].forEach(s=>mesh(new THREE.CylinderGeometry(R0*1.5,R0*1.5,.35,6),M.bronze,g).position.y=s*.5)}
let gaugeNeedle;{// manometr na topení
  const g=new THREE.Group();g.position.set(7.4,-23.4,Zh);world.add(g);const st=mesh(new THREE.CylinderGeometry(R0*.6,R0*.6,.6,12),M.bronze,g);st.rotation.x=Math.PI/2;st.position.z=.3;
  const body=mesh(new THREE.CylinderGeometry(.5,.5,.22,40),M.chrome,g,XM.fit);body.rotation.x=Math.PI/2;body.position.z=.7;
  const face=new THREE.Mesh(new THREE.CircleGeometry(.44,48),new THREE.MeshStandardMaterial({map:dial('bar'),roughness:.3}));face.position.z=.815;g.add(face);
  gaugeNeedle=new THREE.Mesh(new THREE.BoxGeometry(.03,.36,.01),new THREE.MeshStandardMaterial({color:0x111111}));gaugeNeedle.geometry.translate(0,.15,0);gaugeNeedle.position.z=.83;g.add(gaugeNeedle);
  const gl=new THREE.Mesh(new THREE.CircleGeometry(.46,48),M.glass);gl.position.z=.84;g.add(gl)}
// zvýrazňovací kroužky aktivního rozvodu
const halo={};[['voda',5.0,Zc,0x2a8ae0],['topeni',7.4,Zh,0xe0533f],['plyn',2.8,Zg,0xe2b400]].forEach(([id,x,z,c])=>{const m=new THREE.Mesh(new THREE.TorusGeometry(R0*1.45,R0*.18,10,32),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:0,toneMapped:false}));
  m.rotation.x=Math.PI/2;m.position.set(x,-19.6,z);world.add(m);halo[id]=m});
let outlet='voda';document.addEventListener('outlet',e=>{outlet=e.detail});

/* ================= koupelna (samostatná scéna vpravo, měřítko 1 j = 10 cm) ================= */
const BATH=new THREE.Group();BATH.position.set(96,-30,0);S.add(BATH);
const BW=28,BD=20,BH=26,FL=.75; // šířka, hloubka, výška, horní hrana dlažby
{// skořepina: zadní a levá stěna, deska podlahy
  const pl=plasterCanvas(1120,1040,31,'#c9c3b9');drawMarks(pl[1],'back');const plL=plasterCanvas(800,1040,32,'#c4beb4');drawMarks(plL[1],'left');
  const mb=new THREE.MeshStandardMaterial({map:tex(pl[0]),roughness:.95,envMapIntensity:.4}),ml=new THREE.MeshStandardMaterial({map:tex(plL[0]),roughness:.95,envMapIntensity:.4});
  const back=mesh(new THREE.BoxGeometry(BW+1,BH,1),[M.plaster,M.plaster,M.plaster,M.plaster,mb,M.plaster],BATH);back.position.set(.5,BH/2,-.5);
  const left=mesh(new THREE.BoxGeometry(1,BH,BD),[ml,M.plaster,M.plaster,M.plaster,M.plaster,M.plaster],BATH);left.position.set(-BW/2-.5,BH/2,BD/2);
  const slab=mesh(new THREE.BoxGeometry(BW+1,1.4,BD+1),M.plaster,BATH);slab.position.set(.5,-.7,BD/2-.5);}
function drawMarks(x,wall){// tužkové značky a popisky na omítce (rozměření)
  const s=40,H=1040;x.strokeStyle='rgba(60,60,64,.75)';x.fillStyle='rgba(60,60,64,.8)';x.lineWidth=2;x.font='italic 600 30px "Segoe Print","Bradley Hand",cursive';
  const P=wall==='back'?(X,Y)=>[(X+14)*s,H-Y*s]:(Z,Y)=>[(20-Z)*s,H-Y*s];
  const cross=(a,b,t)=>{const [px,py]=P(a,b);x.beginPath();x.moveTo(px-14,py);x.lineTo(px+14,py);x.moveTo(px,py-14);x.lineTo(px,py+14);x.stroke();if(t)x.fillText(t,px+10,py-12)};
  if(wall==='back'){cross(-5.75,7.5,'SV');cross(-4.25,7.5,'TV');cross(8.25,5.6,'SV');cross(9.75,5.6,'TV');cross(9,4.6,'odpad');
    const [a,b]=P(-14,10),[c]=P(14,10);x.setLineDash([18,10]);x.beginPath();x.moveTo(a,b);x.lineTo(c,b);x.stroke();x.setLineDash([]);x.fillText('+1000',P(10.5,10.3)[0],P(0,10.3)[1]);
    x.fillText('vana 1700',P(-9,6.6)[0],P(0,6.6)[1]);x.fillText('umyv. 850',P(6,9.9)[0],P(0,9.9)[1])}
  else{cross(11,10,'SV WC');cross(14,1.6,'ÚT');cross(18,1.6,'ÚT');x.fillText('WC osa',P(10,3.4)[0],P(0,3.4)[1]);
    const [a,b]=P(0,10),[c]=P(20,10);x.setLineDash([18,10]);x.beginPath();x.moveTo(a,b);x.lineTo(c,b);x.stroke();x.setLineDash([])}}
// výkres na podlaze: papír přesně přes půdorys místnosti (předměty pak dosednou na své obrysy)
const sheet=(()=>{const W=2048,H=1434,s=W/30;const [c,x]=canvas(W,H);const r=rnd(77);const P=(X,Z)=>[(X+15)*s,(Z+1)*s];
  x.fillStyle='#f7f6f1';x.fillRect(0,0,W,H);for(let k=0;k<9000;k++){x.fillStyle=`rgba(0,0,0,${r()*.025})`;x.fillRect(r()*W,r()*H,2,2)}
  [[W/2,0,W/2,H],[0,H/2,W,H/2]].forEach(([a,b,cc,d])=>{const g=a===cc?x.createLinearGradient(a-26,0,a+26,0):x.createLinearGradient(0,b-26,0,b+26);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.5,'rgba(0,0,0,.045)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;a===cc?x.fillRect(a-26,0,52,H):x.fillRect(0,b-26,W,52)});
  // stěny se šrafou
  function hatch(X0,Z0,X1,Z1){const [a,b]=P(X0,Z0),[cc,d]=P(X1,Z1);x.save();x.beginPath();x.rect(a,b,cc-a,d-b);x.clip();x.fillStyle='#e2e0da';x.fillRect(a,b,cc-a,d-b);x.strokeStyle='#444';x.lineWidth=1.3;for(let k=-1600;k<2400;k+=11){x.beginPath();x.moveTo(a+k,b);x.lineTo(a+k+(d-b),d);x.stroke()}x.restore();x.lineWidth=3.5;x.strokeStyle='#111';x.strokeRect(a,b,cc-a,d-b)}
  hatch(-15,-1,15,.12);hatch(-15,-1,-13.88,20);
  x.strokeStyle='#555';x.lineWidth=1.6;x.setLineDash([16,8]);{const [a,b]=P(14.6,0),[,d]=P(14.6,19.6);x.beginPath();x.moveTo(a,b);x.lineTo(a,d);const [e]=P(-14,0);x.lineTo(e,d);x.stroke()}x.setLineDash([]);
  // zařizovací předměty
  x.strokeStyle='#111';x.lineWidth=2.6;const rr=(X0,Z0,X1,Z1,rad)=>{const [a,b]=P(X0,Z0),[cc,d]=P(X1,Z1);x.beginPath();if(x.roundRect)x.roundRect(a,b,cc-a,d-b,rad);else x.rect(a,b,cc-a,d-b);x.stroke()};
  rr(-13.05,1,3.85,8.5,14);rr(-12.5,1.55,3.3,7.95,120);{const [a,b]=P(-11.4,4.75);x.beginPath();x.arc(a,b,12,0,7);x.stroke()}
  rr(5.2,.95,12.8,5.55,6);{const [a,b]=P(9,3.55);x.beginPath();x.ellipse(a,b,2.5*s,1.8*s,0,0,7);x.stroke()}
  {const [a,b]=P(-11.4,11);x.beginPath();x.ellipse(a,b,1.9*s,1.3*s,0,0,7);x.stroke();x.setLineDash([9,6]);rr(-13.9,9.4,-13.4,12.6,2);x.setLineDash([])}
  rr(-12.6,13.8,-12.2,18.2,3);
  // rozvody
  const line=(pts,col,w,dash)=>{x.strokeStyle=col;x.lineWidth=w;x.setLineDash(dash||[]);x.beginPath();pts.forEach((p,i)=>{const [a,b]=P(p[0],p[1]);i?x.lineTo(a,b):x.moveTo(a,b)});x.stroke();x.setLineDash([])};
  const SV='#1d63b0',TV='#c4271d',KK='#7a4a22',UT=[18,6,3,6];
  line([[0,.35],[-5.75,.35],[-5.75,1.25]],SV,4.5);line([[.6,.62],[-4.25,.62],[-4.25,1.25]],TV,4.5);line([[3.2,.35],[8.25,.35],[8.25,1.25]],SV,4.5);line([[3.8,.62],[9.75,.62],[9.75,1.25]],TV,4.5);
  line([[-13.62,2],[-13.62,11],[-12.9,11]],SV,4.5);line([[-13.62,12.6],[-13.62,14],[-12.4,14]],TV,3.5,UT);line([[-13.62,18.6],[-13.62,18],[-12.4,18]],TV,3.5,UT);
  line([[9,.55],[9,1.6],[-12.6,1.6]],KK,6,[22,9]);line([[-12.2,11],[-13.4,11]],KK,9,[22,9]);
  [[0,.35,SV],[.6,.62,TV],[3.2,.35,SV],[3.8,.62,TV],[-13.62,2,SV],[-13.62,12.6,TV],[-13.62,18.6,TV]].forEach(([X,Z,c])=>{const [a,b]=P(X,Z);x.fillStyle=c;x.beginPath();x.arc(a,b,7,0,7);x.fill()});
  {const [a,b]=P(-12.6,1.6);x.strokeStyle=KK;x.lineWidth=3;x.beginPath();x.arc(a,b,14,0,7);x.stroke()}
  // popisky
  x.fillStyle='#111';x.font='700 30px Arial';const T=(t,X,Z,c,f)=>{if(c)x.fillStyle=c;if(f)x.font=f;const [a,b]=P(X,Z);x.fillText(t,a,b)};
  T('VANA 1700 × 750',-9.2,5.2);T('UMYVADLO',6.4,7.2);T('WC',-11.9,11.4);T('OT',-12.2,19.3);
  T('SV Cu 15×1',-3.2,2.3,SV,'600 22px Arial');T('TV Cu 15×1',-3.2,3.1,TV);T('K HT DN 50, sklon 2 %',-6,2.3,KK);T('K DN 110',-12.6,9.9,KK);T('ÚT Cu 15×1',-12.6,13.4,TV);
  // kóty
  x.strokeStyle='#111';x.fillStyle='#111';x.lineWidth=1.6;x.font='500 24px Arial';
  const dimH=(X0,X1,Z,t)=>{const [a,b]=P(X0,Z),[cc]=P(X1,Z);x.beginPath();x.moveTo(a-12,b);x.lineTo(cc+12,b);[a,cc].forEach(q=>{x.moveTo(q-9,b+9);x.lineTo(q+9,b-9);x.moveTo(q,b-16);x.lineTo(q,b+16)});x.stroke();x.textAlign='center';x.fillText(t,(a+cc)/2,b-12);x.textAlign='left'};
  const dimV=(Z0,Z1,X,t)=>{const [a,b]=P(X,Z0),[,d]=P(X,Z1);x.beginPath();x.moveTo(a,b-12);x.lineTo(a,d+12);[b,d].forEach(q=>{x.moveTo(a-9,q+9);x.lineTo(a+9,q-9);x.moveTo(a-16,q);x.lineTo(a+16,q)});x.stroke();x.save();x.translate(a-14,(b+d)/2);x.rotate(-Math.PI/2);x.textAlign='center';x.fillText(t,0,0);x.restore()};
  dimH(-13.05,3.85,9.4,'1 700');dimH(5.2,12.8,6.4,'760');dimH(-14,14,8.2+0,'');dimV(0,20,13.9,'2 000');dimV(9.4,12.6,-8.6,'osa WC');
  {const [a,b]=P(0,8.2);x.textAlign='center';x.fillText('2 800',a+330,b-12);x.textAlign='left'}
  // legenda
  {const [lx,ly]=P(4.6,10);x.font='700 26px Arial';x.fillText('LEGENDA',lx,ly);x.font='500 22px Arial';
   [[SV,[],'SV  studená voda'],[TV,[],'TV  teplá voda'],[TV,UT,'ÚT  ústřední topení'],[KK,[22,9],'K  kanalizace HT']].forEach(([cl,d,t],i)=>{x.strokeStyle=cl;x.lineWidth=4.5;x.setLineDash(d);x.beginPath();x.moveTo(lx,ly+42+i*40);x.lineTo(lx+80,ly+42+i*40);x.stroke();x.setLineDash([]);x.fillStyle='#111';x.fillText(t,lx+100,ly+50+i*40)})}
  // rohové razítko
  {const [bx,by]=P(3.4,14.7),[ex,ey]=P(12.7,19.7);const bw=ex-bx,bh=ey-by,rh=bh/5;x.strokeStyle='#111';x.lineWidth=2.2;x.strokeRect(bx,by,bw,bh);
   for(let i=1;i<5;i++){x.beginPath();x.moveTo(bx,by+rh*i);x.lineTo(bx+bw,by+rh*i);x.stroke()}x.beginPath();x.moveTo(bx+bw*.55,by+rh*2);x.lineTo(bx+bw*.55,by+bh);x.stroke();
   x.fillStyle='#111';x.font='700 25px Arial';x.fillText('Instalatérství a topenářství Bohuňovský',bx+14,by+rh*.66);x.font='500 22px Arial';
   x.fillText('Akce: Rekonstrukce koupelny',bx+14,by+rh*1.66);x.fillText('Část: ZTI a ÚT, půdorys',bx+14,by+rh*2.66);x.fillText('Výkres č. 02',bx+bw*.55+14,by+rh*2.66);
   x.fillText('Měřítko 1 : 20',bx+14,by+rh*3.66);x.fillText('10/2026',bx+bw*.55+14,by+rh*3.66);x.fillText('Formát A3',bx+14,by+rh*4.66);x.fillText('Revize 0',bx+bw*.55+14,by+rh*4.66)}
  // tužkové poznámky
  x.fillStyle='rgba(70,70,74,.7)';x.font='italic 600 30px "Segoe Print","Bradley Hand",cursive';{const [a,b]=P(-6,14.8);x.save();x.translate(a,b);x.rotate(-.05);x.fillText('ověřit výšku baterie u vany!',0,0);x.restore()}
  const m=new THREE.Mesh(new THREE.PlaneGeometry(30,21),new THREE.MeshStandardMaterial({map:tex(c),roughness:.9,transparent:true}));
  m.rotation.x=-Math.PI/2;m.position.set(0,.03,9.5);m.receiveShadow=true;BATH.add(m);return m})();
// laserové čáry + laser na stativu
const LASER=[];{const lm=new THREE.MeshBasicMaterial({color:0xff2020,transparent:true,opacity:0,toneMapped:false,depthWrite:false});
  const add=(w,h,pos,rotY)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),lm);m.position.set(...pos);if(rotY)m.rotation.y=rotY;BATH.add(m);LASER.push(m)};
  add(BW,.05,[0,10,.03]);add(BD,.05,[-BW/2+.03,10,BD/2],Math.PI/2);add(.05,BH,[-5,BH/2,.03]);add(.05,BH,[9,BH/2,.03]);add(.05,BH,[-BW/2+.03,BH/2,11],Math.PI/2);
  const lz=new THREE.Group();lz.position.set(4,0,12);BATH.add(lz);[0,1,2].forEach(i=>{const a=i*Math.PI*2/3;const leg=mesh(new THREE.CylinderGeometry(.06,.06,8.4,8),M.rubber,lz);leg.position.set(Math.cos(a)*1.2,4,Math.sin(a)*1.2);leg.rotation.set(Math.sin(a)*.15,0,-Math.cos(a)*.15)});
  mesh(new THREE.BoxGeometry(1.1,1.2,1.1),new THREE.MeshStandardMaterial({color:0xf2b705,roughness:.5}),lz).position.y=8.9;
  const win=new THREE.Mesh(new THREE.PlaneGeometry(.6,.3),lm);win.position.set(0,8.9,-.56);win.rotation.y=Math.PI;lz.add(win);LASER.push(win);LASER.tripod=lz;}
// rozvody v koupelně (rostou)
const GROW=[];
function growRoute(pts,opt,t0,t1){const segs=route(pts,Object.assign({parent:BATH,clamps:false},opt));const total=segs.reduce((s,q)=>s+q.len,0)||1;let acc=0;
  segs.forEach(sg=>{const a=t0+(t1-t0)*acc/total;acc+=sg.len;const b=t0+(t1-t0)*acc/total;GROW.push({sg,a,b});sg.m.scale.y=.0001;if(sg.el)sg.el.scale.setScalar(.0001)})}
const pz=.35,lx=-BW/2+.35;
growRoute([[0,-1,pz],[0,3,pz],[-5.75,3,pz],[-5.75,7.5,pz],[-5.75,7.5,1.25]],{flow:'blue'},.30,.40);
growRoute([[.6,-1,pz],[.6,3.6,pz],[-4.25,3.6,pz],[-4.25,7.5,pz],[-4.25,7.5,1.25]],{flow:'red'},.31,.41);
growRoute([[3.2,-1,pz],[3.2,4.4,pz],[8.25,4.4,pz],[8.25,5.6,pz],[8.25,5.6,1.25]],{flow:'blue'},.33,.42);
growRoute([[3.8,-1,pz],[3.8,3.8,pz],[9.75,3.8,pz],[9.75,5.6,pz],[9.75,5.6,1.25]],{flow:'red'},.34,.43);
growRoute([[lx,-1,2],[lx,10,2],[lx,10,11]],{flow:'blue'},.36,.44);
growRoute([[lx,-1,12.6],[lx,.9,12.6],[lx,.9,14],[lx,1.6,14],[-BW/2+1.6,1.6,14]],{flow:'red'},.38,.45);
growRoute([[lx,-1,18.6],[lx,.9,18.6],[lx,.9,18],[lx,1.6,18],[-BW/2+1.6,1.6,18]],{flow:'red'},.38,.45);
growRoute([[9,4.6,.55],[9,.3,.55],[9,.3,1.6],[-12.6,.3,1.6],[-12.6,-1.2,1.6]],{mat:M.ht,r:.25,press:false},.40,.48);
growRoute([[-12.2,2.3,11],[-13.4,2.3,11],[-13.4,-1.2,11]],{mat:M.ht,r:.5,press:false},.42,.48);
// instalační předstěna WC (modrá nádržka v rámu)
const FRAME=new THREE.Group();FRAME.position.set(-BW/2+.32,0,11);BATH.add(FRAME);
[[0,6,-1.6,.5,12,.12],[0,6,1.6,.5,12,.12],[0,11.7,0,.5,.12,3.3],[0,2.3,0,.5,.12,3.3]].forEach(([x,y,z,w,h,d])=>{mesh(new THREE.BoxGeometry(w,h,d),M.geberit,FRAME,XM.fixture).position.set(x,y,z)});
mesh(new THREE.BoxGeometry(.5,4.2,2.6),M.cistern,FRAME,XM.fixture).position.set(0,9,0);FRAME.scale.setScalar(.0001);
// obklady: zadní stěna, levá stěna, podlaha
const TILES=[];
function tileUV(geo,k,fx,fy){const i=k%3,j=Math.floor(k/3)%2;const u0=i/3,u1=u0+(1/3)*fx,v0=1-(j+1)/2,v1=v0+.5*fy;const uv=geo.attributes.uv;for(let n=0;n<uv.count;n++){uv.setXY(n,u0+uv.getX(n)*(u1-u0),v0+uv.getY(n)*(v1-v0))}}
const tileMat=MP({map:tileMapB,roughness:.12,clearcoat:1,clearcoatRoughness:.06,envMapIntensity:.5});
function tileWall(width,height,place,seed,mat=tileMat){const r=rnd(seed);let n=0;for(let y=0;y<height-.01;y+=12){for(let x=0;x<width-.01;x+=6){const w=Math.min(6,width-x),h=Math.min(12,height-y);
      const geo=new THREE.BoxGeometry(w-.05,h-.05,.25);tileUV(geo,Math.floor(r()*6),w/6,h/12);const m=mesh(geo,mat,BATH);place(m,x+w/2,y+h/2);m.userData.home=m.position.clone();m.userData.k=n++;TILES.push(m)}}}
tileWall(BW,BH-FL,(m,u,v)=>{m.position.set(-BW/2+u,FL+v,.82)},4);
tileWall(BD-1,BH-FL,(m,u,v)=>{m.rotation.y=Math.PI/2;m.position.set(-BW/2+.82,FL+v,.95+u)},9,M.darkTile);
const FLOORT=[];for(let z=.95;z<BD;z+=6)for(let x=-BW/2+.95;x<BW/2;x+=6){const w=Math.min(6,BW/2-x),d=Math.min(6,BD-z);const m=mesh(new THREE.BoxGeometry(w-.05,.3,d-.05),M.floor,BATH);m.position.set(x+w/2,FL-.15,z+d/2);m.userData.home=m.position.clone();FLOORT.push(m)}
const totalT=TILES.length+FLOORT.length;TILES.forEach(m=>m.visible=false);FLOORT.forEach(m=>m.visible=false);
// zařizovací předměty
const FIX=[];function fixture(g,t0){g.userData.home=null;g.userData.t0=t0;g.visible=false;FIX.push(g);BATH.add(g);return g}
function rrShape(w,h,r){const s=new THREE.Shape();const x=-w/2,y=-h/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s}
function rrPath(w,h,r){const p=new THREE.Path();const x=-w/2,y=-h/2;p.moveTo(x+r,y);p.lineTo(x+w-r,y);p.quadraticCurveTo(x+w,y,x+w,y+r);p.lineTo(x+w,y+h-r);p.quadraticCurveTo(x+w,y+h,x+w-r,y+h);p.lineTo(x+r,y+h);p.quadraticCurveTo(x,y+h,x,y+h-r);p.lineTo(x,y+r);p.quadraticCurveTo(x,y,x+r,y);return p}
function shell(w,d,h,r,inset,ri,mat){// dutá nádoba (vana, umyvadlo): stěny = vytažený tvar s otvorem + dno
  const g=new THREE.Group();const s=rrShape(w,d,r);s.holes.push(rrPath(w-inset*2,d-inset*2,ri));
  const m=mesh(new THREE.ExtrudeGeometry(s,{depth:h,bevelEnabled:true,bevelThickness:.08,bevelSize:.08,bevelSegments:3,curveSegments:16}),mat,g,XM.fixture);m.rotation.x=-Math.PI/2;
  const b=mesh(new THREE.ExtrudeGeometry(rrShape(w-inset*2+.1,d-inset*2+.1,ri),{depth:.3,bevelEnabled:false,curveSegments:16}),mat,g);b.rotation.x=-Math.PI/2;b.position.y=h*.32;return g}
const tub=fixture(shell(16.9,7.5,5.6,.5,.55,2.2,M.ceramic),.76);tub.position.set(-13.05+8.45,FL,.95+3.75+.05);
const water=new THREE.Mesh(new THREE.ExtrudeGeometry(rrShape(15.7,6.3,2.1),{depth:.02,bevelEnabled:false,curveSegments:16}),M.water);water.rotation.x=-Math.PI/2;water.position.y=1.9;water.scale.z=1;tub.add(water);water.visible=false;
function mixer(len){const g=new THREE.Group();mesh(new THREE.CylinderGeometry(.28,.28,len,24),M.chrome,g,XM.fixture).rotation.z=Math.PI/2;
  [-1,1].forEach(s=>{const ro=mesh(new THREE.CylinderGeometry(.42,.42,.12,24),M.chrome,g);ro.rotation.x=Math.PI/2;ro.position.set(s*len*.38,0,-.32);const a=mesh(new THREE.CylinderGeometry(.12,.12,.34,12),M.chrome,g);a.rotation.x=Math.PI/2;a.position.set(s*len*.38,0,-.16)});
  const sp=mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(new V3(0,0,0),new V3(0,0,1.4),new V3(0,-.5,1.6)),12,.13,12,false),M.chrome,g);
  const lv=mesh(new THREE.BoxGeometry(.14,.14,1.1),M.chrome,g);lv.position.set(len*.42,.3,.35);lv.rotation.x=-.35;return g}
const tubMix=fixture(mixer(1.6),.8);tubMix.position.set(-5,7.5,1.32);
const stream=new THREE.Mesh(new THREE.CylinderGeometry(.07,.09,1,10,1,true),M.water);stream.visible=false;BATH.add(stream);
{// skříňka s umyvadlem
  const g=new THREE.Group();const cab=mesh(new THREE.BoxGeometry(7.6,4.7,4.6),M.wood,g,XM.fixture);cab.position.set(0,6.6,2.3);
  const groove=mesh(new THREE.BoxGeometry(7.4,.08,.05),new THREE.MeshStandardMaterial({color:0x3a2a1a}),g);groove.position.set(0,8.3,4.62);
  const top=mesh(new THREE.BoxGeometry(7.8,.3,4.8),M.ceramic,g);top.position.set(0,9.1,2.4);
  const bas=shell(5,3.6,1.3,.4,.3,1.4,M.ceramic);bas.position.set(0,9.25,2.6);g.add(bas);
  const mx=new THREE.Group();g.add(mx);mx.position.set(0,9.25,.95);mesh(new THREE.CylinderGeometry(.2,.24,2.4,20),M.chrome,mx,XM.fixture).position.y=1.2;
  mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(new V3(0,2.3,0),new V3(0,2.5,.9),new V3(0,2.1,1.4)),12,.1,10,false),M.chrome,mx);
  const lv=mesh(new THREE.BoxGeometry(.12,.12,.9),M.chrome,mx);lv.position.set(0,2.5,-.25);lv.rotation.x=.3;
  fixture(g,.8);g.position.set(9,0,.95)}
{// zrcadlo s LED
  const g=new THREE.Group();mesh(new THREE.BoxGeometry(6.8,6.4,.18),M.mirror,g);const led=new THREE.Mesh(new THREE.BoxGeometry(6.4,.1,.06),M.led);led.position.set(0,-3.25,.08);g.add(led);
  fixture(g,.86);g.position.set(9,15,1.05)}
{// závěsné WC + ovládací tlačítko
  const g=new THREE.Group();const egg=new THREE.Shape();egg.moveTo(0,-1.3);egg.bezierCurveTo(2.3,-1.35,3.7,-.9,3.7,0);egg.bezierCurveTo(3.7,.9,2.3,1.35,0,1.3);egg.lineTo(0,-1.3);
  const bowl=mesh(new THREE.ExtrudeGeometry(egg,{depth:2.4,bevelEnabled:true,bevelThickness:.25,bevelSize:.25,bevelSegments:4,curveSegments:20}),M.ceramic,g,XM.fixture);bowl.rotation.x=-Math.PI/2;bowl.position.y=2.6;
  const lid=mesh(new THREE.ExtrudeGeometry(egg,{depth:.14,bevelEnabled:true,bevelThickness:.06,bevelSize:.06,bevelSegments:2,curveSegments:20}),M.ceramic,g);lid.rotation.x=-Math.PI/2;lid.position.y=5.3;lid.scale.set(.98,.98,1);
  const plate=mesh(new THREE.BoxGeometry(.14,1.6,2.4),M.chrome,g);plate.position.set(-.05,7.7,0);[-.55,.55].forEach(z=>{const b=mesh(new THREE.BoxGeometry(.1,1.2,.9),M.white,g);b.position.set(.05,7.7,z)});
  fixture(g,.83);g.position.set(-BW/2+.95,0,11)}
{// koupelnový žebřík (otopné těleso)
  const g=new THREE.Group();[-2.1,2.1].forEach(z=>mesh(new THREE.CylinderGeometry(.16,.16,12.4,16),M.chrome,g,XM.fixture).position.set(0,8.1,z));
  for(let y=3;y<14.2;y+=1.05){const b=mesh(new THREE.CylinderGeometry(.1,.1,4.2,12),M.chrome,g);b.rotation.x=Math.PI/2;b.position.set(0,y,0)}
  [-2.1,2.1].forEach(z=>{const v=mesh(new THREE.CylinderGeometry(.14,.14,.9,12),M.chrome,g);v.position.set(0,1.75,z)});
  fixture(g,.79);g.position.set(-BW/2+1.6,0,16)}
// světla koupelny
const bathLamp=new THREE.PointLight(0xffe6c4,0,60,1.6);bathLamp.position.set(4,22,10);BATH.add(bathLamp);

/* ================= proudící voda v rentgenu (instancovaně) ================= */
const P_GEO=new THREE.SphereGeometry(.05,8,6);P_GEO.scale(1,3.2,1);
const PART={};['blue','red'].forEach(c=>{const list=[];flowRuns.filter(f=>f.tape===c).forEach(f=>{const n=Math.max(4,Math.floor(f.len/.42));for(let i=0;i<n;i++)list.push({f,u:i/n})});
  const im=new THREE.InstancedMesh(P_GEO,new THREE.MeshBasicMaterial({color:c==='blue'?0x9fe0ff:0xffb08a,transparent:true,blending:THREE.AdditiveBlending,depthTest:false,depthWrite:false,fog:false,toneMapped:false}),list.length);
  im.layers.set(XL);im.frustumCulled=false;S.add(im);PART[c]={im,list}});
// značkovací pásky se šipkou (normální průchod)
const tapeGeo=new THREE.CylinderGeometry(R0*1.03,R0*1.03,R0*2.4,24,1,true),arrowGeo=new THREE.ConeGeometry(R0*.5,R0*.9,3),arrowMat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.6});
flowRuns.filter(f=>!f.hidden&&f.parent===world).forEach(f=>{const n=Math.max(2,Math.round(f.len/3.1));for(let i=0;i<n;i++){const g=new THREE.Group();g.add(new THREE.Mesh(tapeGeo,f.tape==='blue'?M.blueTape:M.redTape));
  const ar=new THREE.Mesh(arrowGeo,arrowMat);ar.position.z=R0*1.04;g.add(ar);g.userData.u=i/n;world.add(g);f.items.push(g)}});

/* ================= světla ================= */
const hemi=new THREE.HemisphereLight(0xf4f1ec,0x8a7f72,.6);S.add(hemi);
const key=new THREE.DirectionalLight(0xfff1e2,.85);key.castShadow=true;key.shadow.mapSize.set(mobile?1024:2048,mobile?1024:2048);
Object.assign(key.shadow.camera,{left:-20,right:20,top:20,bottom:-20,near:1,far:90});key.shadow.bias=-.0004;S.add(key);S.add(key.target);
const fillL=new THREE.DirectionalLight(0xcfe0ff,.25);fillL.position.set(-10,4,8);S.add(fillL);

/* ================= rentgenový průchod a kompozice ================= */
const rtX=new THREE.WebGLRenderTarget(4,4,{minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter});
const ovMat=new THREE.ShaderMaterial({uniforms:{tX:{value:rtX.texture},m:{value:new THREE.Vector2()},r:{value:0},res:{value:new THREE.Vector2(1,1)},t:{value:0},full:{value:0},scrim:{value:0}},
  extensions:{derivatives:true},transparent:true,depthTest:false,depthWrite:false,
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
  fragmentShader:`uniform sampler2D tX;uniform vec2 m;uniform float r;uniform vec2 res;uniform float t;uniform float full;uniform float scrim;varying vec2 vUv;
  float grid(vec2 p,float s){vec2 g=p/s;vec2 f=abs(fract(g-.5)-.5)/fwidth(g);return 1.-min(min(f.x,f.y),1.);}
  void main(){vec2 p=vUv*res;float d=length(p-m);float R=max(r,.001);
    float inside=max(1.-smoothstep(R-1.5,R+.5,d),full);
    float ring=(1.-smoothstep(0.,1.6,abs(d-R)))*(1.-full)*step(1.,r);
    float a=atan(p.y-m.y,p.x-m.x);float tick=step(R-10.,d)*step(d,R-2.)*(1.-smoothstep(0.,.05,abs(fract(a/6.2831853*36.+.5)-.5)))*(1.-full)*step(1.,r);
    float ch=(1.-smoothstep(0.,1.,abs(p.x-m.x)))*step(abs(p.y-m.y),8.)+(1.-smoothstep(0.,1.,abs(p.y-m.y)))*step(abs(p.x-m.x),8.);ch*=(1.-full)*step(1.,r);
    float sa=scrim*mix(.84,0.,smoothstep(0.,.56,vUv.x))*(1.-full);
    float al=max(inside,max(ring,tick));if(al<.002&&sa<.002)discard;
    if(al<.002){gl_FragColor=vec4(.965,.953,.933,sa);return;}
    vec3 x=texture2D(tX,vUv).rgb;x=1.-exp(-x*1.35);
    vec3 base=vec3(.03,.085,.15);
    float sc=.5+.5*sin(p.y*1.4+t*6.);
    vec3 col=base+vec3(.12,.28,.45)*grid(p,24.)*.28+vec3(.25,.5,.8)*grid(p,120.)*.32+x*1.05+vec3(.01,.02,.03)*sc;
    float sw=fract(t*.18);float band=exp(-pow((vUv.y-1.+sw*1.2)*14.,2.));col+=vec3(.1,.25,.4)*band*.35;
    float vig=smoothstep(R*.45,R,d)*(1.-full);col*=1.-vig*.35;
    col=mix(col,vec3(.6,.88,1.),clamp(ring+tick*.8+ch*.7,0.,1.)*inside+ring*(1.-inside));
    vec3 sc2=vec3(.965,.953,.933);float ain=clamp(inside+ring+tick,0.,1.);gl_FragColor=vec4(mix(sc2,col,ain/max(.001,max(ain,sa))),max(ain,sa));}`});
const ovScene=new THREE.Scene(),ovCam=new THREE.OrthographicCamera(-1,1,1,-1,0,1);ovScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),ovMat));

/* ================= koleje kamery ================= */
const SH=[];
function shot(sel,anchor,off,fw,fh,dyn){const el=document.querySelector(sel);if(el)SH.push({el,anchor:new V3(...anchor),off:new V3(...off),fw,fh,dyn})}
const BC=BATH.position;
shot('.anchor-hero',[4.4,1.7,.3],[0,0,10],7.5,6.5);
shot('#sluzby .stage',[5.1,-21.6,.4],[-2.6,1.5,9],6.8,7.5);
shot('#koupelny .stage',[BC.x,BC.y+8,BC.z+8],[24,14,40],32,28,'bath');
shot('#prace .anchor-w',[BC.x-1,BC.y+9,BC.z+7],[-22,7,38],34,28);
shot('#kontakt .anchor-c',[5,-6.5,.3],[3,1.5,12],12,10);
let bathP=0;window.addEventListener('bathp',e=>{bathP=e.detail});
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;const sm=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t)};const lerp=(a,b,t)=>a+(b-a)*t;
let W=1,H=1;
function shotPose(s){const r=s.el.getBoundingClientRect();let anchor=s.anchor.clone(),off=s.off.clone(),fw=s.fw,fh=s.fh;
  if(s.dyn==='bath'){const k=ease(sm(.0,.3,bathP));off=new V3(lerp(0,22,k),lerp(48,21,k),lerp(4,38,k));anchor=new V3(BC.x,BC.y+lerp(.5,7,k),BC.z+lerp(9.4,8,k));fw=lerp(30,27,k)*(W<760?.82:1);fh=lerp(22,25,k)*(W<760?.82:1);
    const o=(bathP-.3)*.22;const c=Math.cos(o),sn=Math.sin(o);off.set(off.x*c-off.z*sn,off.y,off.x*sn+off.z*c)}
  const vf=cam.fov*Math.PI/180,hf=2*Math.atan(Math.tan(vf/2)*W/H);
  const ew=Math.max(80,Math.min(r.width,W)),eh=Math.max(80,Math.min(r.height,H));
  const need=Math.max(fw*W/(2*Math.tan(hf/2)*ew),fh*H/(2*Math.tan(vf/2)*eh));const L=off.length();off.multiplyScalar(Math.min(2.6,Math.max(.55,need/L)));
  return {pos:anchor.clone().add(off),look:anchor,sx:r.left+r.width/2,sy:r.top+r.height/2,cy:r.top+r.height/2}}
function rail(){if(!SH.length)return null;const P=SH.map(shotPose);const mid=H*.5;let i=0;
  if(mid<=P[0].cy)return P[0];if(mid>=P[P.length-1].cy)return P[P.length-1];
  for(i=0;i<P.length-1;i++)if(mid>=P[i].cy&&mid<P[i+1].cy)break;
  const a=P[i],b=P[i+1];const t=ease(sm(.18,.82,(mid-a.cy)/(b.cy-a.cy)));
  const pos=a.pos.clone().lerp(b.pos,t);const dist=a.look.distanceTo(b.look);pos.z+=Math.sin(Math.PI*t)*Math.min(30,dist*.28);pos.y+=Math.sin(Math.PI*t)*Math.min(8,dist*.05);
  return {pos,look:a.look.clone().lerp(b.look,t),sx:lerp(a.sx,b.sx,t),sy:lerp(a.sy,b.sy,t),flight:Math.sin(Math.PI*t)}}

/* ================= ovládání ================= */
function size(){W=host.clientWidth;H=host.clientHeight;R.setSize(W,H,false);cam.aspect=W/H;cam.fov=W<760?46:34;cam.updateProjectionMatrix();
  const s=R.getDrawingBufferSize(new THREE.Vector2());rtX.setSize(Math.round(s.x*(mobile?.7:1)),Math.round(s.y*(mobile?.7:1)));ovMat.uniforms.res.value.set(W,H)}
size();addEventListener('resize',size);
let mx=W*.7,my=H*.4,lx_=mx,ly_=my,hasPointer=false,overUI=false,touchT=0;
addEventListener('pointermove',e=>{mx=e.clientX;my=e.clientY;if(e.pointerType==='mouse')hasPointer=true;overUI=!!e.target.closest('a,button,input,textarea,label,.card,.tabs')},{passive:true});
addEventListener('touchstart',e=>{const t=e.touches[0];if(t){mx=t.clientX;my=t.clientY;lx_=mx;ly_=my;touchT=1.6}},{passive:true});
addEventListener('touchmove',e=>{const t=e.touches[0];if(t){mx=t.clientX;my=t.clientY;touchT=1.6}},{passive:true});
document.addEventListener('mouseleave',()=>hasPointer=false);
let flowOn=true,leverA=0;
const ray=new THREE.Raycaster(),v2=new THREE.Vector2();
function pick(cx,cy,objs){v2.set(cx/W*2-1,-(cy/H)*2+1);ray.setFromCamera(v2,cam);return ray.intersectObjects(objs,true)}
addEventListener('click',e=>{if(e.target.closest('a,button,input,textarea,label,.card'))return;
  if(pick(e.clientX,e.clientY,valve.children).length){flowOn=!flowOn;document.dispatchEvent(new CustomEvent('valve',{detail:flowOn}));return}
  for(const id in MANI){if(pick(e.clientX,e.clientY,MANI[id].children).length){document.dispatchEvent(new CustomEvent('outlet-pick',{detail:id}));return}}});
window.__bgValveScreen=()=>{const p=valve.getWorldPosition(new V3()).project(cam);return {x:(p.x*.5+.5)*W,y:(-p.y*.5+.5)*H,vis:p.z<1&&!intro.on}};
let visible=true;document.addEventListener('visibilitychange',()=>visible=!document.hidden);

/* ================= úvod ================= */
const labWrap=document.createElement('div');labWrap.className='xlabels';document.body.appendChild(labWrap);
LBL.forEach(l=>{const d=document.createElement('div');d.className='xlab'+(l.water?' w':'');d.innerHTML='<i></i><span>'+l.text+'</span>';labWrap.appendChild(d);l.el=d});
const tag=document.createElement('div');tag.className='xtag';tag.innerHTML='<b>RTG</b> co je schované ve zdi';document.body.appendChild(tag);
const cap=document.createElement('div');cap.className='xcap';cap.innerHTML='<b>RTG</b> Lisovaný spoj, rozvod studené vody<button type="button">Přeskočit</button>';document.body.appendChild(cap);
const intro={on:!reduce&&scrollY<40,t:0,dur:6.2};
function endIntro(){if(!intro.on)return;intro.on=false;intro.t=intro.dur;cap.classList.remove('on');labWrap.classList.remove('on');document.documentElement.classList.remove('intro');document.dispatchEvent(new Event('intro-done'))}
cap.querySelector('button').addEventListener('click',()=>{intro.skip=true});document.addEventListener('intro-skip',()=>{intro.skip=true});
['wheel','touchmove','keydown'].forEach(ev=>addEventListener(ev,()=>{if(intro.on&&intro.t>.6)intro.skip=true},{passive:true}));
if(intro.on){document.documentElement.classList.add('intro');cap.classList.add('on')}else{document.dispatchEvent(new Event('intro-done'))}
window.__introPending=intro.on;window.__intro=intro;window.__dbg={PART,joint,world,S};
function introPose(t){// vrací pozici, cíl, fov, rentgen (full,r,mx,my)
  const jp=new V3(JX,3.2,Zc);
  if(t<2.0){const k=ease(t/2.0);const x=lerp(16.6,JX+.75,k);return {pos:new V3(x,3.2,Zc),look:new V3(x-1,3.2,Zc),fov:72,full:1,explode:0}}
  if(t<3.0){const k=ease((t-2)/1);const pos=new V3(lerp(JX+.75,JX+.9,k),lerp(3.2,3.75,k),lerp(Zc,2.6,k));const look=new V3(lerp(JX-.25,JX,k),3.2,Zc).lerp(jp,k);return {pos,look,fov:lerp(72,38,k),full:1-k*.0,explode:ease(Math.max(0,(t-2.3)/.7))}}
  if(t<4.7){const k=(t-3)/1.7;const a=k*.35;return {pos:new V3(JX+.9*Math.cos(a)-.2*Math.sin(a),3.75+k*.1,2.6*Math.cos(a*.6)),look:jp,fov:38,full:Math.max(0,1-ease(Math.min(1,k*2.2))),explode:1}}
  return {pos:null,look:jp,fov:null,full:0,explode:1-ease(Math.min(1,(t-4.7)/.7))}}

/* ================= smyčka ================= */
const UP=new V3(0,1,0);const camPos=new V3(4.4,1.7,10),camLook=new V3(4.4,1.7,0);let scrimK=0,last=performance.now(),T=0,flowU=0,lensR=0,lensFull=intro.on?1:0,first=true,gaugeA=0;
const tmpM=new THREE.Matrix4(),tmpQ=new THREE.Quaternion(),tmpS=new V3(1,1,1),tmpP=new V3();
function frame(now){requestAnimationFrame(frame);if(!visible)return;const dt=Math.max(0,Math.min(.05,(now-last)/1000));last=now;T+=dt;
  // úvod
  let ip=null;if(intro.on){intro.t+=dt*(intro.skip?3.2:1);ip=introPose(intro.t);if(intro.t>=intro.dur)endIntro()}
  // koleje
  cam.fov=W<760?46:34;const rp=rail();
  let tPos=rp?rp.pos:camPos,tLook=rp?rp.look:camLook,sx=rp?rp.sx:W/2,sy=rp?rp.sy:H/2;
  // jemný pohyb podle kurzoru
  const px=(lx_/W-.5),py=(ly_/H-.5);const dist=tPos.distanceTo(tLook);
  const right=new V3().subVectors(tLook,tPos).cross(UP).normalize();tPos=tPos.clone().add(right.multiplyScalar(px*dist*.02)).add(new V3(0,-py*dist*.015,0));
  let vOff=1;
  if(ip){const k=intro.t<4.7?1:1-ease(Math.min(1,(intro.t-4.7)/1.5));vOff=1-k;
    if(ip.pos){tPos=tPos.clone().lerp(ip.pos,k);}else{tPos=ip.look.clone().add(new V3(.9,.6,2.6)).lerp(tPos,1-k)}
    tLook=tLook.clone().lerp(ip.look,k);cam.fov=lerp(cam.fov,ip.fov||cam.fov,k);
    JP.forEach(m=>{const e=ip.explode;m.position.copy(m.userData.base).addScaledVector(m.userData.off,e);m.rotation.x=(m.userData.rot||0)*e});}
  else JP.forEach(m=>{m.position.copy(m.userData.base);m.rotation.x=0});
  const damp=(first||window.__snap)?1:1-Math.exp(-dt*(ip?60:9));first=false;camPos.lerp(tPos,damp);camLook.lerp(tLook,damp);
  if(window.__cam){camPos.set(...window.__cam.pos);camLook.set(...window.__cam.look)}
  cam.position.copy(camPos);cam.lookAt(camLook);cam.updateProjectionMatrix();
  if(window.__cam)vOff=0;const ox=Math.max(-W,Math.min(W,(W/2-sx)*vOff)),oy=Math.max(-H,Math.min(H,(H/2-sy)*vOff));cam.setViewOffset(W,H,ox,oy,W,H);
  const nb=sm(60,85,camLook.x);hemi.intensity=lerp(.6,.38,nb);key.intensity=lerp(.85,1.35,nb);
  key.position.copy(camLook).add(new V3(lerp(10,-6,nb),lerp(18,26,nb),22));key.target.position.copy(camLook);fillL.position.copy(camLook).add(new V3(-14,4,10));
  // kohout + tok
  leverA+=((flowOn?0:-Math.PI/2)-leverA)*(reduce?1:.12);lever.rotation.z=leverA;
  const speed=reduce?0:(flowOn?.22+Math.min(2.5,Math.abs(window.__scrollVel||0)*.05):0);flowU+=dt*speed;
  flowRuns.forEach(f=>{const sel=!f.tag||f.tag===outlet;f.ph=(f.ph||0)+dt*speed*(sel?1:.0);if(!f.items.length)return;f.items.forEach(g=>{const u=((g.userData.u+f.ph*(2.5/f.len))%1+1)%1;g.position.copy(f.path.getPointAt(u));g.quaternion.setFromUnitVectors(UP,f.path.getTangentAt(u))})});
  // servisní stěna
  for(const id in MANI){const g=MANI[id],on=id===outlet;g.userData.ang+=((on?Math.PI*1.5:0)-g.userData.ang)*.06;if(g.userData.wheel)g.userData.wheel.rotation.z=g.userData.ang;if(g.userData.lever)g.userData.lever.rotation.z=on?0:-Math.PI/2*.98;
    halo[id].material.opacity+=((on?.85:0)-halo[id].material.opacity)*.08;const s=1+Math.sin(T*3)*.08;halo[id].scale.set(s,s,s);halo[id].position.y=-19.6-((T*1.2)%3)}
  gaugeA+=((outlet==='topeni'?1.8:1.2)+Math.sin(T*2.3)*.03-gaugeA)*.05;gaugeNeedle.rotation.z=-(Math.PI*.75+gaugeA/6*Math.PI*1.5)-Math.PI/2;
  // koupelna podle postupu
  updateBath(dt);
  // rentgen
  const lensOn=!coarse&&hasPointer&&!overUI;touchT=Math.max(0,touchT-dt);
  let target=(lensOn?(mobile?120:150):0)*(1-(rp&&rp.flight||0)*.5);if(coarse&&touchT>0)target=110;
  if(ip){const fullK=ip.full;lensFull=fullK;}else lensFull=Math.max(0,lensFull-dt*2);
  lensR+=(target-lensR)*(1-Math.exp(-dt*8));
  lx_+=(mx-lx_)*(1-Math.exp(-dt*14));ly_+=(my-ly_)*(1-Math.exp(-dt*14));
  let lcx=lx_,lcy=ly_,lr=lensR;
  if(ip&&intro.t>3.0){const jp=joint.getWorldPosition(new V3()).project(cam);const jx=(jp.x*.5+.5)*W,jy=(-jp.y*.5+.5)*H;const big=Math.min(W,H)*.36;
    const k=intro.t<4.7?1:1-ease(Math.min(1,(intro.t-4.7)/1.2));lcx=lerp(lx_,jx,k);lcy=lerp(ly_,jy,k);lr=lerp(lensR,big,k)}
  const xrOn=lensFull>.001||lr>1.5;const scr=W<900?0:(ip?0:1);scrimK+=(scr-scrimK)*(1-Math.exp(-dt*2));
  // vykreslení
  cam.layers.set(0);R.setRenderTarget(null);R.render(S,cam);
  if(xrOn){updateParticles();cam.layers.set(XL);S.background=null;const fg=S.fog;S.fog=null;R.setRenderTarget(rtX);R.setClearColor(0x000000,1);R.clear();R.render(S,cam);S.background=BG;S.fog=fg;R.setRenderTarget(null);cam.layers.set(0)}
  if(xrOn||scrimK>.002){ovMat.uniforms.m.value.set(lcx,H-lcy);ovMat.uniforms.r.value=xrOn?lr:0;ovMat.uniforms.full.value=xrOn?lensFull:0;ovMat.uniforms.t.value=T;ovMat.uniforms.scrim.value=scrimK;R.autoClear=false;R.render(ovScene,ovCam);R.autoClear=true}
  // štítky
  const showLab=ip&&intro.t>2.9&&intro.t<5.0;labWrap.classList.toggle('on',!!showLab);
  if(showLab)LBL.forEach(l=>{const p=(l.pos||l.obj.getWorldPosition(tmpP)).clone().project(cam);l.el.style.transform=`translate(${(p.x*.5+.5)*W}px,${(-p.y*.5+.5)*H}px)`;l.el.style.setProperty('--dx',l.dx+'px');l.el.style.setProperty('--dy',l.dy+'px')});
  tag.style.opacity=(!ip&&lr>40)?1:0;tag.style.transform=`translate(${lcx+lr*.72}px,${lcy+lr*.72}px)`;
}
function updateParticles(){const fu=flowOn?flowU:flowU;for(const c in PART){const {im,list}=PART[c];for(let i=0;i<list.length;i++){const q=list[i];const f=q.f;const sp=f.tag&&f.tag!==outlet?0:1;
    const u=((q.u+(f.ph||0)*(2.5/f.len)*1.6)%1+1)%1;tmpP.copy(f.path.getPointAt(u));const tg=f.path.getTangentAt(u);if(f.parent!==world&&f.parent)tmpP.add(f.parent.position);
    tmpQ.setFromUnitVectors(UP,tg);let s=1;if(f.parent===BATH){s=bathP>.48?1:0}tmpS.set(s,s,s);tmpM.compose(tmpP,tmpQ,tmpS);im.setMatrixAt(i,tmpM)}im.instanceMatrix.needsUpdate=true}}
function updateBath(dt){const p=bathP;
  // výkres + laser
  sheet.material.opacity=1-sm(.5,.6,p);sheet.visible=sheet.material.opacity>.01;sheet.position.y=.03+sm(.5,.6,p)*.3;
  const la=sm(.05,.14,p)*(1-sm(.5,.58,p));LASER.forEach(m=>m.material.opacity=la*(.75+Math.sin(T*40)*.05));LASER.tripod.visible=p<.6;LASER.tripod.position.y=-sm(.52,.6,p)*12;
  // trubky rostou
  GROW.forEach(({sg,a,b})=>{const k=sm(a,b,p);const s=Math.max(.0001,k);const m=sg.m;m.scale.y=s;m.position.copy(sg.a).addScaledVector(sg.d,sg.len*s/2);m.visible=k>0;if(sg.el){const e=k>=1?Math.max(.0001,sm(b,b+.01,p)):0.0001;sg.el.scale.setScalar(Math.max(.0001,e));sg.el.visible=e>.001}});
  const fr=sm(.3,.36,p);FRAME.scale.setScalar(Math.max(.0001,fr));FRAME.visible=fr>0;
  // obklady: zdola nahoru, odleva
  const tp=sm(.5,.74,p);const tilesOn=Math.floor(tp*totalT*1.0001);
  FLOORT.forEach((m,i)=>{const k=sm(i/totalT,(i+3)/totalT,tp);m.visible=k>0;m.position.copy(m.userData.home);m.position.y+=(1-ease(k))*3;m.scale.setScalar(Math.max(.0001,lerp(.6,1,ease(k))))});
  TILES.forEach((m,i)=>{const n=i+FLOORT.length;const k=sm(n/totalT,(n+4)/totalT,tp);m.visible=k>0;m.position.copy(m.userData.home);const out=(1-ease(k))*4;
    if(Math.abs(m.rotation.y)>.1)m.position.x+=out;else m.position.z+=out;m.scale.setScalar(Math.max(.0001,lerp(.7,1,ease(k))))});
  // vybavení
  FIX.forEach(g=>{if(!g.userData.home)g.userData.home=g.position.clone();const k=sm(g.userData.t0,g.userData.t0+.06,p);g.visible=k>0;g.position.copy(g.userData.home);g.position.y+=(1-ease(k))*10});
  bathLamp.intensity=sm(.84,.95,p)*1.1;M.led.color.setScalar(.2+.8*sm(.86,.92,p));
  // voda do vany
  const wk=sm(.9,.99,p);water.visible=wk>0;water.position.y=lerp(.5,3.8,wk);stream.visible=wk>0&&wk<1;
  if(stream.visible){const sp=tubMix.position.clone().add(new V3(0,-.5,1.6));const len=sp.y-(FL+water.position.y);stream.scale.y=Math.max(.01,len);stream.position.set(sp.x,sp.y-len/2,sp.z)}
}
requestAnimationFrame(frame);host.classList.add('ready');
})();
