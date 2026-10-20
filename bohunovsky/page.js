(function(){
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
gsap.registerPlugin(ScrollTrigger);
let lenis=null;
if(!reduce && window.Lenis){
  lenis = new Lenis({lerp:.1});
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t=>lenis.raf(t*1000)); gsap.ticker.lagSmoothing(0);
  document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const id=a.getAttribute('href');if(id.length>1){e.preventDefault();lenis.scrollTo(id,{offset:id==='#koupelny'?0:-70,duration:1.8})}}));
}
window.__scrollVel = 0;
if(lenis) lenis.on('scroll', e=>{window.__scrollVel = e.velocity||0});

/* ---------- úvod hrdiny (po rentgenovém průletu) */
let heroDone=false;
function heroIn(){if(heroDone)return;heroDone=true;if(lenis)lenis.start();
  if(reduce)return;
  const tl=gsap.timeline({defaults:{ease:'power3.out'}});
  tl.from('nav',{y:-20,opacity:0,duration:.7}).from('.hero .label',{y:14,opacity:0,duration:.6},'-=.4').from('.hero h1',{y:40,opacity:0,duration:1.1},'-=.3')
    .from('.hero .lead',{y:24,opacity:0,duration:.7},'-=.55').from('.ctas .btn',{y:16,opacity:0,duration:.5,stagger:.08},'-=.45').from('.free li',{x:-12,opacity:0,duration:.45,stagger:.08},'-=.3');}
document.addEventListener('intro-done',heroIn);
if(window.__introPending){if(lenis)lenis.stop()}else heroIn();
setTimeout(()=>{if(!heroDone)document.dispatchEvent(new Event('intro-skip'))},12000);
setTimeout(()=>{if(!heroDone){document.documentElement.classList.remove('intro');heroIn()}},20000);

/* ---------- služby: záložky + ventily ve 3D */
const tabs=[...document.querySelectorAll('.tab')];
function openOutlet(id, animate=true){
  tabs.forEach(t=>{const on=t.id==='t-'+id;t.setAttribute('aria-selected',String(on));t.tabIndex=on?0:-1});
  document.querySelectorAll('.panel').forEach(p=>p.hidden = p.id!=='p-'+id);
  document.dispatchEvent(new CustomEvent('outlet',{detail:id}));
  if(animate && !reduce) gsap.from('#p-'+id+' li',{x:-14,opacity:0,stagger:.06,duration:.4,delay:.1,ease:'power2.out'});
}
tabs.forEach((t,i)=>{t.addEventListener('click',()=>openOutlet(t.id.slice(2)));
  t.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){const n=tabs[(i+(e.key==='ArrowRight'?1:tabs.length-1))%tabs.length];n.focus();openOutlet(n.id.slice(2))}})});
document.addEventListener('outlet-pick',e=>openOutlet(e.detail));
openOutlet('voda', false);

/* ---------- koupelna: připnutá sekce, postup řídí 3D stavbu */
const stages=[...document.querySelectorAll('.stage-t')], bars=[...document.querySelectorAll('.progress b')];
const cuts=[0,.27,.5,.75,1];
let cur=0;
function setBath(p){window.dispatchEvent(new CustomEvent('bathp',{detail:p}));
  bars.forEach((b,i)=>b.style.transform=`scaleX(${Math.min(1,Math.max(0,(p-cuts[i])/(cuts[i+1]-cuts[i])))})`);
  let n=0;for(let k=0;k<4;k++)if(p>=cuts[k])n=k;
  if(n!==cur){const a=stages[cur],b=stages[n];cur=n;if(reduce){stages.forEach(s=>s.style.opacity=0);b.style.opacity=1;return}
    gsap.to(a,{opacity:0,y:-14,duration:.25,overwrite:true});gsap.fromTo(b,{opacity:0,y:14},{opacity:1,y:0,duration:.4,delay:.12,overwrite:true})}}
ScrollTrigger.create({trigger:'.bath',start:'top top',end:()=>'+='+Math.round(innerHeight*(innerWidth<900?3.6:3.2)),pin:true,scrub:true,anticipatePin:1,onUpdate:s=>setBath(s.progress)});
setBath(0);

/* ---------- odhalování */
if(!reduce){
  gsap.utils.toArray('section h2, section .label').forEach(el=>{if(el.closest('.bath'))return;gsap.from(el,{y:30,opacity:0,duration:.8,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 88%'}})});
  gsap.utils.toArray('.sec .card').forEach(el=>gsap.from(el,{y:50,opacity:0,duration:.9,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 90%'}}));
  ScrollTrigger.batch('.frames div',{start:'top 90%',onEnter:b=>gsap.from(b,{y:30,opacity:0,stagger:.08,duration:.6,ease:'power2.out'})});
}

/* ---------- nápověda ke kohoutu */
const hint=document.getElementById('hint');let hintDone=false;
document.addEventListener('valve',()=>{hintDone=true;hint.style.opacity=0});
function hintLoop(){setTimeout(()=>{(function loop(){if(hintDone){hint.style.opacity=0;return}const v=window.__bgValveScreen&&window.__bgValveScreen();
  if(v&&v.vis&&scrollY<innerHeight*.4&&innerWidth>900){hint.style.opacity=1;hint.style.transform=`translate(${v.x-hint.offsetWidth/2}px,${v.y-hint.offsetHeight-38}px)`}else hint.style.opacity=0;
  requestAnimationFrame(loop)})()},2200)}
if(window.__introPending)document.addEventListener('intro-done',hintLoop);else hintLoop();
window.addEventListener('load',()=>ScrollTrigger.refresh());

/* ---------- formulář (ukázka) */
document.getElementById('f').addEventListener('submit',e=>{e.preventDefault();document.getElementById('fm').textContent='Tohle je ukázka webu, zpráva se zatím nikam neodešle. Na hotovém webu dorazí panu Bohuňovskému rovnou do e-mailu.'});
})();
