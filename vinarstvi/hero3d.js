/* Rodinné vinařství – 3D lahve (Three.js r128) */
(()=>{
const T=THREE,lin=h=>new T.Color(h).convertSRGBToLinear(),cl=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)),ss=t=>{t=cl(t);return t*t*(3-2*t)},L=(a,b,t)=>a+(b-a)*t,eo=t=>1-Math.pow(1-cl(t),3);
const VINO=window.VINO;
const hero=document.getElementById("show"),wrap=document.getElementById("s3"),cv=document.getElementById("gl");
const R=new T.WebGLRenderer({canvas:cv,antialias:true,alpha:true});
R.outputEncoding=T.sRGBEncoding;R.toneMapping=T.ACESFilmicToneMapping;R.toneMappingExposure=1.05;R.setClearColor(0,0);
const scene=new T.Scene(),cam=new T.PerspectiveCamera(28,1,.1,100);cam.position.set(0,0,11);
/* prostředí pro odlesky skla */
(()=>{const pm=new T.PMREMGenerator(R),es=new T.Scene();
 es.add(new T.Mesh(new T.BoxGeometry(40,40,40),new T.MeshBasicMaterial({color:0x0b0807,side:T.BackSide})));
 const P=(w,h,c,x,y,z)=>{const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:c,side:T.DoubleSide}));m.position.set(x,y,z);m.lookAt(0,0,0);es.add(m)};
 P(12,3,new T.Color(5,4.7,4.3),0,14,3);P(1.4,12,new T.Color(3.4,3.2,3),-11,1,4);P(1.1,12,new T.Color(2.2,2,1.9),11,1,-1);P(8,8,new T.Color(1.3,.7,.45),0,0,-15);P(6,1,new T.Color(1.5,1.4,1.3),0,-12,6);
 scene.environment=pm.fromScene(es,.025).texture})();
scene.add(new T.HemisphereLight(0xfff2e6,0x1a0d0a,.14));
const key=new T.DirectionalLight(0xfff1e0,.8);key.position.set(-4,6,7);scene.add(key);
const rimA=new T.DirectionalLight(0xffffff,2.6);rimA.position.set(6,2.5,-5);scene.add(rimA);
const rimB=new T.DirectionalLight(0xffffff,1.6);rimB.position.set(-6,1,-4);scene.add(rimB);

/* ---------- etikety ---------- */
const TH={cream:{bg:"#efe5d2",ink:"#2b1b18",acc:"#7e1f30",gold:"#a8834a",dot:"0,0,0"},white:{bg:"#fbf7f4",ink:"#3a2225",acc:"#c24d68",gold:"#b48c64",dot:"0,0,0"},black:{bg:"#151113",ink:"#f1e4c9",acc:"#d9b46c",gold:"#c9a35e",dot:"255,255,255"}};
function spaced(x,s,X,Y,sp){const w=[...s].reduce((a,ch)=>a+x.measureText(ch).width+sp,-sp);let cx=X-w/2;for(const ch of s){x.fillText(ch,cx+x.measureText(ch).width/2,Y);cx+=x.measureText(ch).width+sp}}
function grapesIcon(x,cx,cy,c,k){x.fillStyle=c;const rows=[4,3,2,1];let y=cy;rows.forEach((n,ri)=>{for(let i=0;i<n;i++){x.beginPath();x.arc(cx+(i-(n-1)/2)*26*k,y,12.5*k,0,7);x.fill()}y+=22*k});
 x.strokeStyle=c;x.lineWidth=3*k;x.beginPath();x.moveTo(cx,cy-14*k);x.quadraticCurveTo(cx+4*k,cy-34*k,cx+18*k,cy-42*k);x.stroke();
 x.beginPath();x.ellipse(cx+34*k,cy-36*k,20*k,10*k,-.4,0,7);x.fill()}
