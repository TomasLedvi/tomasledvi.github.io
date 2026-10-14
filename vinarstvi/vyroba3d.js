/* Jak se rodí víno – 3D výroba (Three.js r128) */
(()=>{
const T=THREE,V3=window.V3;if(!V3)return;
const cl=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)),ss=t=>{t=cl(t);return t*t*(3-2*t)},L=(a,b,t)=>a+(b-a)*t,eo=t=>1-Math.pow(1-cl(t),3),lin=h=>new T.Color(h).convertSRGBToLinear(),rnd=(a,b)=>a+Math.random()*(b-a);
const STEPS=[
["Sklizeň","Září – říjen","Hrozny stříháme ručně do malých přepravek, aby se nepomačkaly. Do sklepa putují ještě týž den.","Ruční sběr"],
["Odzrnění a drcení","Hned po sklizni","Odzrňovač oddělí bobule od třapin a jemně je nadrtí. Vznikne rmut, tedy šťáva i se slupkami a semínky.","Třapiny se kompostují"],
["Kvašení","1 až 3 týdny","Kvasinky mění cukr na alkohol a oxid uhličitý. Červená vína kvasí i se slupkami, z nich mají barvu a třísloviny. Klobouk ze slupek denně promícháváme.","Bílá vína se lisují hned a kvasí jen mošt"],
["Lisování","Po dokvašení","Lis jemně oddělí mladé víno od slupek a semínek. Zbytku se říká matoliny.","Z matolin se pálí matolinovice"],
["Zrání","Měsíce až roky","Víno zraje v dubových sudech nebo v nerezových tancích. Několikrát ho stočíme z kalů, aby se pročistilo.","Naše Frankovka zraje 24 měsíců v barrique"],
["Lahvování","Když je víno hotové","Víno přefiltrujeme, naplníme do lahví a zazátkujeme. Pak ještě pár měsíců odpočívá v lahvi, než ho pustíme k vám.","Lahve skladujeme naležato"]];
const GL=["#4d2a3c","#4a1426","#3c1630","#4a2412","#47280f","#5a1424"];
const sec=document.getElementById("vyroba"),wrap=document.getElementById("p3"),cv=document.getElementById("gl2");
document.getElementById("vps").innerHTML=STEPS.map((s,i)=>`<div class="wp vp"><div class="n">0${i+1} <span>/ 06</span></div><div class="k3">${s[1]}</div><h2>${s[0]}</h2><p>${s[2]}</p><div class="chip3">${s[3]}</div></div>`).join("");
const panels=[...wrap.querySelectorAll(".vp")],ticks=[...wrap.querySelectorAll(".rail2 i")];
const R=new T.WebGLRenderer({canvas:cv,antialias:true,alpha:true});R.outputEncoding=T.sRGBEncoding;R.toneMapping=T.ACESFilmicToneMapping;R.toneMappingExposure=1.08;R.setClearColor(0,0);
const scene=new T.Scene(),cam=new T.PerspectiveCamera(28,1,.1,100);cam.position.set(0,.4,11);cam.lookAt(0,0,0);
(()=>{const pm=new T.PMREMGenerator(R),es=new T.Scene();es.add(new T.Mesh(new T.BoxGeometry(40,40,40),new T.MeshBasicMaterial({color:0x0b0807,side:T.BackSide})));
 const P=(w,h,c,x,y,z)=>{const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:c,side:T.DoubleSide}));m.position.set(x,y,z);m.lookAt(0,0,0);es.add(m)};
 P(12,3,new T.Color(5,4.7,4.3),0,14,3);P(1.4,12,new T.Color(3.4,3.2,3),-11,1,4);P(1.1,12,new T.Color(2.2,2,1.9),11,1,-1);P(8,8,new T.Color(1.3,.7,.45),0,0,-15);P(6,1,new T.Color(1.5,1.4,1.3),0,-12,6);
 scene.environment=pm.fromScene(es,.025).texture})();
