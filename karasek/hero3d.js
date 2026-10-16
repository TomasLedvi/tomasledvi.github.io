/* Karásek a Stülpner – 3D lahve se skutečnými etiketami (Three.js r128) */
(()=>{
const T=THREE,lin=h=>new T.Color(h).convertSRGBToLinear(),cl=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)),ss=t=>{t=cl(t);return t*t*(3-2*t)},L=(a,b,t)=>a+(b-a)*t,eo=t=>1-Math.pow(1-cl(t),3);
const PIVA=window.PIVA;
const hero=document.getElementById("show"),wrap=document.getElementById("s3"),cv=document.getElementById("gl");
const R=new T.WebGLRenderer({canvas:cv,antialias:true,alpha:true});
R.outputEncoding=T.sRGBEncoding;R.toneMapping=T.ACESFilmicToneMapping;R.toneMappingExposure=1.1;R.setClearColor(0,0);
const scene=new T.Scene(),cam=new T.PerspectiveCamera(28,1,.1,100);cam.position.set(0,0,11);
/* prostředí pro odlesky skla: teplé světlo sklepa */
(()=>{const pm=new T.PMREMGenerator(R),es=new T.Scene();
 es.add(new T.Mesh(new T.BoxGeometry(40,40,40),new T.MeshBasicMaterial({color:0x0c0806,side:T.BackSide})));
 const P=(w,h,c,x,y,z)=>{const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:c,side:T.DoubleSide}));m.position.set(x,y,z);m.lookAt(0,0,0);es.add(m)};
 P(12,3,new T.Color(5,4.4,3.6),0,14,3);P(1.4,12,new T.Color(3.6,3.1,2.5),-11,1,4);P(1.1,12,new T.Color(2.4,2,1.6),11,1,-1);P(8,8,new T.Color(1.6,.8,.35),0,0,-15);P(6,1,new T.Color(1.5,1.3,1.1),0,-12,6);
 scene.environment=pm.fromScene(es,.025).texture})();
scene.add(new T.HemisphereLight(0xfff0dc,0x1a0e08,.22));
const key=new T.DirectionalLight(0xfff0dc,1.1);key.position.set(-4,6,7);scene.add(key);
const rimA=new T.DirectionalLight(0xffffff,2.6);rimA.position.set(6,2.5,-5);scene.add(rimA);
const rimB=new T.DirectionalLight(0xffffff,1.6);rimB.position.set(-6,1,-4);scene.add(rimB);

/* ---------- etikety: skutečné obrázky pivovaru ---------- */
const loader=new T.TextureLoader();loader.setCrossOrigin("anonymous");
const IM={};
function labelTex(w){let t;const im=IM[w.img];if(im&&im.complete&&im.naturalWidth){t=new T.Texture(im);t.needsUpdate=true}else t=loader.load(w.img,()=>{t.needsUpdate=true});t.encoding=T.sRGBEncoding;t.anisotropy=R.capabilities.getMaxAnisotropy();return t}

/* ---------- lahev ---------- */
const PROF={beer:{H:3.4,r:.40,lab:[.32,1.56],cap:3.3,p:[[0,0],[.35,0],[.39,.02],[.4,.08],[.4,.5],[.4,1.72],[.394,1.84],[.36,1.98],[.29,2.15],[.215,2.34],[.17,2.55],[.152,2.8],[.148,3.1],[.15,3.22],[.165,3.26],[.165,3.3],[.15,3.34],[.15,3.4]]}};
function smooth(pts,n){const v=pts.map(p=>new T.Vector2(p[0],p[1]));const c=new T.SplineCurve(v);return c.getSpacedPoints(n)}
function rAt(arr,y){for(let i=1;i<arr.length;i++)if(arr[i].y>=y){const a=arr[i-1],b=arr[i],f=(y-a.y)/Math.max(1e-6,b.y-a.y);return L(a.x,b.x,f)}return arr[arr.length-1].x}
const capMat=new T.MeshStandardMaterial({color:lin(0xb88a3a),metalness:.85,roughness:.32,envMapIntensity:1.6});
function crown(r){const g=new T.Group();
 const side=new T.Mesh(new T.CylinderGeometry(r,r*1.06,.13,21,1,true),capMat);side.position.y=.065;g.add(side);
 const top=new T.Mesh(new T.CylinderGeometry(r*.96,r,.025,48),capMat);top.position.y=.14;g.add(top);
 return g}
