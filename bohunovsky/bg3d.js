/* Realistické pozadí: obkladová stěna + rozvody (měď, bronzové lisovací tvarovky, objímky, kulový kohout, plyn).
   Kurzor/prst = baterka (SpotLight), scroll = kamera sjíždí po zdi, klik na kohout = zastaví/pustí vodu. */
(function(){
const host=document.getElementById('bg3d'); if(!host||!window.THREE) return;
let ok=false; try{ok=!!document.createElement('canvas').getContext('webgl')}catch(e){} if(!ok){host.classList.add('nogl');return;}
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile=matchMedia('(max-width: 820px)').matches;
const R=new THREE.WebGLRenderer({antialias:!mobile,powerPreference:'high-performance'});
R.setPixelRatio(Math.min(mobile?1.5:2,window.devicePixelRatio||1));
R.outputEncoding=THREE.sRGBEncoding;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.0;
R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;
host.appendChild(R.domElement);
const S=new THREE.Scene();S.background=new THREE.Color(0xdfe5e7);
const cam=new THREE.PerspectiveCamera(34,1,.1,200);

/* ---------- procedurální textury */
function canvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return [c,c.getContext('2d')]}
function rnd(seed){let s=seed;return()=>{s=(s*16807)%2147483647;return s/2147483647}}
function heightToNormal(srcCanvas,strength){const w=srcCanvas.width,h=srcCanvas.height;const sx=srcCanvas.getContext('2d').getImageData(0,0,w,h).data;
  const [c,x]=canvas(w,h);const out=x.createImageData(w,h);const H=(i,j)=>sx[(((j+h)%h)*w+((i+w)%w))*4]/255;
  for(let j=0;j<h;j++)for(let i=0;i<w;i++){const dx=(H(i+1,j)-H(i-1,j))*strength,dy=(H(i,j+1)-H(i,j-1))*strength;
    const l=Math.hypot(dx,dy,1),k=(j*w+i)*4;out.data[k]=(-dx/l*.5+.5)*255;out.data[k+1]=(dy/l*.5+.5)*255;out.data[k+2]=(1/l*.5+.5)*255;out.data[k+3]=255}
  x.putImageData(out,0,0);return c}
// obklad: 8x8 dlaždic na texturu, spára 4px, mírné odchylky barvy a "duhování" glazury
const T=mobile?512:1024, cell=T/8, gr=Math.max(3,T/256);
const [tc,tx]=canvas(T,T),[th,thx]=canvas(T,T),[trc,trx]=canvas(T,T);
const r1=rnd(7);
tx.fillStyle='#b9c1c3';tx.fillRect(0,0,T,T);thx.fillStyle='#000';thx.fillRect(0,0,T,T);trx.fillStyle='#cfcfcf';trx.fillRect(0,0,T,T);
for(let j=0;j<8;j++)for(let i=0;i<8;i++){const x0=i*cell+gr/2,y0=j*cell+gr/2,s=cell-gr;const v=235+Math.floor(r1()*10);
  const g=tx.createLinearGradient(x0,y0,x0+s,y0+s);g.addColorStop(0,`rgb(${v},${v+3},${v+4})`);g.addColorStop(1,`rgb(${v-6},${v-3},${v-2})`);
  tx.fillStyle=g;tx.fillRect(x0,y0,s,s);
  const hg=thx.createRadialGradient(x0+s/2,y0+s/2,s*.2,x0+s/2,y0+s/2,s*.75);hg.addColorStop(0,'#fff');hg.addColorStop(1,'#e8e8e8');thx.fillStyle=hg;
  thx.beginPath();thx.roundRect(x0+1,y0+1,s-2,s-2,gr*1.2);thx.fill();
  trx.fillStyle='#1a1a1a';trx.beginPath();trx.roundRect(x0,y0,s,s,gr);trx.fill();}
const tileMap=new THREE.CanvasTexture(tc);tileMap.encoding=THREE.sRGBEncoding;
const tileNorm=new THREE.CanvasTexture(heightToNormal(th,mobile?2:3));const tileRough=new THREE.CanvasTexture(trc);
[tileMap,tileNorm,tileRough].forEach(t=>{t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=R.capabilities.getMaxAnisotropy();});
// měď: podélné stopy po broušení + jemná patina
const [cc,cx]=canvas(512,128),[cr,crx]=canvas(512,128);const r2=rnd(3);
cx.fillStyle='#c27a46';cx.fillRect(0,0,512,128);crx.fillStyle='#5a5a5a';crx.fillRect(0,0,512,128);
for(let i=0;i<900;i++){const y=r2()*128,l=40+r2()*260,x=r2()*512,a=.04+r2()*.08;cx.strokeStyle=r2()<.5?`rgba(255,214,170,${a})`:`rgba(90,40,15,${a})`;cx.lineWidth=.6+r2();cx.beginPath();cx.moveTo(x,y);cx.lineTo(x+l,y);cx.stroke();
  crx.strokeStyle=`rgba(${r2()<.5?140:40},${r2()<.5?140:40},${r2()<.5?140:40},.25)`;crx.beginPath();crx.moveTo(x,y);crx.lineTo(x+l,y);crx.stroke();}
for(let i=0;i<26;i++){const x=r2()*512,y=r2()*128,rr=6+r2()*26;const g=cx.createRadialGradient(x,y,0,x,y,rr);g.addColorStop(0,'rgba(120,58,30,.32)');g.addColorStop(1,'rgba(120,58,30,0)');cx.fillStyle=g;cx.fillRect(x-rr,y-rr,rr*2,rr*2);
  const g2=crx.createRadialGradient(x,y,0,x,y,rr);g2.addColorStop(0,'rgba(200,200,200,.4)');g2.addColorStop(1,'rgba(200,200,200,0)');crx.fillStyle=g2;crx.fillRect(x-rr,y-rr,rr*2,rr*2);}
const cuMap=new THREE.CanvasTexture(cc);cuMap.encoding=THREE.sRGBEncoding;const cuRough=new THREE.CanvasTexture(cr);
[cuMap,cuRough].forEach(t=>{t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8});

/* ---------- prostředí pro odlesky kovu */
const envS=new THREE.Scene();envS.background=new THREE.Color(0x2f2b28);
[[0xffffff,2.2,[0,7,3],[9,2.5]],[0xffd8b5,1.2,[-7,1,2],[2,7]],[0xcfe3ef,1.1,[7,0,3],[2,6]],[0xffffff,.6,[0,-1,8],[10,3]]].forEach(([c,i,p,s])=>{
  const m=new THREE.Mesh(new THREE.PlaneGeometry(s[0],s[1]),new THREE.MeshBasicMaterial({color:new THREE.Color(c).multiplyScalar(i),side:THREE.DoubleSide}));m.position.set(...p);m.lookAt(0,0,0);envS.add(m)});
const pm=new THREE.PMREMGenerator(R);S.environment=pm.fromScene(envS,.03).texture;

/* ---------- materiály */
const M={
  tile:new THREE.MeshPhysicalMaterial({map:tileMap,normalMap:tileNorm,roughnessMap:tileRough,roughness:1,metalness:0,clearcoat:.85,clearcoatRoughness:.08,envMapIntensity:.4}),
  cu:new THREE.MeshPhysicalMaterial({color:0xffffff,map:cuMap,roughnessMap:cuRough,roughness:.62,metalness:1,clearcoat:.15,clearcoatRoughness:.4,envMapIntensity:1}),
  bronze:new THREE.MeshPhysicalMaterial({color:0x9a6a28,metalness:1,roughness:.36,envMapIntensity:.75}),
  bead:new THREE.MeshPhysicalMaterial({color:0x8f6526,metalness:1,roughness:.45}),
  steel:new THREE.MeshPhysicalMaterial({color:0xaeb6ba,metalness:1,roughness:.38}),
  rubber:new THREE.MeshStandardMaterial({color:0x222426,roughness:.9}),
  gas:new THREE.MeshPhysicalMaterial({color:0xcf9300,metalness:.05,roughness:.5,clearcoat:.5,clearcoatRoughness:.3,envMapIntensity:.6}),
  red:new THREE.MeshPhysicalMaterial({color:0xc11f1f,roughness:.35,clearcoat:.9}),
  blueTape:new THREE.MeshStandardMaterial({color:0x1667b8,roughness:.6}),
  redTape:new THREE.MeshStandardMaterial({color:0xc4271d,roughness:.6}),
};

/* ---------- stěna */
const WALL_W=40,WALL_H=90,TILE=.66;
const wall=new THREE.Mesh(new THREE.PlaneGeometry(WALL_W,WALL_H),M.tile);wall.position.set(0,-WALL_H/2+8,0);wall.receiveShadow=true;
[tileMap,tileNorm,tileRough].forEach(t=>t.repeat.set(WALL_W/(TILE*8),WALL_H/(TILE*8)));S.add(wall);

/* ---------- rozvody */
const R0=.11; // poloměr trubky (cca Cu 22 v měřítku scény)
const group=new THREE.Group();S.add(group);
const flowRuns=[];
function straight(a,b,mat,r,tape){const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b);const len=A.distanceTo(B);if(len<.01)return;
  const g=new THREE.CylinderGeometry(r,r,len,28,1,true);const m=new THREE.Mesh(g,mat);m.position.copy(A).add(B).multiplyScalar(.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),B.clone().sub(A).normalize());m.castShadow=true;group.add(m);
  if(mat===M.cu){m.material=M.cu.clone();m.material.map=cuMap.clone();m.material.map.needsUpdate=true;m.material.map.center.set(.5,.5);m.material.map.rotation=Math.PI/2;m.material.map.repeat.set(len*.7,1);m.material.map.offset.set(Math.random(),Math.random());
    m.material.roughnessMap=m.material.map===cuMap?cuRough:cuRough;}
  return {A,B,len};}
