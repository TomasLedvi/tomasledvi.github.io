(function(){
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
gsap.registerPlugin(ScrollTrigger);
let lenis=null;
if(!reduce && window.Lenis){
  lenis = new Lenis({lerp:.11});
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t=>lenis.raf(t*1000)); gsap.ticker.lagSmoothing(0);
  document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const id=a.getAttribute('href');if(id.length>1){e.preventDefault();lenis.scrollTo(id,{offset:-70})}}));
}
window.__scrollVel = 0;
if(lenis) lenis.on('scroll', e=>{window.__scrollVel = e.velocity||0});

/* ---------- hero entrance */
if(!reduce){
  const tl = gsap.timeline({defaults:{ease:'power3.out'}});
  tl.from('.hero .label',{y:14,opacity:0,duration:.6}).from('.hero h1', {y:40, opacity:0, duration:1.1},'-=.3')
    .from('.hero .lead', {y:24, opacity:0, duration:.7}, '-=.55')
    .from('.ctas .btn', {y:16, opacity:0, duration:.5, stagger:.08}, '-=.45')
    .from('.free li', {x:-12, opacity:0, duration:.45, stagger:.08}, '-=.3');
}

/* ---------- manifold */
const NS='http://www.w3.org/2000/svg';
const outs=[['voda','Voda','#3d9be0',140],['topeni','Topení','#e0533f',300],['plyn','Plyn','#e2b400',460]];
const g=document.getElementById('outlets');
const mk=(tag,attrs,parent)=>{const e=document.createElementNS(NS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);(parent||g).appendChild(e);return e};
const fills={};
outs.forEach(([id,label,col,x])=>{
  mk('rect',{x:x-18,y:100,width:36,height:250,rx:18,fill:'url(#cuv)'});
  const f=mk('rect',{x:x-7,y:110,width:14,height:0,rx:7,fill:col});fills[id]=f;
  mk('rect',{x:x-30,y:120,width:60,height:30,rx:6,fill:'url(#brass)'});
  mk('rect',{x:x-26,y:330,width:52,height:34,rx:6,fill:'url(#brass)'});
  // valve
  const v=mk('g',{class:'valve',role:'button',tabindex:'0','aria-label':'Otevřít '+label,'aria-pressed':'false','data-id':id});
  mk('circle',{class:'ring',cx:x,cy:170,r:24,fill:'url(#brass)',stroke:'#7a5c18','stroke-width':2},v);
  const h=mk('g',{class:'handle'},v);
  mk('rect',{x:x-8,y:110,width:16,height:60,rx:8,fill:col},h);
  mk('circle',{cx:x,cy:170,r:9,fill:'#5d4512'},v);
  const t=mk('text',{x:x,y:400,'text-anchor':'middle'},v);t.textContent=label;
});
const valves=[...document.querySelectorAll('.valve')], tabs=[...document.querySelectorAll('.tab')];
function openOutlet(id, animate=true){
  valves.forEach(v=>v.setAttribute('aria-pressed', String(v.dataset.id===id)));
  tabs.forEach(t=>{const on=t.id==='t-'+id;t.setAttribute('aria-selected',String(on));t.tabIndex=on?0:-1});
  document.querySelectorAll('.panel').forEach(p=>p.hidden = p.id!=='p-'+id);
  const col = outs.find(o=>o[0]===id)[2];
  const x = outs.find(o=>o[0]===id)[3];
  const head=document.getElementById('flowHead');
  head.setAttribute('fill', col);
  const dur = (reduce||!animate)?0:.6;
  gsap.to(head,{attr:{width:x-34+10},duration:dur,ease:'power2.inOut'});
  Object.entries(fills).forEach(([k,f])=>gsap.to(f,{attr:{height:k===id?225:0},duration:k===id?dur*1.2:dur*.5,delay:k===id?dur*.8:0,ease:'power2.out'}));
  if(animate && !reduce) gsap.from('#p-'+id+' li',{x:-14,opacity:0,stagger:.06,duration:.4,delay:.15,ease:'power2.out'});
}
valves.forEach(v=>{v.addEventListener('click',()=>openOutlet(v.dataset.id));v.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openOutlet(v.dataset.id)}})});
tabs.forEach((t,i)=>{t.addEventListener('click',()=>openOutlet(t.id.slice(2)));
  t.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){const n=tabs[(i+(e.key==='ArrowRight'?1:tabs.length-1))%tabs.length];n.focus();openOutlet(n.id.slice(2))}})});
openOutlet('voda', false);
ScrollTrigger.create({trigger:'.manifold',start:'top 70%',once:true,onEnter:()=>openOutlet('voda',true)});