function makeBottle(w){const P=PROF.beer,pts=smooth(P.p,180);pts[0].x=0;pts.unshift(new T.Vector2(0,0));pts.push(new T.Vector2(0,P.H));
 const g=new T.Group(),m=new T.Group();m.position.y=-P.H/2;g.add(m);g.userData={H:P.H,w};
 const gm=new T.MeshPhysicalMaterial({color:lin(w.glass||0x3a1a06),metalness:0,roughness:.04,reflectivity:.9,clearcoat:1,clearcoatRoughness:.03,envMapIntensity:2.4});
 const body=new T.Mesh(new T.LatheGeometry(pts,96),gm);body.renderOrder=2;m.add(body);
 const cap=crown(rAt(pts,P.cap)+.012);cap.position.y=P.cap-.02;m.add(cap);
 // etiketa: poměr obrázku 190×250, šířka oblouku = výška × 0,76
 const lh=P.lab[1]-P.lab[0],arc=lh*.76/(P.r+.004);
 const lab=new T.Mesh(new T.CylinderGeometry(P.r+.004,P.r+.004,lh,96,1,true,-arc/2,arc),new T.MeshStandardMaterial({map:labelTex(w),roughness:.6,metalness:0,envMapIntensity:.6}));
 lab.position.y=(P.lab[0]+P.lab[1])/2;m.add(lab);g.userData.lab=lab;
 // krční etiketa
 const nl=new T.Mesh(new T.CylinderGeometry(rAt(pts,2.62)+.004,rAt(pts,2.42)+.004,.2,64,1,true),new T.MeshStandardMaterial({color:lin(0x8c2a1c),roughness:.6}));nl.position.y=2.52;m.add(nl);
 g.userData.cap=cap;g.userData.top=P.H/2;return g}

const bottles=PIVA.slice(0,4).map(makeBottle);bottles.forEach(b=>scene.add(b));

/* ---------- chmelové hlávky, listy, korunka ---------- */
const NG=56,hopGeo=(()=>{const g=new T.IcosahedronGeometry(1,1);g.scale(1,1.45,1);return g})();
const hopMat=new T.MeshStandardMaterial({color:lin(0x9db35a),roughness:.55,metalness:0,flatShading:true,envMapIntensity:.9});
const hops=new T.InstancedMesh(hopGeo,hopMat,NG);scene.add(hops);hops.visible=false;
const rnd=(a,b)=>a+Math.random()*(b-a),GD=[...Array(NG)].map(()=>{const th=rnd(0,Math.PI*2),rr=rnd(1.25,2.9);let x=Math.cos(th)*rr*1.35,y=Math.sin(th)*rr*.85+.15;if(Math.abs(x)<.75)x=Math.sign(x||1)*rnd(.75,1.1);
 return{s:[rnd(-.15,.15),rnd(.4,1.1),rnd(-.6,-.3)],e:[x,y,rnd(-1.4,1.1)],sc:rnd(.1,.15),d:rnd(0,.25),ph:rnd(0,6),sp:rnd(.4,1)}});
