/* Sledování zakázky – společné jádro pro všechny firmy.
   Data: v ukázce v prohlížeči (localStorage) a mezi okny se přenášejí přes BroadcastChannel.
   U ostrého nasazení se vymění jen objekt STORE za napojení na databázi (např. Supabase), zbytek zůstává. */
(function(){
const qs=new URLSearchParams(location.search);
const firmaId=(qs.get('f')||'kanocar').replace(/[^a-z0-9-]/g,'');
const LS='sledovani:'+firmaId;

/* ---------- úložiště */
const bc='BroadcastChannel' in window?new BroadcastChannel('sledovani'):null;
const listeners=[];
const STORE={
  load(){try{return JSON.parse(localStorage.getItem(LS))}catch(e){return null}},
  save(db,why){try{localStorage.setItem(LS,JSON.stringify(db))}catch(e){alert('Úložiště v prohlížeči je plné, smažte prosím některé fotky.');return}
    if(bc)bc.postMessage({f:firmaId,why});listeners.forEach(fn=>fn(db,why))},
  on(fn){listeners.push(fn)}
};
function external(why){const db=STORE.load();if(db)listeners.forEach(fn=>fn(db,why))}
if(bc)bc.onmessage=e=>{if(e.data&&e.data.f===firmaId)external(e.data.why)};
addEventListener('storage',e=>{if(e.key===LS)external('storage')});

/* ---------- ukázková data */
function seed(F){const now=Date.now(),H=3600e3,D=24*H;
  const db={zakazky:F.ukazka.zakazky.map((z,zi)=>{
    const hist=[];for(let i=0;i<=z.krok;i++){const d=new Date(now-(z.krok-i)*D*.6-zi*H*3);d.setHours(8+((i*3+zi)%8),(i*17+7)%60,0,0);hist.push({krok:i,cas:Math.min(d.getTime(),now-H),foto:F.ukazka.fotky[F.kroky[i].k]||null,ukazka:true})}
    hist.sort((a,b)=>a.krok-b.krok);for(let i=1;i<hist.length;i++)if(hist[i].cas<=hist[i-1].cas)hist[i].cas=hist[i-1].cas+H*2;
    const pr=new Date(now+z.predani*D*.5);while(pr.getDay()===0||pr.getDay()===6)pr.setDate(pr.getDate()+1);pr.setHours(15,0,0,0);
    return {kod:z.kod,predmet:z.predmet,detail:z.detail,jmeno:z.jmeno,krok:z.krok,historie:hist,vzkaz:z.vzkaz||'',vzkazCas:z.vzkaz?now-H*5:0,predani:pr.toISOString().slice(0,10)}})};
  return db}
function ensure(F){let db=STORE.load();if(!db||!db.zakazky||!db.zakazky.length){db=seed(F);STORE.save(db,'seed')}return db}
function reset(F){const db=seed(F);STORE.save(db,'reset');return db}

/* ---------- pomocné */
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const dny=['neděle','pondělí','úterý','středa','čtvrtek','pátek','sobota'];
function kdy(t){const d=new Date(t),n=new Date();const hm=d.toLocaleTimeString('cs-CZ',{hour:'numeric',minute:'2-digit'});
  const dd=Math.round((new Date(n.toDateString())-new Date(d.toDateString()))/864e5);
  return dd===0?'dnes '+hm:dd===1?'včera '+hm:d.getDate()+'. '+(d.getMonth()+1)+'. '+hm}
function datum(iso){if(!iso)return '';const d=new Date(iso+'T12:00');return dny[d.getDay()]+' '+d.getDate()+'. '+(d.getMonth()+1)+'.'}
function media(src,cls){if(!src)return '';cls=cls||'';
  if(/\.mp4/.test(src))return '<video class="'+cls+'" src="'+esc(src)+'" muted playsinline preload="auto" aria-hidden="true"></video>';
  return '<img class="'+cls+'" src="'+esc(src)+'" alt="" loading="lazy">'}
function theme(F){const r=document.documentElement.style;r.setProperty('--brand',F.barva);r.setProperty('--brand2',F.barva2);r.setProperty('--disp',F.pismoNadpisu+',system-ui,sans-serif');
  if(F.pismaUrl&&!document.querySelector('link[data-f]')){const l=document.createElement('link');l.rel='stylesheet';l.href=F.pismaUrl;l.dataset.f=1;document.head.appendChild(l)}}
function toast(html){let t=document.querySelector('.toast');if(!t){t=document.createElement('div');t.className='toast';t.setAttribute('role','status');document.body.appendChild(t)}
  t.innerHTML=html;t.classList.remove('on');void t.offsetWidth;t.classList.add('on');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('on'),4200)}
function lastPhoto(z){for(let i=z.historie.length-1;i>=0;i--)if(z.historie[i].foto)return z.historie[i].foto;return null}
function shrink(file){return new Promise((res,rej)=>{const img=new Image();img.onload=()=>{const s=Math.min(1,1000/Math.max(img.width,img.height));const c=document.createElement('canvas');
  c.width=Math.round(img.width*s);c.height=Math.round(img.height*s);c.getContext('2d').drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(img.src);res(c.toDataURL('image/jpeg',.72))};
  img.onerror=rej;img.src=URL.createObjectURL(file)})}

/* ================= zákazník ================= */
function zakaznik(F){
  const kod=qs.get('z');const root=document.getElementById('app');let prevKrok=null,prevVzkaz=null;
  function render(db,why){
    const z=db.zakazky.find(x=>x.kod===kod)||db.zakazky[0];if(!z){root.innerHTML='<p class="empty">Zakázka nenalezena.</p>';return}
    const n=F.kroky.length,k=z.krok,K=F.kroky[k],done=k===n-1,pct=Math.round(k/(n-1)*100);
    const changed=prevKrok!==null&&prevKrok!==k;const msgNew=prevVzkaz!==null&&z.vzkaz&&z.vzkaz!==prevVzkaz;
    const foto=lastPhoto(z);
    root.innerHTML=`
    <header class="top"><div><b class="brand">${esc(F.nazev)}</b><span>${esc(F.podnazev)}</span></div><span class="live"><i></i>Živě</span></header>
    <section class="hero${changed?' new':''}">
      <div class="ph">${media(foto,'phm')}<div class="tag">${esc(K.nazev)}</div></div>
      <p class="sub">${esc(F.predmet)} · ${esc(z.kod)}</p>
      <h1>${esc(z.predmet)}</h1>
      <p class="det">${esc(z.detail)}</p>
    </section>
    <section class="now${done?' done':''}">
      <p class="lbl">${done?'Hotovo':'Právě děláme'}</p>
      <h2>${esc(K.nazev)}</h2>
      <p>${esc(K.popis)}</p>
      <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}" aria-label="Postup zakázky">${F.kroky.map((s,i)=>`<i class="${i<k?'ok':i===k?'cur':''}"></i>`).join('')}</div>
      <div class="meta"><span>Krok ${k+1} z ${n}</span><span>${done?'Připraveno k předání':'Předání plánujeme '+esc(datum(z.predani))}</span></div>
      ${done?`<a class="btn big" href="tel:${F.telefon}">Domluvit vyzvednutí</a><p class="small">Otevřeno ${esc(F.oteviraci)}, ${esc(F.adresa)}</p>`:''}
    </section>
    ${z.vzkaz?`<section class="msg${msgNew?' new':''}"><p class="lbl">Vzkaz z dílny · ${esc(kdy(z.vzkazCas))}</p><p>${esc(z.vzkaz)}</p></section>`:''}
    <section class="tl"><h3>Průběh</h3><ol>${F.kroky.map((s,i)=>{const h=[...z.historie].reverse().find(x=>x.krok===i);
      return `<li class="${i<k?'ok':i===k?'cur':'todo'}"><i></i><div><b>${esc(s.nazev)}</b>${h?`<span>${esc(kdy(h.cas))}</span>`:''}${i<=k&&h&&h.foto?`<button class="th" data-src="${esc(h.foto)}" aria-label="Zvětšit fotku: ${esc(s.nazev)}">${media(h.foto)}</button>`:''}</div></li>`}).join('')}</ol></section>
    <section class="act"><a class="btn" href="tel:${F.telefon}">Zavolat ${esc(F.telefonText)}</a><a class="btn ghost" href="${esc(F.mapa)}" target="_blank" rel="noopener">Navigovat</a></section>
    <p class="foot">Stránku nemusíte obnovovat, změny se objeví samy.</p>`;
    root.querySelectorAll('video').forEach(v=>{v.addEventListener('loadeddata',()=>{try{const t=parseFloat((v.getAttribute('src').split('#t=')[1])||0);if(t)v.currentTime=t}catch(e){}},{once:true})});
    root.querySelectorAll('.th').forEach(b=>b.addEventListener('click',()=>lightbox(b.dataset.src)));
    if(changed){toast(`<b>${esc(K.nazev)}</b> ${done?'Auto je hotové!':'Zakázka se posunula.'}`);if(done)celebrate()}
    else if(msgNew)toast('<b>Nový vzkaz z dílny</b>');
    prevKrok=k;prevVzkaz=z.vzkaz;
    document.title=K.nazev+' · '+z.predmet+' · '+F.nazev;
  }
  STORE.on(render);render(ensure(F));
}
function lightbox(src){const d=document.createElement('div');d.className='lb';d.innerHTML=media(src,'lbm')+'<button aria-label="Zavřít">×</button>';document.body.appendChild(d);
  const v=d.querySelector('video');if(v){v.controls=false;v.addEventListener('loadeddata',()=>{const t=parseFloat(src.split('#t=')[1]||0);if(t)v.currentTime=t},{once:true})}
  d.addEventListener('click',()=>d.remove());requestAnimationFrame(()=>d.classList.add('on'))}
function celebrate(){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;const c=document.createElement('div');c.className='drops';
  for(let i=0;i<28;i++){const s=document.createElement('i');s.style.left=Math.random()*100+'%';s.style.animationDelay=(Math.random()*.6)+'s';s.style.animationDuration=(1.6+Math.random()*1.2)+'s';s.style.transform='scale('+(0.6+Math.random()*.9)+')';c.appendChild(s)}
  document.body.appendChild(c);setTimeout(()=>c.remove(),3600)}

/* ================= dílna ================= */
function dilna(F){
  const root=document.getElementById('app');let sel=qs.get('z');let view=sel?'detail':'list';
  function link(z){return new URL('zakaznik.html?f='+firmaId+'&z='+encodeURIComponent(z.kod),location.href).href}
  function render(db){
    if(view==='list'||!db.zakazky.find(x=>x.kod===sel)){view='list';
      root.innerHTML=`<header class="top"><div><b class="brand">${esc(F.nazev)}</b><span>Dílna · zakázky</span></div><button class="ico" id="nova" aria-label="Nová zakázka">+</button></header>
      <ul class="list">${db.zakazky.map(z=>{const K=F.kroky[z.krok];return `<li><button data-k="${esc(z.kod)}"><span class="pm">${media(lastPhoto(z))}</span><span class="tx"><b>${esc(z.predmet)}</b><span>${esc(z.kod)} · ${esc(K.nazev)}</span>
        <span class="mini">${F.kroky.map((s,i)=>`<i class="${i<=z.krok?'ok':''}"></i>`).join('')}</span></span></button></li>`}).join('')}</ul>
      <div class="newf" hidden><h3>Nová zakázka</h3><label>${esc(F.predmet)}<input name="p" placeholder="Např. Škoda Fabia"></label><label>Co se dělá<input name="d" placeholder="Např. levé dveře"></label>
        <label>Jméno zákazníka<input name="j"></label><label>Předání<input name="t" type="date"></label><button class="btn" id="zal">Založit a poslat odkaz</button></div>`;
      root.querySelectorAll('[data-k]').forEach(b=>b.addEventListener('click',()=>{sel=b.dataset.k;view='detail';render(STORE.load())}));
      const nf=root.querySelector('.newf');root.querySelector('#nova').addEventListener('click',()=>{nf.hidden=!nf.hidden;if(!nf.hidden)nf.querySelector('input').focus()});
      root.querySelector('#zal').addEventListener('click',()=>{const v=n=>nf.querySelector(`[name=${n}]`).value.trim();if(!v('p')){nf.querySelector('[name=p]').focus();return}
        const db=STORE.load();const kod=(F.id==='kanocar'?'KC-':'ZK-')+String(Math.floor(1000+Math.random()*9000));
        db.zakazky.unshift({kod,predmet:v('p'),detail:v('d'),jmeno:v('j'),krok:0,historie:[{krok:0,cas:Date.now(),foto:null}],vzkaz:'',vzkazCas:0,predani:v('t')||new Date(Date.now()+3*864e5).toISOString().slice(0,10)});
        STORE.save(db,'new');sel=kod;view='detail';render(STORE.load());share(db.zakazky[0])});
      return}
    const z=db.zakazky.find(x=>x.kod===sel),n=F.kroky.length,k=z.krok,K=F.kroky[k],N=F.kroky[k+1];
    root.innerHTML=`<header class="top"><button class="ico" id="zpet" aria-label="Zpět na seznam">‹</button><div><b class="brand">${esc(z.predmet)}</b><span>${esc(z.kod)} · ${esc(z.jmeno||'')}</span></div><button class="ico" id="sdil" aria-label="Poslat odkaz zákazníkovi">↗</button></header>
    <section class="dnow">${media(lastPhoto(z),'phm')}<div><p class="lbl">Teď</p><h2>${esc(K.nazev)}</h2></div></section>
    <div class="bar${N?'':' done'}">${F.kroky.map((s,i)=>`<i class="${i<k?'ok':i===k?'cur':''}"></i>`).join('')}</div>
    ${N?`<button class="btn big next" id="dal"><small>Posunout na</small>${esc(N.nazev)}</button>`:`<p class="fin">Zakázka je hotová. Zákazník vidí „${esc(K.nazev)}“.</p>`}
    <label class="btn ghost photo">Přidat fotku<input type="file" accept="image/*" capture="environment" hidden></label>
    <div class="box"><label>Vzkaz zákazníkovi<textarea id="vz" rows="3" placeholder="Např. díl dorazil, lakujeme zítra.">${esc(z.vzkaz)}</textarea></label><button class="btn ghost" id="ulozit">Poslat vzkaz</button></div>
    <div class="box row"><label>Předání<input type="date" id="pred" value="${esc(z.predani)}"></label>${k>0?'<button class="link" id="zpetkrok">Vrátit o krok</button>':''}</div>
    <p class="small">Odkaz pro zákazníka: <a href="${esc(link(z))}" target="_blank" rel="noopener">${esc(z.kod)}</a></p>`;
    root.querySelector('#zpet').addEventListener('click',()=>{view='list';render(STORE.load())});
    root.querySelector('#sdil').addEventListener('click',()=>share(z));
    const dal=root.querySelector('#dal');if(dal)dal.addEventListener('click',()=>{const db=STORE.load(),zz=db.zakazky.find(x=>x.kod===sel);zz.krok++;
      zz.historie.push({krok:zz.krok,cas:Date.now(),foto:(F.ukazka.fotky||{})[F.kroky[zz.krok].k]||null,ukazka:true});STORE.save(db,'krok');
      if(navigator.vibrate)navigator.vibrate(30);toast(`Zákazník teď vidí <b>${esc(F.kroky[zz.krok].nazev)}</b>`)});
    const zk=root.querySelector('#zpetkrok');if(zk)zk.addEventListener('click',()=>{const db=STORE.load(),zz=db.zakazky.find(x=>x.kod===sel);zz.krok=Math.max(0,zz.krok-1);
      const i=zz.historie.map(h=>h.krok).lastIndexOf(zz.krok+1);if(i>-1)zz.historie.splice(i,1);STORE.save(db,'zpet')});
    root.querySelector('.photo input').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;try{const url=await shrink(f);const db=STORE.load(),zz=db.zakazky.find(x=>x.kod===sel);
      const h=[...zz.historie].reverse().find(x=>x.krok===zz.krok);if(h&&h.ukazka&&!h.vlastni){h.foto=url;h.vlastni=true}else zz.historie.push({krok:zz.krok,cas:Date.now(),foto:url,vlastni:true});
      STORE.save(db,'foto');toast('Fotka je u zákazníka')}catch(err){toast('Fotku se nepodařilo načíst')}});
    root.querySelector('#ulozit').addEventListener('click',()=>{const db=STORE.load(),zz=db.zakazky.find(x=>x.kod===sel);zz.vzkaz=root.querySelector('#vz').value.trim();zz.vzkazCas=Date.now();STORE.save(db,'vzkaz');toast('Vzkaz odeslán')});
    root.querySelector('#pred').addEventListener('change',e=>{const db=STORE.load(),zz=db.zakazky.find(x=>x.kod===sel);zz.predani=e.target.value;STORE.save(db,'datum')});
  }
  function share(z){const url=link(z),text=`Dobrý den, průběh opravy (${z.predmet}) můžete sledovat tady: ${url} – ${F.nazev}`;
    if(navigator.share)navigator.share({title:F.nazev,text,url}).catch(()=>{});else{navigator.clipboard&&navigator.clipboard.writeText(url).then(()=>toast('Odkaz zkopírován'),()=>toast(url))}}
  STORE.on(db=>{const a=document.activeElement;if(a&&/INPUT|TEXTAREA/.test(a.tagName))return;render(db)});render(ensure(F));
}

/* ---------- start: načíst nastavení firmy a podle stránky vykreslit */
const s=document.createElement('script');s.src='firmy/'+firmaId+'.js';s.onload=()=>{const F=window.FIRMA;theme(F);
  const page=document.body.dataset.page;if(page==='zakaznik')zakaznik(F);else if(page==='dilna')dilna(F);
  window.SLEDOVANI={F,reset:()=>reset(F),STORE}};
s.onerror=()=>{document.getElementById('app').innerHTML='<p class="empty">Firma nenalezena.</p>'};document.head.appendChild(s);
})();
