/* Bleach Dent – 3D zub (SDF povrch převzatý z ukázky Brom&Dent) ve světlém studiu.
   Scroll mění odstín skloviny od A3,5 po bělený odstín; kurzor zubem jemně natáčí. */
(function(){
const cv=document.getElementById('tooth');if(!cv||!window.THREE)return;
const MOBILE=matchMedia('(max-width: 760px)').matches||matchMedia('(pointer: coarse)').matches;
const calm=matchMedia('(prefers-reduced-motion: reduce)').matches;
let R;try{R=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true})}catch(e){document.documentElement.classList.add('nogl');return}
R.setPixelRatio(Math.min(devicePixelRatio,MOBILE?1.6:2));R.outputEncoding=THREE.sRGBEncoding;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=.82;
const S=new THREE.Scene(),C=new THREE.PerspectiveCamera(30,1,.1,100);
  function toothGeo(step){
    const smin=(a,b,k)=>{const h=Math.max(k-Math.abs(a-b),0)/k;return Math.min(a,b)-h*h*k*.25};
    const sph=(x,y,z,cx,cy,cz,r)=>Math.hypot(x-cx,y-cy,z-cz)-r;
    const rbox=(x,y,z,cx,cy,cz,bx,by,bz,r)=>{const qx=Math.abs(x-cx)-bx+r,qy=Math.abs(y-cy)-by+r,qz=Math.abs(z-cz)-bz+r;
      return Math.hypot(Math.max(qx,0),Math.max(qy,0),Math.max(qz,0))+Math.min(Math.max(qx,qy,qz),0)-r};
    const rcone=(px,py,pz,A,B,r1,r2)=>{ // zaoblený kužel (kořen)
      const bx=B[0]-A[0],by=B[1]-A[1],bz=B[2]-A[2],ax=px-A[0],ay=py-A[1],az=pz-A[2];
      const l2=bx*bx+by*by+bz*bz,rr=r1-r2,a2=l2-rr*rr,il2=1/l2,yv=ax*bx+ay*by+az*bz,zv=yv-l2;
      const qx=ax*l2-bx*yv,qy=ay*l2-by*yv,qz=az*l2-bz*yv,x2=qx*qx+qy*qy+qz*qz,y2=yv*yv*l2,z2=zv*zv*l2,k=Math.sign(rr)*rr*rr*x2;
      if(Math.sign(zv)*a2*z2>k)return Math.sqrt(x2+z2)*il2-r2;
      if(Math.sign(yv)*a2*y2<k)return Math.sqrt(x2+y2)*il2-r1;
      return(Math.sqrt(x2*a2*il2)+yv*rr)*il2-r1};
    const RA=[[-.33,.12,.2],[-.6,-1.32,.36]],RB=[[.33,.12,.2],[.58,-1.32,.38]],RC=[[-.3,.1,-.22],[-.5,-1.18,-.52]],RD=[[.3,.1,-.22],[.48,-1.18,-.5]];
    const f=(x,y,z)=>{
      let c=rbox(x,y,z,0,.44,0,.68,.32,.58,.3);
      c=smin(c,sph(x,y,z,-.33,.8,.27,.42),.26);c=smin(c,sph(x,y,z,.33,.8,.27,.42),.26);
      c=smin(c,sph(x,y,z,-.33,.78,-.27,.41),.26);c=smin(c,sph(x,y,z,.33,.78,-.27,.41),.26);
      // rýhy mezi hrbolky (křížová fisura) + jemná nerovnost skloviny
      const top=Math.max(0,Math.min(1,(y-.82)/.2));
      c+=top*(.05*Math.exp(-x*x/.0035)+.05*Math.exp(-z*z/.0035));
      c+=.006*Math.sin(x*23+y*7)*Math.sin(z*21-y*5);
      let r=smin(rcone(x,y,z,RA[0],RA[1],.33,.11),rcone(x,y,z,RB[0],RB[1],.33,.11),.15);
      r=smin(r,rcone(x,y,z,RC[0],RC[1],.31,.1),.15);r=smin(r,rcone(x,y,z,RD[0],RD[1],.31,.1),.15);
      r+=.0018*Math.sin(y*30+x*9);
      return smin(c,r,.34);
    };
    const x0=-1.05,y0=-1.62,z0=-1.0,nx=Math.ceil(2.1/step)+1,ny=Math.ceil(2.95/step)+1,nz=Math.ceil(1.95/step)+1;
    const N=nx*ny*nz,val=new Float32Array(N),I=(i,j,k)=>i+nx*(j+ny*k);
    for(let k=0;k<nz;k++)for(let j=0;j<ny;j++)for(let i=0;i<nx;i++)val[I(i,j,k)]=f(x0+i*step,y0+j*step,z0+k*step);
    const gx=new Float32Array(N),gy=new Float32Array(N),gz=new Float32Array(N);
    for(let k=1;k<nz-1;k++)for(let j=1;j<ny-1;j++)for(let i=1;i<nx-1;i++){const n=I(i,j,k);gx[n]=val[n+1]-val[n-1];gy[n]=val[n+nx]-val[n-nx];gz[n]=val[n+nx*ny]-val[n-nx*ny]}
    const off=[[0,0,0],[1,0,0],[1,1,0],[0,1,0],[0,0,1],[1,0,1],[1,1,1],[0,1,1]];
    const tets=[[0,5,1,6],[0,1,2,6],[0,2,3,6],[0,3,7,6],[0,7,4,6],[0,4,5,6]];
    const P=[],Nn=[],ci=new Int32Array(8),cv=new Float32Array(8);
    const vert=(a,b,out)=>{const va=val[a],vb=val[b],t=va/(va-vb);
      const ia=a%nx,ja=((a/nx)|0)%ny,ka=(a/(nx*ny))|0,ib=b%nx,jb=((b/nx)|0)%ny,kb=(b/(nx*ny))|0;
      out.push(x0+(ia+(ib-ia)*t)*step,y0+(ja+(jb-ja)*t)*step,z0+(ka+(kb-ka)*t)*step);
      let nx_=gx[a]+(gx[b]-gx[a])*t,ny_=gy[a]+(gy[b]-gy[a])*t,nz_=gz[a]+(gz[b]-gz[a])*t;const l=Math.hypot(nx_,ny_,nz_)||1;return[nx_/l,ny_/l,nz_/l]};
    const tri=(e)=>{ // e = [[a,b],[a,b],[a,b]] hrany; zajistí správnou orientaci podle normály
      const p=[],n=[];for(const [a,b] of e)n.push(vert(a,b,p));
      const ux=p[3]-p[0],uy=p[4]-p[1],uz=p[5]-p[2],vx=p[6]-p[0],vy=p[7]-p[1],vz=p[8]-p[2];
      const fx=uy*vz-uz*vy,fy=uz*vx-ux*vz,fz=ux*vy-uy*vx;
      if(fx*(n[0][0]+n[1][0]+n[2][0])+fy*(n[0][1]+n[1][1]+n[2][1])+fz*(n[0][2]+n[1][2]+n[2][2])<0){p.push(...p.splice(3,3));n.push(n.splice(1,1)[0])}
      P.push(...p);for(const q of n)Nn.push(q[0],q[1],q[2])};
    for(let k=0;k<nz-1;k++)for(let j=0;j<ny-1;j++)for(let i=0;i<nx-1;i++){
      let mn=1e9,mx=-1e9;for(let c=0;c<8;c++){const o=off[c],n=I(i+o[0],j+o[1],k+o[2]);ci[c]=n;cv[c]=val[n];if(cv[c]<mn)mn=cv[c];if(cv[c]>mx)mx=cv[c]}
      if(mn>=0||mx<0)continue;
      for(const T of tets){
        const ins=[],out=[];for(const c of T)(cv[c]<0?ins:out).push(ci[c]);
        if(ins.length===1)tri([[ins[0],out[0]],[ins[0],out[1]],[ins[0],out[2]]]);
        else if(ins.length===3)tri([[out[0],ins[0]],[out[0],ins[1]],[out[0],ins[2]]]);
        else if(ins.length===2){tri([[ins[0],out[0]],[ins[0],out[1]],[ins[1],out[1]]]);tri([[ins[0],out[0]],[ins[1],out[1]],[ins[1],out[0]]])}
      }
    }
    // barva jako u skutečného zubu: bílá sklovina, lehce namodralé průsvitné hrany hrbolků, krémový krček, slonovinové kořeny
    const nV=P.length/3,col=new Float32Array(nV*3),uv=new Float32Array(nV*2);
    const mix=(a,b,t)=>a+(b-a)*t,cl1=t=>Math.max(0,Math.min(1,t));
    for(let v=0;v<nV;v++){const x=P[v*3],y=P[v*3+1],z=P[v*3+2];
      const tip=cl1((y-.98)/.2),neck=cl1(1-Math.abs(y-.08)/.28),root=cl1(-y/.25),apex=cl1((-y-.6)/.7);
      let r=.97,g2=.965,b=.945;
      r=mix(r,.93,tip);g2=mix(g2,.95,tip);b=mix(b,.97,tip);
      r=mix(r,.95,neck*.8);g2=mix(g2,.92,neck*.8);b=mix(b,.84,neck*.8);
      r=mix(r,.93,root);g2=mix(g2,.88,root);b=mix(b,.77,root);
      r=mix(r,.86,apex);g2=mix(g2,.79,apex);b=mix(b,.65,apex);
      const n=.008*Math.sin(x*41+z*37)*Math.cos(y*29);col[v*3]=r+n;col[v*3+1]=g2+n;col[v*3+2]=b+n;
      uv[v*2]=Math.atan2(z,x)/(2*Math.PI)+.5;uv[v*2+1]=(y+1.6)/3;}
    const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.Float32BufferAttribute(P,3));g.setAttribute("normal",new THREE.Float32BufferAttribute(Nn,3));
    g.setAttribute("color",new THREE.Float32BufferAttribute(col,3));g.setAttribute("uv",new THREE.Float32BufferAttribute(uv,2));
    g.translate(0,.2,0);return g;
  }
  function enamelTex(){ // mikrotextura: jemný šum + vodorovné růstové linie skloviny (perikymata)
    const c=document.createElement("canvas");c.width=1024;c.height=512;const x=c.getContext("2d"),img=x.createImageData(1024,512),d=img.data;
    for(let j=0;j<512;j++){const lines=(Math.sin(j*.9)*.5+.5)*(j>230?1:.25);for(let i=0;i<1024;i++){const k=(j*1024+i)*4,v=128+(Math.random()-.5)*34+lines*26;d[k]=d[k+1]=d[k+2]=v;d[k+3]=255}}
    x.putImageData(img,0,0);const t=new THREE.CanvasTexture(c);t.wrapS=THREE.RepeatWrapping;return t;
  }
