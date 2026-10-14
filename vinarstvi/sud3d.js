/* Posezení u sudu – 3D stolek ze sudu se šesti vzorky */
(()=>{const T=THREE,V3=window.V3;if(!V3||!V3.woodTex)return;
const cl=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)),ss=t=>{t=cl(t);return t*t*(3-2*t)},L=(a,b,t)=>a+(b-a)*t,lin=h=>new T.Color(h).convertSRGBToLinear();
const box=document.querySelector(".arch"),cv=document.getElementById("gl3"),sec=document.getElementById("degustace");
const R=new T.WebGLRenderer({canvas:cv,antialias:true,alpha:true});R.outputEncoding=T.sRGBEncoding;R.toneMapping=T.ACESFilmicToneMapping;R.toneMappingExposure=1.1;R.setClearColor(0,0);
const scene=new T.Scene(),cam=new T.PerspectiveCamera(30,.75,.1,50);
(()=>{const pm=new T.PMREMGenerator(R),es=new T.Scene();es.add(new T.Mesh(new T.BoxGeometry(40,40,40),new T.MeshBasicMaterial({color:0x140c08,side:T.BackSide})));
 const P=(w,h,c,x,y,z)=>{const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:c,side:T.DoubleSide}));m.position.set(x,y,z);m.lookAt(0,0,0);es.add(m)};
 P(10,3,new T.Color(4,3.4,2.6),0,14,3);P(1.4,10,new T.Color(3,2.4,1.8),-11,1,4);P(6,6,new T.Color(2.2,1.2,.6),0,2,-14);P(1.2,10,new T.Color(1.8,1.4,1),11,1,-2);
 scene.environment=pm.fromScene(es,.03).texture})();
scene.add(new T.HemisphereLight(0xffe6c8,0x140906,.3));
const key=new T.DirectionalLight(0xffe2c0,1.1);key.position.set(-3,6,4);scene.add(key);
const rim=new T.DirectionalLight(0xffa860,1.6);rim.position.set(3,2,-5);scene.add(rim);
const candleL=new T.PointLight(0xffa04a,2.2,4.5,2);scene.add(candleL);
/* sud jako stolek */
const bpts=[];for(let i=0;i<=40;i++){const y=L(-.82,.82,i/40);bpts.push(new T.Vector2(.56+.14*Math.cos(y/.82*Math.PI/2),y))}
const barrel=new T.Mesh(new T.LatheGeometry(bpts,96),V3.mOak);scene.add(barrel);
[-.66,-.36,.36,.66].forEach(y=>{const r=.56+.14*Math.cos(y/.82*Math.PI/2),h=new T.Mesh(new T.TorusGeometry(r+.012,.026,10,96),V3.mIron);h.rotation.x=Math.PI/2;h.position.y=y;scene.add(h)});
const topT=V3.woodTex(9,"#7a4a26","#2e1708");topT.repeat.set(1,1);
const top=new T.Mesh(new T.CylinderGeometry(.86,.86,.07,96),[new T.MeshStandardMaterial({map:topT,roughness:.55}),new T.MeshStandardMaterial({map:topT,roughness:.45,envMapIntensity:.8}),new T.MeshStandardMaterial({color:0x2a160a})]);top.position.y=.855;scene.add(top);
const TY=.89;
/* sklenky */
const gp=[[0,0],[.105,0],[.108,.006],[.03,.016],[.013,.03],[.012,.16],[.02,.172],[.065,.195],[.098,.24],[.104,.29],[.095,.35],[.082,.4]].map(p=>new T.Vector2(p[0],p[1]));
const gGeo=new T.LatheGeometry(new T.SplineCurve(gp).getSpacedPoints(80),64);
const gMat=new T.MeshPhysicalMaterial({color:0xffffff,roughness:.02,metalness:0,clearcoat:1,transparent:true,opacity:.2,envMapIntensity:2.8,depthWrite:false,side:T.DoubleSide});
const wpts=[];for(let i=0;i<=20;i++){const y=L(.176,.31,i/20);let r=0;for(let k=1;k<gp.length;k++)if(gp[k].y>=y){const a=gp[k-1],b=gp[k];r=L(a.x,b.x,(y-a.y)/(b.y-a.y));break}wpts.push(new T.Vector2(r*.9,y-.176))}wpts.unshift(new T.Vector2(0,0));wpts.push(new T.Vector2(0,.31-.176));
const wGeo=new T.LatheGeometry(wpts,48);
const WC=[0xe8d58a,0xd9b24a,0xc98a24,0xe27a7a,0x8a1530,0x4a0c1e],glasses=[];
WC.forEach((c,i)=>{const a=L(-1.05,1.05,i/5)+Math.PI/2,r=.55,g=new T.Group();g.position.set(Math.cos(a)*r,TY,Math.sin(a)*r*.8+.08);scene.add(g);
 const gl=new T.Mesh(gGeo,gMat);gl.renderOrder=3;g.add(gl);
 const wm=new T.MeshPhysicalMaterial({color:lin(c),roughness:.1,transparent:true,opacity:i<3?.78:.92,envMapIntensity:1.2,emissive:lin(c),emissiveIntensity:.12});
 const w=new T.Mesh(wGeo,wm);w.position.y=.176;w.renderOrder=1;g.add(w);g.scale.setScalar(1.15);glasses.push({w,i})});