function pressRing(pos,dir,r){const t=new THREE.Mesh(new THREE.TorusGeometry(r*1.32,r*.16,10,32),M.bead);t.position.copy(pos);t.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),dir);t.castShadow=true;group.add(t)}
function elbow(corner,dIn,dOut,r){ // 90° lisovací koleno: oblouk + 2 límce s prstenci
  const C=new THREE.Vector3(...corner),rad=r*2.6;const a=C.clone().sub(dIn.clone().multiplyScalar(rad)),b=C.clone().add(dOut.clone().multiplyScalar(rad));
  const curve=new THREE.QuadraticBezierCurve3(a,C,b);const m=new THREE.Mesh(new THREE.TubeGeometry(curve,20,r*1.18,28,false),M.bronze);m.castShadow=true;group.add(m);
  [[a,dIn],[b,dOut]].forEach(([p,d])=>{const collar=new THREE.Mesh(new THREE.CylinderGeometry(r*1.28,r*1.28,r*1.6,28),M.bronze);collar.position.copy(p).sub(d.clone().multiplyScalar(r*.8*(p===a?1:-1)));
    collar.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d);collar.castShadow=true;group.add(collar);pressRing(p.clone().sub(d.clone().multiplyScalar(r*1.3*(p===a?1:-1))),d,r)});
  return rad;}