/* ---------- bathroom: tiles */
const s3=document.getElementById('s3');
for(let y=60;y<330;y+=34)for(let x=60;x<580;x+=34){const r=document.createElementNS(NS,'rect');
  r.setAttribute('x',x+1);r.setAttribute('y',y+1);r.setAttribute('width',Math.min(32,580-x-1));r.setAttribute('height',Math.min(32,330-y-1));r.setAttribute('class','tile');s3.appendChild(r)}
for(let x=60;x<580;x+=58){const r=document.createElementNS(NS,'rect');r.setAttribute('x',x+1);r.setAttribute('y',331);r.setAttribute('width',Math.min(56,580-x-1));r.setAttribute('height',68);r.setAttribute('class','tile');r.style.fill='#3a4146';s3.appendChild(r)}
// draw-on prep
const lines=[...document.querySelectorAll('#s1 path,#s1 rect,#s2 path')];
lines.forEach(p=>{const L=p.getTotalLength?p.getTotalLength():400;p.style.strokeDasharray=L;p.style.strokeDashoffset=L;p.dataset.len=L});
const stages=[...document.querySelectorAll('.stage')], bars=[...document.querySelectorAll('.progress b')];
const tiles=[...s3.children], fx=[...document.querySelectorAll('#s4 > *')];
gsap.set(tiles,{opacity:0,scale:.6,transformOrigin:'50% 50%'});gsap.set(fx,{opacity:0,y:-24});
gsap.set('#s1 text',{opacity:0});
if(reduce){
  lines.forEach(p=>p.style.strokeDashoffset=0);gsap.set([tiles,fx,'#s1 text'],{opacity:1,scale:1,y:0});
}else{
  const mm = gsap.matchMedia();
  mm.add({desk:'(min-width: 901px)', mob:'(max-width: 900px)'}, ctx=>{
    const tl=gsap.timeline({scrollTrigger:{trigger:'.bath',start:ctx.conditions.desk?'top top':'top 10%',end:'+=2600',scrub:.8,pin:ctx.conditions.desk}});
    const show=(i,at)=>{if(i>0)tl.to(stages[i-1],{opacity:0,y:-16,duration:.18},at);tl.fromTo(stages[i],{opacity:0,y:16},{opacity:1,y:0,duration:.25,immediateRender:false},at+.16);tl.to(bars[i],{scaleX:1,duration:1,ease:'none'},at)};
    show(0,0);
    tl.to(document.querySelectorAll('#s1 path,#s1 rect'),{strokeDashoffset:0,duration:.8,stagger:.08},0).to('#s1 text',{opacity:1,duration:.3,stagger:.06},.5);
    show(1,1.2);
    tl.to('#s1',{opacity:.25,duration:.3},1.2).to(document.querySelectorAll('#s2 path'),{strokeDashoffset:0,duration:.9,stagger:.07,ease:'none'},1.3);
    show(2,2.4);
    tl.to(tiles,{opacity:1,scale:1,duration:.5,stagger:{each:.004,from:'start',grid:'auto'}},2.5).to('#s2',{opacity:.15,duration:.4},2.9).to('#s1',{opacity:0,duration:.3},2.6);
    show(3,3.6);
    tl.to(fx,{opacity:1,y:0,duration:.35,stagger:.06,ease:'back.out(1.6)'},3.7).to({},{duration:.4});
  });
}

/* ---------- reveals */
if(!reduce){
  gsap.utils.toArray('section h2, section .label').forEach(el=>gsap.from(el,{y:30,opacity:0,duration:.8,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 85%'}}));
  ScrollTrigger.batch('.frames div',{start:'top 88%',onEnter:b=>gsap.from(b,{y:30,opacity:0,stagger:.08,duration:.6,ease:'power2.out'})});
  gsap.from('.phone',{y:30,opacity:0,stagger:.12,duration:.7,ease:'power3.out',scrollTrigger:{trigger:'.c-grid',start:'top 80%'}});
}

/* ---------- nápověda ke kohoutu */
const hint=document.getElementById('hint');let hintDone=false;
document.addEventListener('valve',()=>{hintDone=true;hint.style.opacity=0});
setTimeout(()=>{(function loop(){if(hintDone){hint.style.opacity=0;return}const v=window.__bgValveScreen&&window.__bgValveScreen();
  if(v&&v.vis&&scrollY<innerHeight*.4&&innerWidth>900){hint.style.opacity=1;hint.style.transform=`translate(${v.x-hint.offsetWidth/2}px,${v.y-hint.offsetHeight-38}px)`}else hint.style.opacity=0;
  requestAnimationFrame(loop)})()},2600);
window.addEventListener('load',()=>ScrollTrigger.refresh());

/* ---------- form (demo) */
document.getElementById('f').addEventListener('submit',e=>{e.preventDefault();document.getElementById('fm').textContent='Tohle je ukázka webu, zpráva se zatím nikam neodešle. Na hotovém webu dorazí panu Bohuňovskému rovnou do e-mailu.'});
})();