function labelTex(w){const c=document.createElement("canvas");c.width=900;c.height=1100;const x=c.getContext("2d"),t=TH[w.label];
 x.fillStyle=t.bg;x.fillRect(0,0,900,1100);
 for(let i=0;i<14000;i++){x.fillStyle=`rgba(${t.dot},${Math.random()*.04})`;x.fillRect(Math.random()*900,Math.random()*1100,2,2)}
 x.strokeStyle=t.gold;x.lineWidth=5;x.strokeRect(46,46,808,1008);x.lineWidth=1.6;x.strokeRect(64,64,772,972);
 x.textAlign="center";x.textBaseline="alphabetic";
 x.fillStyle=t.gold;x.font="500 30px Jost, system-ui, sans-serif";spaced(x,(window.BRAND||{}).label||"RODINNÉ VINAŘSTVÍ",450,156,(window.BRAND||{}).labelSp??9);
 grapesIcon(x,450,250,t.acc,1.15);
 x.fillStyle=t.ink;const words=w.n.split(" ");let lines=[w.n],fs=124;x.font=`italic 300 ${fs}px Fraunces, Georgia, serif`;
 if(x.measureText(w.n).width>700&&words.length>1)lines=[words[0],words.slice(1).join(" ")];
 lines.forEach(l=>{while(x.measureText(l).width>720&&fs>60){fs-=4;x.font=`italic 300 ${fs}px Fraunces, Georgia, serif`}});
 const y0=lines.length>1?520:590;lines.forEach((l,i)=>x.fillText(l,450,y0+i*fs*1.02));
 x.fillStyle=t.acc;x.font="300 150px Fraunces, Georgia, serif";x.fillText(w.y,450,820);
 x.fillStyle=t.gold;x.fillRect(370,862,160,2);
 x.fillStyle=t.ink;x.font="500 30px Jost, system-ui, sans-serif";spaced(x,w.k.toUpperCase(),450,925,5);
 x.fillStyle=t.gold;x.font="400 26px Jost, system-ui, sans-serif";spaced(x,"MORAVA · 0,75 L",450,985,7);
 const tx=new T.CanvasTexture(c);tx.encoding=T.sRGBEncoding;tx.anisotropy=R.capabilities.getMaxAnisotropy();return tx}

/* ---------- lahev ---------- */
const PROF={
 flute:{H:3.5,r:.365,lab:[.5,1.55],foil:3.0,p:[[0,0],[.31,0],[.352,.02],[.364,.07],[.365,.4],[.365,1.9],[.358,2.1],[.33,2.32],[.28,2.55],[.22,2.75],[.17,2.92],[.137,3.08],[.126,3.25],[.125,3.4],[.137,3.42],[.14,3.5]]},
 bdx:{H:3.3,r:.425,lab:[.45,1.5],foil:2.66,p:[[0,0],[.37,0],[.412,.02],[.424,.07],[.425,.4],[.425,2.0],[.418,2.12],[.385,2.24],[.31,2.34],[.21,2.43],[.155,2.52],[.133,2.66],[.127,2.9],[.126,3.18],[.138,3.21],[.141,3.3]]}};
function smooth(pts,n){const v=pts.map(p=>new T.Vector2(p[0],p[1]));const c=new T.SplineCurve(v);return c.getSpacedPoints(n)}
function rAt(arr,y){for(let i=1;i<arr.length;i++)if(arr[i].y>=y){const a=arr[i-1],b=arr[i],f=(y-a.y)/Math.max(1e-6,b.y-a.y);return L(a.x,b.x,f)}return arr[arr.length-1].x}
const corkTex=(()=>{const c=document.createElement("canvas");c.width=c.height=256;const x=c.getContext("2d");x.fillStyle="#c9a273";x.fillRect(0,0,256,256);
 for(let i=0;i<2600;i++){const r=Math.random();x.fillStyle=r<.5?`rgba(90,55,25,${Math.random()*.5})`:`rgba(240,215,170,${Math.random()*.35})`;x.beginPath();x.arc(Math.random()*256,Math.random()*256,Math.random()*2.6,0,7);x.fill()}
 const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;return t})();