function clamp(pos,dir,r){ // objímka se šroubem do zdi
  const ring=new THREE.Mesh(new THREE.TorusGeometry(r*1.25,r*.22,10,28),M.steel);ring.position.copy(pos);ring.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),dir);ring.castShadow=true;group.add(ring);
  const rub=new THREE.Mesh(new THREE.TorusGeometry(r*1.06,r*.12,8,28),M.rubber);rub.position.copy(pos);rub.quaternion.copy(ring.quaternion);group.add(rub);
  const rod=new THREE.Mesh(new THREE.CylinderGeometry(r*.22,r*.22,pos.z,10),M.steel);rod.rotation.x=Math.PI/2;rod.position.set(pos.x,pos.y,pos.z/2);rod.castShadow=true;group.add(rod);
  const base=new THREE.Mesh(new THREE.CylinderGeometry(r*.75,r*.75,.04,18),M.steel);base.rotation.x=Math.PI/2;base.position.set(pos.x,pos.y,.02);group.add(base);}
// trasa = pravoúhlá lomená čára; z je odstup od zdi
function route(pts,{mat=M.cu,r=R0,flow=null,clampEvery=2.4}={}){
  const V=pts.map(p=>new THREE.Vector3(...p));const segs=[];
  for(let i=0;i<V.length-1;i++){const a=V[i],b=V[i+1];const d=b.clone().sub(a).normalize();
    let sa=a.clone(),sb=b.clone();
    if(i>0){const dPrev=a.clone().sub(V[i-1]).normalize();sa.add(d.clone().multiplyScalar(r*2.6));}
    if(i<V.length-2){const dNext=V[i+2].clone().sub(b).normalize();sb.sub(d.clone().multiplyScalar(r*2.6));elbow(b.toArray(),d,dNext,r);}
    straight(sa.toArray(),sb.toArray(),mat,r);segs.push([sa,sb,d]);
    const L=sa.distanceTo(sb);for(let k=clampEvery*.5;k<L-.3;k+=clampEvery)clamp(sa.clone().add(d.clone().multiplyScalar(k)),d,r);}
  if(flow){const path=new THREE.CurvePath();segs.forEach(([a,b])=>path.add(new THREE.LineCurve3(a,b)));flowRuns.push({path,len:path.getLength(),tape:flow,items:[]});}
  return segs;}