// světlé studio pro odlesky
const envS=new THREE.Scene();envS.background=new THREE.Color(0x9aa2aa);
[[0xffffff,3,[0,6,2],[8,3]],[0xfff4e6,1.6,[-6,1,3],[2,6]],[0xe6f0ff,1.4,[6,0,2],[2,6]],[0xffffff,1,[0,0,7],[9,4]]].forEach(([c,i,p,s])=>{
  const m=new THREE.Mesh(new THREE.PlaneGeometry(s[0],s[1]),new THREE.MeshBasicMaterial({color:new THREE.Color(c).multiplyScalar(i),side:THREE.DoubleSide}));m.position.set(...p);m.lookAt(0,0,0);envS.add(m)});
S.environment=new THREE.PMREMGenerator(R).fromScene(envS,.02).texture;
const bump=enamelTex();
const mat=MOBILE?new THREE.MeshStandardMaterial({vertexColors:true,roughness:.24,envMapIntensity:1.1,bumpMap:bump,bumpScale:.006})
  :new THREE.MeshPhysicalMaterial({vertexColors:true,roughness:.26,clearcoat:1,clearcoatRoughness:.08,envMapIntensity:1.1,bumpMap:bump,bumpScale:.009});
const tooth=new THREE.Mesh(toothGeo(MOBILE?.05:.032),mat);const grp=new THREE.Group();grp.add(tooth);S.add(grp);
S.add(new THREE.HemisphereLight(0xffffff,0x8f877c,.3));
const key=new THREE.DirectionalLight(0xfffaf2,1.6);key.position.set(-3,4,5);S.add(key);
const rim=new THREE.DirectionalLight(0xbcd3ff,1.1);rim.position.set(4,1,-3);S.add(rim);
// odstíny (orientačně podle stupnice VITA): A3,5 → A3 → A2 → A1 → B1 → bělený
const SH=[[1,.84,.62],[1,.87,.68],[1,.9,.75],[1,.93,.82],[1,.96,.9],[1,1,1]];
window.__shade=0;window.__toothPos=window.__toothPos||{x:1.5,y:0,s:1,o:1};
let mx=0,my=0,tmx=0,tmy=0;if(!MOBILE)addEventListener('pointermove',e=>{tmx=e.clientX/innerWidth-.5;tmy=e.clientY/innerHeight-.5},{passive:true});
let W=0,H=0;function size(){W=cv.clientWidth;H=cv.clientHeight;R.setSize(W,H,false);C.aspect=W/H;C.updateProjectionMatrix()}size();addEventListener('resize',size);
let t0=performance.now(),vis=true;document.addEventListener('visibilitychange',()=>vis=!document.hidden);
const cur=new THREE.Color();
function frame(now){requestAnimationFrame(frame);if(!vis)return;const t=(now-t0)/1000;
  mx+=(tmx-mx)*.05;my+=(tmy-my)*.05;
  const sh=Math.max(0,Math.min(1,window.__shade))*(SH.length-1);const i=Math.min(SH.length-2,Math.floor(sh)),f=sh-i;
  cur.setRGB(SH[i][0]+(SH[i+1][0]-SH[i][0])*f,SH[i][1]+(SH[i+1][1]-SH[i][1])*f,SH[i][2]+(SH[i+1][2]-SH[i][2])*f);mat.color.copy(cur);
  const P=window.__toothPos,narrow=W/H<.9,idle=calm?0:Math.sin(t*.6)*.06;
  grp.rotation.set(.16+my*.25,-.55+window.__shade*Math.PI*1.1+mx*.5+idle,-.1);
  grp.position.set(narrow?0:P.x,(narrow?.95:P.y)+(calm?0:Math.sin(t*.8)*.04),0);grp.scale.setScalar(P.s);
  cv.style.opacity=P.o;
  C.position.set(0,0,narrow?10.5:8.4);C.lookAt(0,narrow?.6:0,0);R.render(S,C)}
requestAnimationFrame(frame);
})();