function makeBottle(w){const P=PROF[w.shape],pts=smooth(P.p,160);pts[0].x=0;pts.unshift(new T.Vector2(0,0));pts.push(new T.Vector2(0,P.H));
 const g=new T.Group(),m=new T.Group();m.position.y=-P.H/2;g.add(m);g.userData={H:P.H,w};
 const clear=w.glass==="clear";
 const gm=clear?new T.MeshPhysicalMaterial({color:0xf4f1ee,metalness:0,roughness:.03,clearcoat:1,transparent:true,opacity:.24,envMapIntensity:2.6,depthWrite:false})
  :new T.MeshPhysicalMaterial({color:lin(w.glass),metalness:0,roughness:.035,reflectivity:.9,clearcoat:1,clearcoatRoughness:.02,envMapIntensity:2.4});
 const body=new T.Mesh(new T.LatheGeometry(pts,96),gm);body.renderOrder=2;m.add(body);
 if(clear){const lp=pts.filter(p=>p.y<=2.62).map(p=>new T.Vector2(p.x*.93,Math.max(.03,p.y)));lp.push(new T.Vector2(0,2.62));
  const lq=new T.Mesh(new T.LatheGeometry(lp,64),new T.MeshPhysicalMaterial({color:lin(w.liquid),roughness:.2,metalness:0,transparent:true,opacity:.92,envMapIntensity:.5,emissive:lin(w.liquid),emissiveIntensity:.25}));lq.renderOrder=1;m.add(lq);g.userData.liq=lq}
 // kapsle
 const fp=[];for(let i=0;i<=24;i++){const y=L(P.foil,P.H+.002,i/24);fp.push(new T.Vector2(rAt(pts,y)+.006,y))}
 const fm=new T.MeshStandardMaterial({color:lin(w.foil),metalness:.8,roughness:.3,envMapIntensity:1.5});
 const foil=new T.Mesh(new T.LatheGeometry(fp,64),fm);m.add(foil);
 const cap=new T.Mesh(new T.CircleGeometry(rAt(pts,P.H)+.006,48),fm);cap.rotation.x=-Math.PI/2;cap.position.y=P.H+.003;m.add(cap);
 const ring=new T.Mesh(new T.CylinderGeometry(rAt(pts,P.foil+.08)+.009,rAt(pts,P.foil+.08)+.009,.03,64,1,true),new T.MeshStandardMaterial({color:0xc9a35e,metalness:.9,roughness:.25}));ring.position.y=P.foil+.08;m.add(ring);
 // etiketa
 const lh=P.lab[1]-P.lab[0],lab=new T.Mesh(new T.CylinderGeometry(P.r+.004,P.r+.004,lh,96,1,true,-1.16,2.32),new T.MeshStandardMaterial({map:labelTex(w),roughness:.72,metalness:0,envMapIntensity:.7}));
 lab.position.y=(P.lab[0]+P.lab[1])/2;m.add(lab);g.userData.lab=lab;
 // zadní etiketa
 const bl=new T.Mesh(new T.CylinderGeometry(P.r+.004,P.r+.004,lh*.55,64,1,true,Math.PI-.7,1.4),new T.MeshStandardMaterial({color:w.label==="black"?0x151113:0xefe5d2,roughness:.8}));bl.position.y=P.lab[0]+lh*.35;m.add(bl);
 g.userData.cap=cap;g.userData.foil=foil;g.userData.ring=ring;g.userData.top=P.H/2;return g}

const bottles=VINO.slice(0,4).map(makeBottle);bottles.forEach(b=>scene.add(b));