// dvě stoupačky vlevo (studená/teplá), dvě vpravo + rozbočení; zóna hrdiny je vpravo nahoře
const Zc=.32,Zh=.62,Zg=.42;
route([[-7.4,9,Zc],[-7.4,-70,Zc]],{flow:'blue'});
route([[-6.7,9,Zh],[-6.7,-1.2,Zh],[-5.2,-1.2,Zh],[-5.2,-70,Zh]],{flow:'red'});
route([[ 9,3.2,Zc],[3.2,3.2,Zc],[3.2,.6,Zc],[6.6,.6,Zc],[6.6,-70,Zc]],{flow:'blue'});
route([[ 9,2.3,Zh],[4.2,2.3,Zh],[4.2,-1.6,Zh],[7.4,-1.6,Zh],[7.4,-70,Zh]],{flow:'red'});
route([[2.0,9,Zg],[2.0,.9,Zg],[1.0,.9,Zg],[1.0,-2.6,Zg],[5.6,-2.6,Zg],[5.6,-70,Zg]],{mat:M.gas,r:R0*1.05,clampEvery:2.8});
// odbočky k "zařizovacím předmětům" níž na stránce
[-14,-27,-41,-55].forEach((y,i)=>{const s=i%2?-1:1;
  route([[s*(s>0?6.6:7.4),y,Zc],[s*3.4,y,Zc],[s*3.4,y-1.4,Zc]].map(p=>[p[0],p[1],p[2]]),{});
  route([[s*(s>0?7.4:5.2),y-.5,Zh],[s*3.9,y-.5,Zh],[s*3.9,y-1.4,Zh]],{});
  // kohout na konci odbočky
  const vb=new THREE.Mesh(new THREE.SphereGeometry(R0*1.9,24,16),M.bronze);vb.position.set(s*3.4,y-1.6,Zc);vb.castShadow=true;group.add(vb);
});
// kulový kohout v hrdinské zóně (interaktivní)
const valve=new THREE.Group();valve.position.set(3.2,1.9,Zc);group.add(valve);
const vBody=new THREE.Mesh(new THREE.SphereGeometry(R0*2.1,32,20),M.bronze);vBody.scale.set(1,1.25,1);vBody.castShadow=true;valve.add(vBody);
[-1,1].forEach(s=>{const hex=new THREE.Mesh(new THREE.CylinderGeometry(R0*1.75,R0*1.75,R0*1.1,6),M.bronze);hex.position.y=s*R0*2.6;hex.castShadow=true;valve.add(hex)});
const stem=new THREE.Mesh(new THREE.CylinderGeometry(R0*.35,R0*.35,R0*1.6,12),M.steel);stem.rotation.x=Math.PI/2;stem.position.z=R0*2.4;valve.add(stem);
const lever=new THREE.Group();lever.position.z=R0*3.2;valve.add(lever);
const lv=new THREE.Mesh(new THREE.BoxGeometry(R0*1.1,R0*7.5,R0*.5),M.red);lv.position.y=R0*3.2;lv.castShadow=true;lever.add(lv);
const nut=new THREE.Mesh(new THREE.CylinderGeometry(R0*.55,R0*.55,R0*.5,6),M.steel);nut.rotation.x=Math.PI/2;nut.position.z=R0*.3;lever.add(nut);
// šipky směru toku (značkovací páska)
const tapeGeo=new THREE.CylinderGeometry(R0*1.03,R0*1.03,R0*2.4,28,1,true);const arrowGeo=new THREE.ConeGeometry(R0*.5,R0*.9,3);
flowRuns.forEach(f=>{const n=Math.max(2,Math.round(f.len/3.1));for(let i=0;i<n;i++){const g=new THREE.Group();const mat=f.tape==='blue'?M.blueTape:M.redTape;
  g.add(new THREE.Mesh(tapeGeo,mat));const ar=new THREE.Mesh(arrowGeo,new THREE.MeshStandardMaterial({color:0xffffff,roughness:.6}));ar.position.z=R0*1.04;ar.rotation.x=0;g.add(ar);
  g.userData.u=i/n;group.add(g);f.items.push(g)}});