/* lahev, svíčka, prkénko se sýrem */
const bt=V3.makeBottle({n:"Frankovka",y:"2021",k:"Barrique · suché",glass:0x0e120b,shape:"bdx",foil:0x2a0a12,label:"cream"});bt.scale.setScalar(.31);bt.position.set(.3,TY+3.3*.31/2,-.48);bt.rotation.y=-.2;scene.add(bt);
const candle=new T.Mesh(new T.CylinderGeometry(.05,.052,.26,32),new T.MeshStandardMaterial({color:0xf3ead6,roughness:.6,emissive:0x3a2008,emissiveIntensity:.3}));candle.position.set(-.38,TY+.13,-.36);scene.add(candle);
const holder=new T.Mesh(new T.CylinderGeometry(.09,.1,.03,32),V3.mIron);holder.position.set(-.38,TY+.015,-.36);scene.add(holder);
const flame=new T.Mesh(new T.SphereGeometry(.022,16,12),new T.MeshBasicMaterial({color:0xffd27a}));flame.scale.set(1,2.1,1);flame.position.set(-.38,TY+.31,-.36);scene.add(flame);
const halo=new T.Sprite(new T.SpriteMaterial({map:(()=>{const c=document.createElement("canvas");c.width=c.height=128;const x=c.getContext("2d"),g=x.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,"rgba(255,200,120,.9)");g.addColorStop(.3,"rgba(255,150,60,.35)");g.addColorStop(1,"rgba(255,120,40,0)");x.fillStyle=g;x.fillRect(0,0,128,128);return new T.CanvasTexture(c)})(),blending:T.AdditiveBlending,depthWrite:false,transparent:true}));
halo.scale.setScalar(.55);halo.position.copy(flame.position);scene.add(halo);candleL.position.set(-.38,TY+.4,-.3);
const board=new T.Mesh(new T.BoxGeometry(.42,.03,.24),new T.MeshStandardMaterial({map:V3.woodTex(4,"#b98a55","#5a3a1c"),roughness:.6}));board.position.set(-.05,TY+.015,-.05);board.rotation.y=.4;scene.add(board);
const cheese=new T.Mesh(new T.CylinderGeometry(.09,.09,.07,3,1,false,0,Math.PI*2),new T.MeshStandardMaterial({color:lin(0xf0c860),roughness:.55}));cheese.position.set(-.12,TY+.065,-.08);cheese.rotation.y=1;scene.add(cheese);
const grp=new T.InstancedMesh(new T.SphereGeometry(1,16,12),new T.MeshPhysicalMaterial({color:lin(0x3a0c2a),roughness:.35,clearcoat:.6}),9);[[0,0,0],[.05,0,.01],[-.05,0,0],[.025,0,.045],[-.025,0,.045],[0,.042,.02],[.03,.042,-.02],[-.03,.04,-.015],[0,.08,0]].forEach((q,i)=>{const m=new T.Matrix4().compose(new T.Vector3(.08+q[0],TY+.06+q[1],.02+q[2]),new T.Quaternion(),new T.Vector3(.03,.03,.03));grp.setMatrixAt(i,m)});scene.add(grp);
/* render */
function size(){const w=box.clientWidth,h=box.clientHeight;R.setPixelRatio(Math.min(devicePixelRatio||1,1.75));R.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()}
addEventListener("resize",size);size();
let fillS=0,lt=0;const items=[...document.querySelectorAll("#degustace .list > div")];
(function tick(t){const dt=Math.min(500,t-lt);lt=t;const r=box.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight){
 const u=cl((innerHeight-r.top)/(innerHeight+r.height*.4));fillS+=(u-fillS)*(1-Math.pow(.92,dt/16.7));
 const ang=t*.00012+Math.sin(t*.0003)*.1,d=cam.aspect<.7?4.6:4.1;cam.position.set(Math.sin(ang)*d,2.75,Math.cos(ang)*d);cam.lookAt(0,.62,0);
 glasses.forEach(g=>{const f=ss((fillS-.32-g.i*.07)/.1);g.w.scale.set(1,Math.max(.001,f*(1+Math.sin(t*.004+g.i)*.015)),1);g.w.visible=f>.01});
 const fl=.85+.15*Math.sin(t*.013)*Math.sin(t*.021+1);candleL.intensity=2*fl;flame.scale.set(1,2*fl,1);halo.material.opacity=.8*fl;
 const nn=glasses.filter(g=>ss((fillS-.32-g.i*.07)/.1)>.5).length;items.forEach((el,k)=>el.classList.toggle("lit",k===0?fillS>.2:k===1?nn>0:nn>=6));
 R.render(scene,cam)}requestAnimationFrame(tick)})(0);
})();