/* ---------- hrozny, listy, zátka ---------- */
const NG=64,gGeo=new T.SphereGeometry(1,28,18),gMat=new T.MeshPhysicalMaterial({color:lin(0x3a0c2a),roughness:.32,metalness:0,clearcoat:.6,clearcoatRoughness:.35,envMapIntensity:1.2});
const grapes=new T.InstancedMesh(gGeo,gMat,NG);scene.add(grapes);grapes.visible=false;
const rnd=(a,b)=>a+Math.random()*(b-a),GD=[...Array(NG)].map((_,i)=>{const th=rnd(0,Math.PI*2),rr=rnd(1.25,2.9);let x=Math.cos(th)*rr*1.35,y=Math.sin(th)*rr*.85+.15;if(Math.abs(x)<.75)x=Math.sign(x||1)*rnd(.75,1.1);
 return{s:[rnd(-.15,.15),rnd(.4,1.1),rnd(-.6,-.3)],e:[x,y,rnd(-1.4,1.1)],sc:rnd(.085,.125),d:rnd(0,.25),ph:rnd(0,6),sp:rnd(.4,1)}});
const leafTex=(()=>{const c=document.createElement("canvas");c.width=c.height=512;const x=c.getContext("2d");const g=x.createRadialGradient(256,300,20,256,256,300);g.addColorStop(0,"#7da544");g.addColorStop(1,"#3f6a22");x.fillStyle=g;x.fillRect(0,0,512,512);
 x.strokeStyle="rgba(214,232,160,.55)";x.lineCap="round";for(let k=0;k<5;k++){const a=-Math.PI/2+(k-2)*.78;x.lineWidth=7;x.beginPath();x.moveTo(256,330);const ex=256+Math.cos(a)*230,ey=330+Math.sin(a)*230;x.quadraticCurveTo(256+Math.cos(a)*120+10,330+Math.sin(a)*120,ex,ey);x.stroke();
  x.lineWidth=3;for(let j=1;j<4;j++){const px=256+Math.cos(a)*j*55,py=330+Math.sin(a)*j*55;x.beginPath();x.moveTo(px,py);x.lineTo(px+Math.cos(a-.7)*45,py+Math.sin(a-.7)*45);x.moveTo(px,py);x.lineTo(px+Math.cos(a+.7)*45,py+Math.sin(a+.7)*45);x.stroke()}}
 const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;return t})();
const leafGeo=(()=>{const s=new T.Shape();for(let i=0;i<=200;i++){const a=i/200*Math.PI*2,b=a+Math.PI/2,r=.5+.12*Math.cos(5*b)+.025*Math.cos(30*b)-.18*Math.pow(Math.max(0,Math.cos(a+Math.PI/2)),18);const x=Math.cos(a)*r,y=Math.sin(a)*r;i?s.lineTo(x,y):s.moveTo(x,y)}
 const g=new T.ShapeGeometry(s,24),p=g.attributes.position,uv=g.attributes.uv;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i);uv.setXY(i,(x+.62)/1.24,(y+.62)/1.24*1+0);p.setZ(i,-(x*x)*.35-(y*y)*.12)}g.computeVertexNormals();return g})();
const leafMat=new T.MeshStandardMaterial({map:leafTex,roughness:.55,metalness:0,side:T.DoubleSide,envMapIntensity:.8});
const LD=[[-2.2,1.7,-.6,.4],[2.4,1.3,-1,-.6],[-2.6,-1.1,-.3,2.6],[2.1,-1.5,.2,-2.4],[-1.0,2.3,-1.3,.1],[1.3,-2.2,-1.1,3]].map(([x,y,z,r])=>{const m=new T.Mesh(leafGeo,leafMat);m.visible=false;scene.add(m);return{m,e:[x,y,z],r,d:rnd(0,.2),ph:rnd(0,6)}});
const cork=new T.Mesh(new T.CylinderGeometry(.118,.118,.52,40),[new T.MeshStandardMaterial({map:corkTex,roughness:.95}),new T.MeshStandardMaterial({color:0x6a1324,roughness:.8}),new T.MeshStandardMaterial({map:corkTex,roughness:.95})]);cork.visible=false;scene.add(cork);