const leafTex=(()=>{const c=document.createElement("canvas");c.width=c.height=512;const x=c.getContext("2d");const g=x.createRadialGradient(256,300,20,256,256,300);g.addColorStop(0,"#6f9a3c");g.addColorStop(1,"#35591d");x.fillStyle=g;x.fillRect(0,0,512,512);
 x.strokeStyle="rgba(214,232,160,.5)";x.lineCap="round";for(let k=0;k<3;k++){const a=-Math.PI/2+(k-1)*.95;x.lineWidth=7;x.beginPath();x.moveTo(256,330);const ex=256+Math.cos(a)*230,ey=330+Math.sin(a)*230;x.quadraticCurveTo(256+Math.cos(a)*120+10,330+Math.sin(a)*120,ex,ey);x.stroke()}
 const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;return t})();
const leafGeo=(()=>{const s=new T.Shape();for(let i=0;i<=240;i++){const a=i/240*Math.PI*2,b=a+Math.PI/2,r=.5+.16*Math.cos(3*b)+.03*Math.cos(36*b)-.18*Math.pow(Math.max(0,Math.cos(a+Math.PI/2)),18);const x=Math.cos(a)*r,y=Math.sin(a)*r;i?s.lineTo(x,y):s.moveTo(x,y)}
 const g=new T.ShapeGeometry(s,24),p=g.attributes.position,uv=g.attributes.uv;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i);uv.setXY(i,(x+.66)/1.32,(y+.66)/1.32);p.setZ(i,-(x*x)*.35-(y*y)*.12)}g.computeVertexNormals();return g})();
const leafMat=new T.MeshStandardMaterial({map:leafTex,roughness:.55,metalness:0,side:T.DoubleSide,envMapIntensity:.8});
const LD=[[-2.2,1.7,-.6,.4],[2.4,1.3,-1,-.6],[-2.6,-1.1,-.3,2.6],[2.1,-1.5,.2,-2.4],[-1.0,2.3,-1.3,.1],[1.3,-2.2,-1.1,3]].map(([x,y,z,r])=>{const m=new T.Mesh(leafGeo,leafMat);m.visible=false;scene.add(m);return{m,e:[x,y,z],r,d:rnd(0,.2),ph:rnd(0,6)}});
const flyCap=crown(.165);flyCap.visible=false;scene.add(flyCap);

/* ---------- velikost ---------- */
let W=1,H=1,vh=1,vw=1,mob=false;
function size(){W=wrap.clientWidth;H=wrap.clientHeight;R.setPixelRatio(Math.min(devicePixelRatio||1,1.75));R.setSize(W,H,false);cam.aspect=W/H;cam.updateProjectionMatrix();
 vh=2*cam.position.z*Math.tan(T.MathUtils.degToRad(cam.fov/2));vw=vh*cam.aspect;mob=cam.aspect<.85}
addEventListener("resize",size);size();