/* ---------- světla */
S.add(new THREE.HemisphereLight(0xffffff,0xb7c3c8,.22));
const key=new THREE.DirectionalLight(0xfff4ea,.55);key.position.set(5,8,9);key.castShadow=true;key.shadow.mapSize.set(mobile?1024:2048,mobile?1024:2048);
Object.assign(key.shadow.camera,{left:-12,right:12,top:8,bottom:-8,near:1,far:40});key.shadow.radius=4;key.shadow.bias=-.0004;S.add(key);S.add(key.target);
const torch=new THREE.SpotLight(0xfff1e0,mobile?3.2:4.2,28,.36,.65,1.1);torch.position.set(2,2,7);torch.castShadow=!mobile;torch.shadow.mapSize.set(1024,1024);torch.shadow.bias=-.0005;S.add(torch);S.add(torch.target);

/* ---------- velikost, ovládání */
let W=1,H=1;function size(){W=host.clientWidth;H=host.clientHeight;R.setSize(W,H,false);cam.aspect=W/H;
  cam.fov=W<700?44:34;cam.updateProjectionMatrix()}
size();addEventListener('resize',size);
let px=.62,py=.35,tx_=.62,ty_=.35,pointerActive=false;
const setP=(x,y)=>{tx_=x/innerWidth;ty_=y/innerHeight;pointerActive=true};
addEventListener('pointermove',e=>setP(e.clientX,e.clientY),{passive:true});
addEventListener('touchmove',e=>{const t=e.touches[0];if(t)setP(t.clientX,t.clientY)},{passive:true});
let flowOn=true,leverA=0;
const ray=new THREE.Raycaster(),v2=new THREE.Vector2();
function tryValve(cx,cy){v2.set(cx/innerWidth*2-1,-(cy/innerHeight)*2+1);ray.setFromCamera(v2,cam);const hit=ray.intersectObjects(valve.children,true);if(hit.length){flowOn=!flowOn;document.dispatchEvent(new CustomEvent('valve',{detail:flowOn}));return true}return false}
addEventListener('click',e=>{if(e.target.closest('a,button,input,textarea,label,.valve'))return;tryValve(e.clientX,e.clientY)});
window.__bgValveScreen=()=>{const p=valve.getWorldPosition(new THREE.Vector3()).project(cam);return {x:(p.x*.5+.5)*innerWidth,y:(-p.y*.5+.5)*innerHeight,vis:p.z<1}};
let visible=true;document.addEventListener('visibilitychange',()=>visible=!document.hidden);
const UP=new THREE.Vector3(0,1,0);let last=performance.now(),flowU=0,t=0,heroGlow=1;
function frame(now){requestAnimationFrame(frame);if(!visible)return;const dt=Math.min(.05,(now-last)/1000);last=now;t+=dt;
  const sy=window.scrollY||0,vh=innerHeight;
  // kamera: pomalejší než obsah (paralaxa), mírný náklon podle kurzoru
  const worldPerPx=(2*10*Math.tan(cam.fov*Math.PI/360))/vh;const camY=-sy*worldPerPx*.62+1.25;
  if(!pointerActive){tx_=.62+Math.sin(t*.35)*.12;ty_=.32+Math.cos(t*.27)*.08}
  px+=(tx_-px)*.08;py+=(ty_-py)*.08;
  const bx=W<700?2.7:0;cam.position.set(bx+(px-.5)*.8,camY-(py-.5)*.5,10);cam.lookAt(bx+(px-.5)*.3,camY,0);
  // baterka míří na místo pod kurzorem na zdi
  const hx=(W<700?2.7:0)+(px*2-1)*Math.tan(cam.fov*Math.PI/360)*10*cam.aspect, hy=camY+(1-py*2)*Math.tan(cam.fov*Math.PI/360)*10;
  torch.position.set(hx*.6,hy+1.2,7.2);torch.target.position.set(hx,hy,0);
  key.position.set(5,camY+8,9);key.target.position.set(0,camY,0);
  // kohout + tok
  leverA+=((flowOn?0:-Math.PI/2)-leverA)*(reduce?1:.12);lever.rotation.z=leverA;
  const speed=reduce?0:(flowOn?.22+Math.min(2.5,Math.abs(window.__scrollVel||0)*.05):0);flowU+=dt*speed;
  flowRuns.forEach(f=>f.items.forEach(g=>{const u=((g.userData.u+flowU*(2.5/f.len))%1+1)%1;g.position.copy(f.path.getPointAt(u));g.quaternion.setFromUnitVectors(UP,f.path.getTangentAt(u))}));
  R.render(S,cam);}
requestAnimationFrame(frame);
host.classList.add('ready');
})();
