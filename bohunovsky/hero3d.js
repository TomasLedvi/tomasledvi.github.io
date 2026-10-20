(function(){
const host=document.getElementById('pipes'); if(!host||!window.THREE) return;
let gl; try{gl=document.createElement('canvas').getContext('webgl')}catch(e){} if(!gl) return;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const R=new THREE.WebGLRenderer({antialias:true,alpha:true});
R.setPixelRatio(Math.min(2,window.devicePixelRatio||1));R.outputEncoding=THREE.sRGBEncoding;
R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.0;R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;
host.appendChild(R.domElement);
const S=new THREE.Scene();
const cam=new THREE.PerspectiveCamera(32,1,.1,100);
// env for copper reflections
const envScene=new THREE.Scene();envScene.background=new THREE.Color(0x3a3430);
const addPanel=(c,i,p,s)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(s[0],s[1]),new THREE.MeshBasicMaterial({color:c,side:THREE.DoubleSide}));m.position.set(...p);m.lookAt(0,0,0);m.material.color.multiplyScalar(i);envScene.add(m)};
addPanel(0xffffff,1.6,[0,6,2],[6,2]);addPanel(0xffd2a8,1.1,[-6,2,-1],[2,5]);addPanel(0xbfd8e6,.9,[6,1,3],[2,4]);addPanel(0x303a40,1,[0,-5,0],[12,12]);
const pm=new THREE.PMREMGenerator(R);const env=pm.fromScene(envScene,.04).texture;S.environment=env;
S.add(new THREE.HemisphereLight(0xffffff,0xc9d6dc,.5));
const key=new THREE.DirectionalLight(0xffffff,1.6);key.position.set(3,6,5);key.castShadow=true;key.shadow.mapSize.set(1024,1024);
Object.assign(key.shadow.camera,{left:-5,right:5,top:5,bottom:-5});key.shadow.radius=6;S.add(key);
// wall for shadows
const wall=new THREE.Mesh(new THREE.PlaneGeometry(30,30),new THREE.ShadowMaterial({opacity:.16}));wall.position.z=-.55;wall.receiveShadow=true;S.add(wall);

const copper=new THREE.MeshPhysicalMaterial({color:0x9a3f12,metalness:1,roughness:.3,clearcoat:.5,clearcoatRoughness:.25,envMapIntensity:.85});
const brass=new THREE.MeshPhysicalMaterial({color:0xc79a34,metalness:1,roughness:.3});
const rad=.13;
// pipe runs: lists of points with right-angle corners; corners get rounded by a quadratic segment
function run(pts,r=.38){const path=new THREE.CurvePath();
  for(let i=0;i<pts.length-1;i++){
    const a=new THREE.Vector3(...pts[i]),b=new THREE.Vector3(...pts[i+1]);
    const dirIn=b.clone().sub(a).normalize();
    const start=i===0?a:a.clone().add(dirIn.clone().multiplyScalar(r));
    const end=i===pts.length-2?b:b.clone().sub(dirIn.clone().multiplyScalar(r));
    path.add(new THREE.LineCurve3(start,end));
    if(i<pts.length-2){const c=new THREE.Vector3(...pts[i+2]);const dirOut=c.clone().sub(b).normalize();
      path.add(new THREE.QuadraticBezierCurve3(end,b,b.clone().add(dirOut.multiplyScalar(r))));}
  }return path;}