/* ---------- velikost ---------- */
let W=1,H=1,vh=1,vw=1,mob=false;
function size(){W=wrap.clientWidth;H=wrap.clientHeight;R.setPixelRatio(Math.min(devicePixelRatio||1,1.75));R.setSize(W,H,false);cam.aspect=W/H;cam.updateProjectionMatrix();
 vh=2*cam.position.z*Math.tan(T.MathUtils.degToRad(cam.fov/2));vw=vh*cam.aspect;mob=cam.aspect<.85}
addEventListener("resize",size);size();

/* ---------- režie scrollu ---------- */
const A=[.2,.34,.48,.62],D=.14,glows=["#2c1d18",...VINO.slice(0,4).map(w=>w.glow)];
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
  const a=A[i],e0=a-.035,E={x:F.x+vw*.42,y:F.y-vh*.95,s:F.s,ry:-4.4,rz:-.5},S0={...F,ry:-.95};
  let s,vis=true;
  if(i===0){const u=ss((p-.1)/.1);s=mixS(Lp,S0,u);s.ry=L(Lp.ry,-.95,u)-Math.sin(u*Math.PI)*.9}
  else{const out=ss((p-.08-i*.012)/.08);const Ex={x:Lp.x+i*.25,y:-vh*.9,s:lsc,ry:Lp.ry+2.2,rz:.3};s=mixS(Lp,Ex,out);if(p>.17){s=E;vis=p>e0-.005}
   if(p>e0){s=mixS(E,S0,eo((p-e0)/.06))}}
  if(p>=a){const lo=cl((p-a)/D);s={...F,ry:L(-.95,.95,lo)};}
  if(i<3){const x0=a+D-.03;if(p>x0){const u=ss((p-x0)/.05);s=mixS({...F,ry:.95},{x:F.x-vw*.32,y:F.y+vh*.95,s:F.s,ry:4.6,rz:.45},u);if(u>=1)vis=false}}
  else if(p>.76){const u=ss((p-.76)/.06);s=mixS({...F,ry:.95},C,u);s.ry=L(.95,Math.PI*2,u)+Math.sin(t*.0005)*.12+ss((p-.86)/.14)*.5}
  if(i===3&&p>=a&&p<=.76)s.ry=L(-.95,.95,cl((p-a)/D))+0;
  s.y+= (p>.2?Math.sin(t*.0011+i)*.035:0);
  setB(b,s);b.visible=vis;b.userData.cap.visible=!(i===3&&p>.79)});
 // barvy
 const [ga,gb,gf=0]=glowAt(p);cA.copy(hexc(glows[ga])).lerp(hexc(glows[gb]),gf);
 rimA.color.copy(cA).lerp(new T.Color(1,1,1),.25);rimB.color.copy(cA);
 const css="#"+cA.getHexString();wrap.style.setProperty("--g",css);
 // exploze
 const q=cl((p-.785)/.15),on=p>.78;grapes.visible=on;cork.visible=on;
 if(on){const b=bottles[3],bs=b.scale.x,bx=b.position.x,by=b.position.y,mx=new T.Matrix4(),qq=new T.Quaternion(),eu=new T.Euler(),v=new T.Vector3(),sc=new T.Vector3();
  const spread=mob?.55:1;
  GD.forEach((g,i)=>{const k=eo((q-g.d)/(1-g.d)*1.15),dr=Math.sin(t*.0009*g.sp+g.ph)*.06*k;
   v.set(bx+L(g.s[0],g.e[0]*spread,k)*bs,by+L(g.s[1],g.e[1]*(mob?.75:1),k)*bs+dr,L(g.s[2],g.e[2],k));eu.set(g.ph+t*.0003*g.sp,g.ph*2,0);qq.setFromEuler(eu);
   const r=g.sc*bs*(.3+.7*k);sc.set(r,r*1.08,r);mx.compose(v,qq,sc);grapes.setMatrixAt(i,mx)});grapes.instanceMatrix.needsUpdate=true;
  const ck=eo(q/.45),top=by+b.userData.top*bs;cork.position.set(bx+L(0,(mob?.5:.75)*spread,ck),L(top-.1,top+(mob?.55:.45),ck)+Math.sin(t*.001)*.04*ck,L(0,.4,ck));cork.rotation.set(ck*2.2,t*.0004,ck*-1.1);cork.scale.setScalar(bs);
  LD.forEach(l=>{const k=eo((q-l.d)/(1-l.d)*1.1);l.m.visible=k>.01;l.m.position.set(bx+l.e[0]*k*spread*bs,by+l.e[1]*k*(mob?.8:1)*bs+Math.sin(t*.0008+l.ph)*.06,l.e[2]);l.m.rotation.set(.5+Math.sin(t*.0006+l.ph)*.15,l.r*.4+Math.sin(t*.0005+l.ph)*.2,l.r+(1-k)*2);l.m.scale.setScalar(Math.max(.001,k)*(mob?.62:.9))})}
 else LD.forEach(l=>l.m.visible=false);
 // texty
 intro.style.opacity=1-ss((p-.04)/.06);intro.style.transform=`translateY(${-ss((p-.04)/.08)*40}px)`;intro.style.pointerEvents=p<.06?"auto":"none";
 panels.forEach((el,i)=>{const a=A[i],v=ss((p-(a-.005))/.03)*(1-ss((p-(a+D-.035))/.03));el.style.opacity=v;el.style.transform=`translateY(${(1-v)*30}px)`;el.style.pointerEvents=v>.5?"auto":"none"});
 const bv=ss((p-.79)/.07);big.style.opacity=bv;big.style.transform=`translate(-50%,-50%) scale(${.86+bv*.14})`;out.style.opacity=ss((p-.86)/.06);out.style.pointerEvents=p>.88?"auto":"none";
 ticks.forEach((k,i)=>k.classList.toggle("on",p>=A[i]-.01&&(i===3?p<.8:p<A[i]+D-.01)));
 R.render(scene,cam)}