scene.add(new T.HemisphereLight(0xfff2e6,0x1a0d0a,.35));
const key=new T.DirectionalLight(0xfff1e0,1.3);key.position.set(-4,6,7);scene.add(key);
const rimA=new T.DirectionalLight(0xff9a7a,2.2);rimA.position.set(6,2.5,-5);scene.add(rimA);const rimB=new T.DirectionalLight(0xffc89a,1.2);rimB.position.set(-6,1,-4);scene.add(rimB);

/* textury */
function woodTex(n,base,dark){const c=document.createElement("canvas");c.width=1024;c.height=512;const x=c.getContext("2d"),w=1024/n;
 for(let i=0;i<n;i++){const k=.85+Math.random()*.3;x.fillStyle=base;x.fillRect(i*w,0,w,512);x.fillStyle=`rgba(0,0,0,${(1-k)*.9+.05})`;x.fillRect(i*w,0,w,512);
  x.strokeStyle=dark;x.globalAlpha=.25;for(let g=0;g<7;g++){x.lineWidth=1+Math.random()*2;x.beginPath();const ox=i*w+Math.random()*w;for(let y=0;y<=512;y+=16)x.lineTo(ox+Math.sin(y*.02+g)*w*.12,y);x.stroke()}x.globalAlpha=1;
  x.fillStyle="rgba(0,0,0,.55)";x.fillRect(i*w,0,2.5,512)}
 const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;t.wrapS=T.RepeatWrapping;t.anisotropy=8;return t}
function endTex(){const c=document.createElement("canvas");c.width=c.height=512;const x=c.getContext("2d");
 for(let i=0;i<7;i++){x.fillStyle=`hsl(26,${38+Math.random()*8}%,${30+Math.random()*7}%)`;x.fillRect(0,i*74,512,74);x.fillStyle="rgba(0,0,0,.45)";x.fillRect(0,i*74,512,2)}
 x.strokeStyle="rgba(0,0,0,.18)";for(let g=0;g<60;g++){x.beginPath();const y=Math.random()*512;x.moveTo(0,y);x.bezierCurveTo(170,y+rnd(-8,8),340,y+rnd(-8,8),512,y);x.stroke()}
 x.fillStyle="rgba(245,238,225,.85)";x.textAlign="center";x.font="italic 300 64px Fraunces, Georgia, serif";x.fillText("Frankovka",256,230);x.font="300 54px Fraunces, Georgia, serif";x.fillText("2024",256,300);
 x.fillStyle="#1b0f08";x.beginPath();x.arc(256,400,18,0,7);x.fill();
 const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;return t}
function speckTex(a,b){const c=document.createElement("canvas");c.width=c.height=256;const x=c.getContext("2d");x.fillStyle=a;x.fillRect(0,0,256,256);
 for(let i=0;i<2200;i++){x.fillStyle=Math.random()<.5?b:"rgba(255,200,220,.12)";x.beginPath();x.arc(Math.random()*256,Math.random()*256,Math.random()*3+.5,0,7);x.fill()}const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;t.wrapS=t.wrapT=T.RepeatWrapping;return t}
const WOOD=woodTex(26,"#9a6a3c","#3e2412"),OAK=woodTex(22,"#8a5530","#3a1f0e");
const mWood=new T.MeshStandardMaterial({map:WOOD,roughness:.62,metalness:0}),mOak=new T.MeshStandardMaterial({map:OAK,roughness:.5,metalness:0,envMapIntensity:.9});
const mIron=new T.MeshStandardMaterial({color:lin(0x2a2522),metalness:.85,roughness:.38}),mSteel=new T.MeshStandardMaterial({color:lin(0xb9b5b0),metalness:1,roughness:.22});
const WINE=lin(0x4a0c1e),mMust=new T.MeshPhysicalMaterial({color:WINE,roughness:.12,clearcoat:1,clearcoatRoughness:.05,envMapIntensity:1.4});
const mBerry=new T.MeshPhysicalMaterial({color:lin(0x3a0c2a),roughness:.34,clearcoat:.6,clearcoatRoughness:.35,envMapIntensity:1.2});
const mStem=new T.MeshStandardMaterial({color:lin(0x6b5a2a),roughness:.8});
const mGlass=new T.MeshPhysicalMaterial({color:0xf4f1ee,roughness:.03,metalness:0,clearcoat:1,transparent:true,opacity:.16,envMapIntensity:2.6,depthWrite:false,side:T.DoubleSide});