const runs=[
  {pts:[[-4,-1.6,0],[-1.6,-1.6,0],[-1.6,.4,0],[.6,.4,0],[.6,2.4,0],[4,2.4,0]],col:0x2a8fd6},
  {pts:[[-4,-.8,0.28],[-2.4,-.8,0.28],[-2.4,1.3,0.28],[-.3,1.3,0.28],[-.3,3.6,0.28]],col:0xe0533f},
  {pts:[[4,-1.9,0.12],[1.9,-1.9,0.12],[1.9,-.4,0.12],[3.2,-.4,0.12],[3.2,1.2,0.12],[4.5,1.2,.12]],col:0x2a8fd6},
  {pts:[[-.9,-3.5,0.4],[-.9,-.5,0.4],[1.2,-.5,0.4],[1.2,1.5,0.4]],col:0xf2c21b,gas:true},
];
const flows=[];
runs.forEach(rn=>{const path=run(rn.pts);const geo=new THREE.TubeGeometry(path,240,rn.gas?rad*1.05:rad,24,false);
  const mat=rn.gas?new THREE.MeshPhysicalMaterial({color:0xd99a00,metalness:.05,roughness:.5,clearcoat:.6}):copper;
  const m=new THREE.Mesh(geo,mat);m.castShadow=true;S.add(m);
  // fittings at every corner
  rn.pts.slice(1,-1).forEach(p=>{const f=new THREE.Mesh(new THREE.SphereGeometry(rad*1.55,24,16),rn.gas?mat:brass);f.position.set(...p);f.castShadow=true;S.add(f)});
  // flow particles: small glowing beads riding inside a slightly transparent sleeve
  const N=Math.max(3,Math.round(path.getLength()/1.6)),beads=[];const bm=new THREE.MeshStandardMaterial({color:rn.gas?0x2b2b2b:rn.col,roughness:.5});
  for(let i=0;i<N;i++){const b=new THREE.Group();const cone=new THREE.Mesh(new THREE.ConeGeometry(rad*.62,rad*1.3,3),bm);cone.position.z=rad*1.02;cone.rotation.y=Math.PI/6;b.add(cone);
    const band=new THREE.Mesh(new THREE.CylinderGeometry(rad*1.04,rad*1.04,rad*.55,24,1,true),bm);band.position.y=-rad*1.1;b.add(band);b.userData.u=i/N;S.add(b);beads.push(b)}
  flows.push({path,beads,len:path.getLength()});
});
// a valve with handle on the blue run
const valve=new THREE.Group();valve.position.set(-1.6,-.6,0);S.add(valve);
const vb=new THREE.Mesh(new THREE.CylinderGeometry(rad*2,rad*2,.5,24),brass);vb.rotation.z=0;valve.add(vb);
const stem=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,.35,12),brass);stem.position.z=.3;stem.rotation.x=Math.PI/2;valve.add(stem);
const handle=new THREE.Mesh(new THREE.BoxGeometry(.9,.12,.08),new THREE.MeshPhysicalMaterial({color:0xc62c1f,roughness:.35,clearcoat:.8}));handle.position.z=.48;handle.castShadow=true;valve.add(handle);
// clamps on wall
[[-3.2,-1.6],[2.6,2.4],[-1.6,-.2],[1.2,.9]].forEach(([x,y])=>{const c=new THREE.Mesh(new THREE.TorusGeometry(rad*1.25,.035,10,24),new THREE.MeshStandardMaterial({color:0x8d999f,metalness:.8,roughness:.4}));c.position.set(x,y,0);c.rotation.y=x>0&&y>2?Math.PI/2:0;S.add(c)});

let W=1,H=1;function size(){W=host.clientWidth;H=host.clientHeight;R.setSize(W,H,false);cam.aspect=W/H;cam.updateProjectionMatrix();
  cam.position.set(0,0,W<600?14:11.5)}
size();addEventListener('resize',size);
let mx=0,my=0;host.addEventListener('pointermove',e=>{const r=host.getBoundingClientRect();mx=(e.clientX-r.left)/r.width-.5;my=(e.clientY-r.top)/r.height-.5});
host.addEventListener('pointerleave',()=>{mx=0;my=0});
let visible=true;new IntersectionObserver(es=>{visible=es[0].isIntersecting},{threshold:0}).observe(host);
let open=0,last=performance.now(),t=0,flowU=0;
function frame(now){requestAnimationFrame(frame);if(!visible)return;const dt=Math.min(.05,(now-last)/1000);last=now;t+=dt;
  // valve opens on load, then flow speed follows scroll velocity
  open=Math.min(1,open+dt*.9);handle.rotation.z=-Math.PI/2*(1-easeOut(open));
  const vel=Math.min(3,Math.abs(window.__scrollVel||0)*.08);
  const speed=reduce?0:(.06+vel*.25)*easeOut(open);flowU+=dt*speed;
  flows.forEach(f=>f.beads.forEach(b=>{const u=(b.userData.u+flowU*(3/f.len))%1;const p=f.path.getPointAt(u);b.position.copy(p);
    const tg=f.path.getTangentAt(u);b.quaternion.setFromUnitVectors(UP,tg)}));
  cam.position.x+=((mx*1.4)-cam.position.x)*.05;cam.position.y+=((-my*1.0+.2)-cam.position.y)*.05;cam.lookAt(0,.2,0);
  R.render(S,cam);}
const UP=new THREE.Vector3(0,1,0);function easeOut(x){return 1-Math.pow(1-x,3)}
requestAnimationFrame(frame);
})();