/* ---------- režie scrollu ---------- */
const A=[.2,.34,.48,.62],D=.14,glows=["#2a1a10",...PIVA.slice(0,4).map(w=>w.glow)];
const hexc=h=>new T.Color(h),cA=new T.Color(),panels=[...document.querySelectorAll(".wp")],intro=document.getElementById("i3"),big=document.getElementById("big"),out=document.getElementById("o3"),ticks=[...document.querySelectorAll(".rail i")];
let tgt=0,sm=0;
function prog(){const r=hero.getBoundingClientRect();tgt=cl(-r.top/Math.max(1,r.height-innerHeight))}
addEventListener("scroll",prog,{passive:true});prog();
function setB(b,s){b.position.set(s.x,s.y,s.z||0);b.scale.setScalar(s.s);b.rotation.set(s.rx||0,s.ry||0,s.rz||0)}
function mixS(a,b,t){return{x:L(a.x,b.x,t),y:L(a.y,b.y,t),z:L(a.z||0,b.z||0,t),s:L(a.s,b.s,t),rx:L(a.rx||0,b.rx||0,t),ry:L(a.ry||0,b.ry||0,t),rz:L(a.rz||0,b.rz||0,t)}}
function glowAt(p){if(p<.16)return[0,0];if(p<.2)return[0,1,ss((p-.16)/.04)];for(let i=0;i<4;i++){const b=A[i]+D;if(p<b-.02||i===3)return[i+1,i+1]; if(p<b+.02)return[i+1,i+2,ss((p-(b-.02))/.04)]}return[4,4]}
function frame(t){
 const p=sm,F=mob?{x:0,y:vh*.17,s:.74}:{x:vw*.16,y:-.02,s:1.02},C=mob?{x:0,y:-vh*.03,s:.56}:{x:0,y:.28,s:.86};
 const sp=Math.min(1.85,vw/4.3),lsc=mob?Math.min(.56,vw/4.6/.9):.64;
 bottles.forEach((b,i)=>{
  const Lp={x:(i-1.5)*sp,y:(mob?vh*.12:.62)+Math.sin(t*.0012+i*1.7)*.06,s:lsc,ry:(i-1.5)*-.22+Math.sin(t*.0007+i)*.18,rz:(i-1.5)*-.03};
  const a=A[i],e0=a-.035,E={x:F.x+vw*.42,y:F.y-vh*.95,s:F.s,ry:-4.4,rz:-.5},S0={...F,ry:-.6};
  let s,vis=true;
  if(i===0){const u=ss((p-.1)/.1);s=mixS(Lp,S0,u);s.ry=L(Lp.ry,-.6,u)-Math.sin(u*Math.PI)*.9}
  else{const ou=ss((p-.08-i*.012)/.08);const Ex={x:Lp.x+i*.25,y:-vh*.9,s:lsc,ry:Lp.ry+2.2,rz:.3};s=mixS(Lp,Ex,ou);if(p>.17){s=E;vis=p>e0-.005}
   if(p>e0){s=mixS(E,S0,eo((p-e0)/.06))}}
  if(p>=a){const lo=cl((p-a)/D);s={...F,ry:L(-.6,.6,lo)};}
  if(i<3){const x0=a+D-.03;if(p>x0){const u=ss((p-x0)/.05);s=mixS({...F,ry:.6},{x:F.x-vw*.32,y:F.y+vh*.95,s:F.s,ry:4.6,rz:.45},u);if(u>=1)vis=false}}
  else if(p>.76){const u=ss((p-.76)/.06);s=mixS({...F,ry:.6},C,u);s.ry=L(.6,Math.PI*2,u)+Math.sin(t*.0005)*.12+ss((p-.86)/.14)*.4}
  if(i===3&&p>=a&&p<=.76)s.ry=L(-.6,.6,cl((p-a)/D));
  s.y+=(p>.2?Math.sin(t*.0011+i)*.035:0);
  setB(b,s);b.visible=vis;b.userData.cap.visible=!(i===3&&p>.79)});
 const [ga,gb,gf=0]=glowAt(p);cA.copy(hexc(glows[ga])).lerp(hexc(glows[gb]),gf);
 rimA.color.copy(cA).lerp(new T.Color(1,1,1),.3);rimB.color.copy(cA);
 wrap.style.setProperty("--g","#"+cA.getHexString());
 // chmel a korunka vyletí z poslední lahve
 const q=cl((p-.785)/.15),on=p>.78;hops.visible=on;flyCap.visible=on;
 if(on){const b=bottles[3],bs=b.scale.x,bx=b.position.x,by=b.position.y,mx=new T.Matrix4(),qq=new T.Quaternion(),eu=new T.Euler(),v=new T.Vector3(),sc=new T.Vector3();
  const spread=mob?.55:1;
  GD.forEach((g,i)=>{const k=eo((q-g.d)/(1-g.d)*1.15),dr=Math.sin(t*.0009*g.sp+g.ph)*.06*k;
   v.set(bx+L(g.s[0],g.e[0]*spread,k)*bs,by+L(g.s[1],g.e[1]*(mob?.75:1),k)*bs+dr,L(g.s[2],g.e[2],k));eu.set(g.ph+t*.0003*g.sp,g.ph*2,0);qq.setFromEuler(eu);
   const r=g.sc*bs*(.3+.7*k);sc.set(r,r,r);mx.compose(v,qq,sc);hops.setMatrixAt(i,mx)});hops.instanceMatrix.needsUpdate=true;
  const ck=eo(q/.45),top=by+b.userData.top*bs;flyCap.position.set(bx+L(0,(mob?.5:.75)*spread,ck),L(top-.1,top+(mob?.55:.45),ck)+Math.sin(t*.001)*.04*ck,L(0,.4,ck));flyCap.rotation.set(ck*2.6,t*.0004,ck*-1.3);flyCap.scale.setScalar(bs*1.6);
  LD.forEach(l=>{const k=eo((q-l.d)/(1-l.d)*1.1);l.m.visible=k>.01;l.m.position.set(bx+l.e[0]*k*spread*bs,by+l.e[1]*k*(mob?.8:1)*bs+Math.sin(t*.0008+l.ph)*.06,l.e[2]);l.m.rotation.set(.5+Math.sin(t*.0006+l.ph)*.15,l.r*.4+Math.sin(t*.0005+l.ph)*.2,l.r+(1-k)*2);l.m.scale.setScalar(Math.max(.001,k)*(mob?.62:.9))})}
 else LD.forEach(l=>l.m.visible=false);
 intro.style.opacity=1-ss((p-.04)/.06);intro.style.transform=`translateY(${-ss((p-.04)/.08)*40}px)`;intro.style.pointerEvents=p<.06?"auto":"none";
 panels.forEach((el,i)=>{const a=A[i],v=ss((p-(a-.005))/.03)*(1-ss((p-(a+D-.035))/.03));el.style.opacity=v;el.style.transform=`translateY(${(1-v)*30}px)`;el.style.pointerEvents=v>.5?"auto":"none"});
 const bv=ss((p-.79)/.07);big.style.opacity=bv;big.style.transform=`translate(-50%,-50%) scale(${.86+bv*.14})`;out.style.opacity=ss((p-.86)/.06);out.style.pointerEvents=p>.88?"auto":"none";
 ticks.forEach((k,i)=>k.classList.toggle("on",p>=A[i]-.01&&(i===3?p<.8:p<A[i]+D-.01)));
 R.render(scene,cam)}