Object.assign(V3,{woodTex,mOak,mWood,mIron});
/* A: hrozen */
const A=new T.Group();scene.add(A);const BP=[];
for(let j=0;j<9;j++){const y=.5-j*.15,rr=.4*(1-j/10.5)*(j===0?.85:1),n=Math.max(1,Math.round(Math.PI*2*rr/.17));for(let i=0;i<n;i++){const a=i/n*Math.PI*2+j*.6+rnd(-.15,.15);BP.push([Math.cos(a)*rr+rnd(-.02,.02),y+rnd(-.03,.03),Math.sin(a)*rr,rnd(.088,.104)])}
 if(rr>.2)BP.push([rnd(-.05,.05),y,rnd(-.05,.05),.09])}
const NB=BP.length,berries=new T.InstancedMesh(new T.SphereGeometry(1,24,16),mBerry,NB);A.add(berries);
const stemC=new T.CatmullRomCurve3([new T.Vector3(.05,1.05,0),new T.Vector3(0,.85,0),new T.Vector3(0,.55,0),new T.Vector3(0,-.6,0)]);const stem=new T.Mesh(new T.TubeGeometry(stemC,40,.022,8),mStem);A.add(stem);
const hook=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([new T.Vector3(.05,1.05,0),new T.Vector3(.18,1.22,0),new T.Vector3(.12,1.34,.02)]),20,.026,8),mStem);A.add(hook);
const leaf=new T.Mesh(V3.leafGeo,V3.leafMat);leaf.position.set(-.38,.92,-.3);leaf.rotation.set(.3,.5,.6);leaf.scale.setScalar(.95);A.add(leaf);
const FALL=BP.map(()=>{const a=rnd(0,Math.PI*2),r=Math.sqrt(Math.random())*.75;return[Math.cos(a)*r,Math.sin(a)*r,rnd(0,.25)]});
/* B: kád */
const B=new T.Group();scene.add(B);
const vat=new T.Mesh(new T.CylinderGeometry(1,.88,.95,64,1,true),mWood);B.add(vat);const vatIn=new T.Mesh(new T.CylinderGeometry(.985,.865,.95,64,1,true),new T.MeshStandardMaterial({color:lin(0x2a170c),roughness:.9,side:T.BackSide}));B.add(vatIn);
[-.32,.32].forEach(y=>{const h=new T.Mesh(new T.TorusGeometry(L(.94,.995,(y+.47)/.95)+.012,.022,10,80),mIron);h.rotation.x=Math.PI/2;h.position.y=y;B.add(h)});
const rim=new T.Mesh(new T.TorusGeometry(1,.03,10,80),mWood);rim.rotation.x=Math.PI/2;rim.position.y=.475;B.add(rim);
const must=new T.Mesh(new T.CircleGeometry(.97,64),mMust);must.rotation.x=-Math.PI/2;B.add(must);
const skins=new T.InstancedMesh(new T.CircleGeometry(1,12),new T.MeshStandardMaterial({color:lin(0x24061a),roughness:.6,side:T.DoubleSide}),70);B.add(skins);const SK=[...Array(70)].map(()=>{const a=rnd(0,7),r=Math.sqrt(Math.random())*.85;return[Math.cos(a)*r,Math.sin(a)*r,rnd(.04,.08),rnd(0,7)]});
/* C: kvasná nádoba */
const C=new T.Group();scene.add(C);
const tank=new T.Mesh(new T.CylinderGeometry(.72,.72,2.1,64,1,true),mGlass);tank.renderOrder=3;C.add(tank);
[-1.05,1.05].forEach(y=>{const r=new T.Mesh(new T.TorusGeometry(.73,.035,12,80),mSteel);r.rotation.x=Math.PI/2;r.position.y=y;C.add(r)});
const tb=new T.Mesh(new T.CircleGeometry(.72,64),mSteel);tb.rotation.x=Math.PI/2;tb.position.y=-1.05;C.add(tb);
const liq=new T.Mesh(new T.CylinderGeometry(.69,.69,1.45,64),new T.MeshPhysicalMaterial({color:WINE,roughness:.15,transparent:true,opacity:.94,envMapIntensity:.8}));liq.position.y=-1.05+.725;liq.renderOrder=1;C.add(liq);
const capM=new T.MeshStandardMaterial({map:speckTex("#2a0716","rgba(10,0,6,.9)"),roughness:.85});const cap=new T.Mesh(new T.CylinderGeometry(.69,.69,.22,64),capM);cap.position.y=-1.05+1.45+.1;cap.renderOrder=1;C.add(cap);
const NBU=90,bub=new T.InstancedMesh(new T.SphereGeometry(1,10,8),new T.MeshPhysicalMaterial({color:0xffe6ee,roughness:.05,transparent:true,opacity:.55,envMapIntensity:2}),NBU);bub.renderOrder=2;C.add(bub);
const BU=[...Array(NBU)].map(()=>{const a=rnd(0,7),r=Math.sqrt(Math.random())*.6;return[Math.cos(a)*r,Math.sin(a)*r,rnd(0,1),rnd(.012,.032),rnd(.5,1.2)]});
const lidM=new T.Mesh(new T.CylinderGeometry(.3,.72,.22,64),mSteel);lidM.position.y=1.16;C.add(lidM);const vent=new T.Mesh(new T.CylinderGeometry(.05,.05,.3,20),mSteel);vent.position.y=1.4;C.add(vent);
/* D: koš lisu */
const D=new T.Group();scene.add(D);
const tray=new T.Mesh(new T.CylinderGeometry(1.08,1.02,.16,64),mWood);tray.position.y=-.08;D.add(tray);
const trayLiq=new T.Mesh(new T.CircleGeometry(1.0,64),mMust);trayLiq.rotation.x=-Math.PI/2;trayLiq.position.y=.005;D.add(trayLiq);
const lip=new T.Mesh(new T.TorusGeometry(1.06,.04,10,80),mWood);lip.rotation.x=Math.PI/2;lip.position.y=.03;D.add(lip);
const slatG=new T.BoxGeometry(.13,1.25,.06);for(let i=0;i<22;i++){const a=i/22*Math.PI*2,s=new T.Mesh(slatG,mWood);s.position.set(Math.cos(a)*.74,.66,Math.sin(a)*.74);s.rotation.y=-a+Math.PI/2;D.add(s)}
[.28,1.08].forEach(y=>{const h=new T.Mesh(new T.TorusGeometry(.785,.03,10,80),mIron);h.rotation.x=Math.PI/2;h.position.y=y;D.add(h)});
const pom=new T.Mesh(new T.CylinderGeometry(.7,.7,1,48),new T.MeshStandardMaterial({map:speckTex("#300a1c","rgba(12,0,6,.9)"),roughness:.8}));D.add(pom);
const plate=new T.Mesh(new T.CylinderGeometry(.7,.7,.08,48),mWood);D.add(plate);
const screw=new T.Mesh(new T.CylinderGeometry(.065,.065,2.5,20),mIron);screw.position.y=1.25;D.add(screw);
const bar=new T.Mesh(new T.CylinderGeometry(.035,.035,1.5,14),mIron);bar.rotation.z=Math.PI/2;D.add(bar);const barG=new T.Group();barG.add(bar);D.add(barG);
const spout=new T.Mesh(new T.CylinderGeometry(.05,.07,.28,16),mWood);spout.rotation.z=Math.PI/2;spout.position.set(1.18,-.06,0);D.add(spout);
const stream=new T.Mesh(new T.CylinderGeometry(.028,.024,1,12),mMust);D.add(stream);
/* E: sud */
const E=new T.Group();scene.add(E);const EB=new T.Group();E.add(EB);
const bpts=[];for(let i=0;i<=40;i++){const y=L(-.82,.82,i/40);bpts.push(new T.Vector2(.56+.14*Math.cos(y/.82*Math.PI/2),y))}
OAK.repeat.set(1,1);const barrel=new T.Mesh(new T.LatheGeometry(bpts,96),mOak);EB.add(barrel);
[-.66,-.36,.36,.66].forEach(y=>{const r=.56+.14*Math.cos(y/.82*Math.PI/2);const h=new T.Mesh(new T.TorusGeometry(r+.012,.026,10,96),mIron);h.rotation.x=Math.PI/2;h.position.y=y;EB.add(h)});
const eT=endTex();eT.center.set(.5,.5);eT.rotation=Math.PI/2;const endM=new T.MeshStandardMaterial({map:eT,roughness:.6});[-1,1].forEach(sg=>{const e=new T.Mesh(new T.CircleGeometry(.565,64),endM);e.rotation.x=sg*Math.PI/2*-1;e.position.y=sg*.80;if(sg<0)e.rotation.z=Math.PI;EB.add(e)});
const bung=new T.Mesh(new T.CylinderGeometry(.05,.05,.04,20),new T.MeshStandardMaterial({color:lin(0x2a1a10),roughness:.7}));bung.position.set(0,0,.705);bung.rotation.x=Math.PI/2;EB.add(bung);
EB.rotation.z=Math.PI/2;
[-.45,.45].forEach(x=>{const ch=new T.Mesh(new T.BoxGeometry(.18,.16,1.1),mWood);ch.position.set(x,-.66,0);E.add(ch)});
/* F: lahev */
const Fb=V3.makeBottle({n:"Frankovka",y:"2024",k:"Barrique · suché",glass:"clear",liquid:0x4a0c1e,shape:"bdx",foil:0x6e1a2b,label:"black"});scene.add(Fb);
const fu=Fb.userData;fu.lab.material.transparent=true;
const nozzle=new T.Mesh(new T.CylinderGeometry(.04,.04,1.6,16),mSteel);scene.add(nozzle);const fstream=new T.Mesh(new T.CylinderGeometry(.018,.018,1,10),mMust);scene.add(fstream);
const fcork=new T.Mesh(new T.CylinderGeometry(.118,.118,.48,32),new T.MeshStandardMaterial({map:V3.corkTex,roughness:.95}));scene.add(fcork);