let last=performance.now();
(function tick(t){const dt=Math.min(64,t-last);last=t;sm+=(tgt-sm)*(1-Math.pow(.88,dt/16.7));if(Math.abs(tgt-sm)<.0002)sm=tgt;
 const r=hero.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight)frame(t);requestAnimationFrame(tick)})(last);

window.V3={labelTex,makeBottle,leafGeo,leafMat,corkTex,PROF};
/* náhledy lahví pro bednu */
window.renderThumbs=function(){const out=[],ts=new T.Scene();ts.environment=scene.environment;ts.add(new T.HemisphereLight(0xffffff,0x332222,.6));const k2=new T.DirectionalLight(0xffffff,1.4);k2.position.set(-3,5,6);ts.add(k2);const r2=new T.DirectionalLight(0xffe6c8,1.6);r2.position.set(5,2,-4);ts.add(r2);
 const tc=new T.PerspectiveCamera(20,.36,.1,50);tc.position.set(0,0,11.2);const pw=R.getPixelRatio();R.setPixelRatio(1);R.setSize(216,600,false);
 VINO.forEach(w=>{const b=makeBottle(w);b.rotation.y=.05;ts.add(b);R.render(ts,tc);out.push(cv.toDataURL("image/png"));ts.remove(b)});
 R.setPixelRatio(pw);size();return out};
document.fonts&&document.fonts.ready.then(()=>{bottles.forEach(b=>{const lab=b.userData.lab;lab.material.map=labelTex(b.userData.w);lab.material.needsUpdate=true});window.dispatchEvent(new Event("vino-ready"))});
})();