let last=performance.now();
(function tick(t){const dt=Math.min(64,t-last);last=t;sm+=(tgt-sm)*(1-Math.pow(.88,dt/16.7));if(Math.abs(tgt-sm)<.0002)sm=tgt;
 const r=hero.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight)frame(t);requestAnimationFrame(tick)})(last);

/* náhledy lahví pro basu */
window.renderThumbs=function(){const outp=[],ts=new T.Scene();ts.environment=scene.environment;ts.add(new T.HemisphereLight(0xffffff,0x332222,.6));const k2=new T.DirectionalLight(0xffffff,1.4);k2.position.set(-3,5,6);ts.add(k2);const r2=new T.DirectionalLight(0xffe6c8,1.6);r2.position.set(5,2,-4);ts.add(r2);
 const tc=new T.PerspectiveCamera(20,.36,.1,50);tc.position.set(0,0,11.2);const pw=R.getPixelRatio();R.setPixelRatio(1);R.setSize(216,600,false);
 PIVA.forEach(w=>{const b=makeBottle(w);b.rotation.y=0;ts.add(b);R.render(ts,tc);outp.push(cv.toDataURL("image/png"));ts.remove(b)});
 R.setPixelRatio(pw);size();return outp};
/* náhledy počkají, až se načtou etikety */
let pend=PIVA.length;PIVA.forEach(w=>{const im=new Image();im.crossOrigin="anonymous";IM[w.img]=im;im.onload=im.onerror=()=>{if(--pend===0)window.dispatchEvent(new Event("piva-ready"))};im.src=w.img});
})();