/* velikost */
let W=1,H=1,vh=1,vw=1,mob=false;
function size(){W=wrap.clientWidth;H=wrap.clientHeight;R.setPixelRatio(Math.min(devicePixelRatio||1,1.75));R.setSize(W,H,false);cam.aspect=W/H;cam.updateProjectionMatrix();vh=2*11*Math.tan(T.MathUtils.degToRad(14));vw=vh*cam.aspect;mob=cam.aspect<.85}
addEventListener("resize",size);size();
let tgt=0,sm=0;function prog(){const r=sec.getBoundingClientRect();tgt=cl(-r.top/Math.max(1,r.height-innerHeight))}addEventListener("scroll",prog,{passive:true});prog();
const ca=new T.Color(),cb=new T.Color(),M=new T.Matrix4(),Q=new T.Quaternion(),Ev=new T.Euler(),Vv=new T.Vector3(),Sv=new T.Vector3();
function slide(d,lo=-.3,hi=.3){return d<lo?-(lo-d)/.3*vh*1.05:d>hi?(d-hi)/.3*vh*1.05:0}
function frame(t){const p=sm,k6=p*6,F=mob?{x:0,y:vh*.2,s:.72}:{x:vw*.17,y:-.15,s:1};
 // A + B (kroky 1–2)
 {const dA=k6-1,vis=dA<1.6;A.visible=B.visible=vis;
  if(vis){const exit=dA>.7?(dA-.7)/.3*vh*1.05:0,u1=ss((k6-1.08)/.78),up=ss((k6-.82)/.3);
   A.position.set(F.x,F.y+up*(mob?.62:.78)+exit,0);A.scale.setScalar(F.s*(mob?1.25:1.55)*(1-up*.22));A.rotation.set(0,t*.00025+Math.sin(t*.0007)*.15,Math.sin(t*.0009)*.05);
   B.position.set(F.x,F.y-(mob?.95:1.15)+exit-(1-up)*vh*.8,0);B.scale.setScalar(F.s*(mob?.8:.95));B.rotation.set(.38,t*.0001,0);B.visible=up>.01;
   const top=.47-(1-u1*.75)*.62;must.position.y=L(-.44,.36,u1);must.visible=u1>.04;const mr=L(.87,.985,(must.position.y+.475)/.95)/.97;must.scale.set(mr,mr,1);
   // bobule padají do kádě (v souřadnicích A převedeno přes pozici kádě)
   const bS=A.scale.x,bAy=A.position.y,bBy=B.position.y+must.position.y*B.scale.x,dx=B.position.x-A.position.x;
   BP.forEach((b,i)=>{const f=FALL[i],st=cl((u1-f[2]*1.6)/.45),fa=st*st,land=ss((u1-f[2]*1.6-.4)/.25);
    const tx=(dx+f[0]*B.scale.x)/bS,ty=(bBy-bAy)/bS,tz=f[1]*B.scale.x/bS;
    Vv.set(L(b[0],tx,fa),L(b[1],ty,fa),L(b[2],tz,fa));const r=b[3]*(1-land*.98);Sv.set(r,r*(1-land*.6),r);Ev.set(i,i*2,0);Q.setFromEuler(Ev);M.compose(Vv,Q,Sv);berries.setMatrixAt(i,M)});berries.instanceMatrix.needsUpdate=true;
   const sg=1-ss((u1-.35)/.4);stem.scale.setScalar(Math.max(.001,sg));hook.scale.setScalar(Math.max(.001,sg));leaf.scale.setScalar(Math.max(.001,.95*sg));stem.position.y=hook.position.y=(1-sg)*1.2;leaf.position.y=.92+(1-sg)*1.4;
   SK.forEach((s,i)=>{const on=ss((u1-.5)/.4);Vv.set(s[0],must.position.y+.004,s[1]);Ev.set(-Math.PI/2,0,s[3]);Q.setFromEuler(Ev);const r=s[2]*on+.0001;Sv.set(r,r,r);M.compose(Vv,Q,Sv);skins.setMatrixAt(i,M)});skins.instanceMatrix.needsUpdate=true}}
 // C kvašení
 {const d=k6-2.5;C.visible=Math.abs(d)<.62;if(C.visible){C.position.set(F.x,F.y+slide(d),0);C.scale.setScalar(F.s*(mob?.85:.95));C.rotation.y=t*.00015;
  cap.position.y=-1.05+1.45+.1+Math.sin(t*.002)*.012;
  BU.forEach((b,i)=>{const ph=(b[2]+t*.00012*b[4])%1,y=-1.0+ph*1.4;Vv.set(b[0]+Math.sin(t*.003+i)*.01,y,b[1]);const r=b[3]*(.6+ph*.6);Sv.set(r,r,r);M.compose(Vv,Q.identity(),Sv);bub.setMatrixAt(i,M)});bub.instanceMatrix.needsUpdate=true}}
 // D lis
 {const d=k6-3.5;D.visible=Math.abs(d)<.62;if(D.visible){const u=ss((d+.32)/.6);D.position.set(F.x,F.y-.55+slide(d),0);D.scale.setScalar(F.s*(mob?.8:.95));D.rotation.y=-.35+t*.00008;
  const ph=L(1.2,.5,u);pom.scale.y=ph;pom.position.y=ph/2+.0;plate.position.y=ph+.04;barG.position.y=ph+.16;barG.rotation.y=u*Math.PI*3;trayLiq.position.y=.005+u*.05;
  const sh=1.4;stream.visible=u>.05;stream.scale.y=sh;stream.position.set(1.34,-.06-sh/2,0);stream.scale.x=stream.scale.z=.6+.4*Math.min(1,u*3)}}
 // E sud
 {const d=k6-4.5;E.visible=Math.abs(d)<.62;if(E.visible){E.position.set(F.x,F.y-.1+slide(d),0);E.scale.setScalar(F.s*(mob?.95:1.2));E.rotation.set(.12,-.75+d*.6+Math.sin(t*.0004)*.05,0)}}
 // F lahev
 {const d=k6-5.5,vis=d>-.62;Fb.visible=nozzle.visible=fstream.visible=fcork.visible=vis;if(vis){const u=ss((d+.3)/.62),y=F.y-.15+slide(d,-.3,9),s=F.s*(mob?.78:.92);
  Fb.position.set(F.x,y,0);Fb.scale.setScalar(s);Fb.rotation.set(0,Math.sin(t*.0005)*.12+L(-.6,0,ss((u-.6)/.4)),0);
  const fill=ss(u/.55);fu.liq.scale.y=Math.max(.001,fill*.97);const topY=y+fu.top*s;
  const nz=1-ss((u-.55)/.1);nozzle.position.set(F.x,topY+.8*s-(.55*s)*nz,0);nozzle.scale.setScalar(s);nozzle.visible=nz>.02;
  const surf=y-fu.top*s+(2.62*fill*.97)*s;fstream.visible=fill>.01&&fill<.995;const sl=Math.max(.01,topY-.25*s-surf);fstream.scale.set(s,sl,s);fstream.position.set(F.x,surf+sl/2,0);
  const ck=ss((u-.62)/.12);fcork.visible=u>.56;fcork.scale.setScalar(s);fcork.position.set(F.x,topY+L(.5,-.18,ck)*s,0);
  const cap1=ss((u-.76)/.08);[fu.foil,fu.cap,fu.ring].forEach(m=>{m.visible=cap1>.01;m.scale.set(1,Math.max(.001,cap1),1)});fu.foil.position.y=0;if(cap1>.98)fcork.visible=false;
  fu.lab.material.opacity=ss((u-.84)/.1);fu.lab.position.z=0}}
 // barvy a texty
 const si=Math.min(5,Math.floor(k6)),sf=ss((k6-si-.85)/.15);ca.set(GL[si]).lerp(cb.set(GL[Math.min(5,si+1)]),sf);wrap.style.setProperty("--g","#"+ca.getHexString());
 panels.forEach((el,i)=>{const v=ss((k6-i-.04)/.12)*(i===5?1:1-ss((k6-i-.86)/.12));el.style.opacity=v;el.style.transform=`translateY(${(1-v)*30}px)`;el.style.pointerEvents=v>.5?"auto":"none"});
 ticks.forEach((tk,i)=>tk.classList.toggle("on",si===i));
 R.render(scene,cam)}
let last=performance.now();
(function tick(t){const dt=Math.min(64,t-last);last=t;sm+=(tgt-sm)*(1-Math.pow(.88,dt/16.7));if(Math.abs(tgt-sm)<.0002)sm=tgt;const r=sec.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight)frame(t);requestAnimationFrame(tick)})(last);
document.fonts&&document.fonts.ready.then(()=>{const t2=endTex();t2.center.set(.5,.5);t2.rotation=Math.PI/2;endM.map=t2;endM.needsUpdate=true});
})();
