#!/usr/bin/env python3
"""Z truhlářské šablony (kacha/index.html) vyrobí šablonu „dům z výkresu“ pro projektanty: _gen/dum_base.html.
Firemní texty zůstávají jako v Káchovi, aby je make.py uměl nahradit kartou firmy."""
import pathlib, sys
ROOT = pathlib.Path(__file__).resolve().parent.parent
s = (ROOT / "kacha" / "index.html").read_text(encoding="utf-8")
house = (ROOT / "_gen" / "house.js").read_text(encoding="utf-8")

def rep(a, b, n=1):
    global s
    k = s.count(a)
    if k != n: sys.exit(f"čekal jsem {n}× „{a[:80]}“, nalezeno {k}×")
    s = s.replace(a, b)

def block(start, end, new):
    global s
    a = s.find(start); b = s.find(end, a)
    if a < 0 or b < 0: sys.exit("blok nenalezen: " + start[:50])
    s = s[:a] + new + s[b:]

# 3D model: kuchyň -> dům
block("  /* ---------- materiálové varianty ---------- */", "  /* ================= HERO", house)
rep('const FIN={front:"dub",top:"kamenB",handle:"bar"};', 'const FIN={front:"bila",top:"antracit",handle:"bar"};')
rep('const A={tx:-.15,ty:0,tz:1.4,pol:.02,az:0,r:11},B={tx:-.15,ty:.9,tz:1.2,pol:1.02,az:.6,r:8.6},Cf={tx:-.3,ty:1.0,tz:1.2,pol:1.17,az:.24,r:7.9};',
    'const A={tx:.1,ty:0,tz:2.1,pol:.02,az:0,r:16},B={tx:-.2,ty:.9,tz:2.0,pol:1.0,az:.6,r:12.5},Cf={tx:-.1,ty:1.0,tz:2.2,pol:1.2,az:.34,r:12.8};')
rep('S.fog=new THREE.Fog(0x16120f,10,24);', 'S.fog=new THREE.Fog(0x16120f,13,32);')
rep('S.fog=new THREE.Fog(0x2a221b,9,22);', 'S.fog=new THREE.Fog(0x2a221b,13,32);')
rep('const VIEWS=[["celek","Celek",{tx:-.25,ty:1.0,tz:1.2,pol:1.16,az:.32,r:6.6}],["ostruvek","Ostrůvek",{tx:-.3,ty:.8,tz:2.1,pol:1.02,az:-.28,r:3.9}],["deska","Detail desky",{tx:-.55,ty:.95,tz:.4,pol:.98,az:.2,r:2.5}]];',
    'const VIEWS=[["celek","Celek",{tx:-.1,ty:1.0,tz:2.1,pol:1.18,az:.38,r:11.2}],["terasa","Terasa",{tx:1.4,ty:.6,tz:3.6,pol:1.12,az:-.4,r:4.6}],["okno","Detail okna",{tx:-1.9,ty:.75,tz:3.1,pol:1.3,az:.12,r:3.1}]];')
rep('const conf={front:"dub",top:"kamenB",handle:"bar",mood:"den",view:"celek"};', 'const conf={front:"bila",top:"antracit",handle:"bar",mood:"den",view:"celek"};')
rep('const FB_COL={raw:"#e9e3d9",dub:"#c8955c",orech:"#6b4a33",bily:"#efeee9",kasmir:"#d6c7b2",salvej:"#8f9c86",antracit:"#36383b",kamenB:"#e8e3da",kamenA:"#2f3032",beton:"#9b978f"};',
    'const FB_COL={raw:"#b5643f",bila:"#efece6",piskova:"#d9caae",seda:"#aaa8a3",antracit:"#3b3d40",drevo:"#a06e42",cihla:"#8e3f2a",cervena:"#a4472e",hneda:"#5b3a2a",plech:"#4a4d52"};')

# texty šablony (ne firemní)
rep('<h1 data-split>Nábytek na míru. <em>Na milimetr.</em></h1>', '<h1 data-split>Váš dům. <em>Od první čáry.</em></h1>')
rep('Poptat kuchyň <span class="arr">→</span>', 'Poptat projekt <span class="arr">→</span>')
rep('<h2 class="h" data-split>Vaše kuchyň, <em>vaše materiály.</em></h2><p class="lead rv">Vyberte dvířka, pracovní desku a úchytky a podívejte se na kuchyň ve dne i večer. Je to jen ilustrace, skutečný návrh připravíme přesně pro váš prostor.</p>',
    '<h2 class="h" data-split>Váš dům, <em>vaše materiály.</em></h2><p class="lead rv">Vyberte fasádu, střechu a barvu oken a podívejte se na dům ve dne i večer. Je to jen ilustrace, skutečný návrh připravíme přesně pro váš pozemek.</p>')
rep('<h3>Dvířka <b id="lbFront"></b></h3>', '<h3>Fasáda <b id="lbFront"></b></h3>')
rep('<h3>Pracovní deska <b id="lbTop"></b></h3>', '<h3>Střecha <b id="lbTop"></b></h3>')
rep('<h3>Úchytky</h3>', '<h3>Okenní rámy</h3>')
rep('Chci podobnou kuchyň <span class="arr">→</span>', 'Chci podobný dům <span class="arr">→</span>')
rep('3D kuchyně je ilustrační.', '3D dům je ilustrační.')
rep('aria-label="3D náhled kuchyně. Otáčejte tahem nebo šipkami."', 'aria-label="3D náhled domu. Otáčejte tahem nebo šipkami."')
rep('<span class="dim" data-dim="0">4 200</span><span class="dim" data-dim="1">2 500</span><span class="dim" data-dim="2">600</span><span class="dim" data-dim="3">1 000</span>',
    '<span class="dim" data-dim="0">13 500</span><span class="dim" data-dim="1">7 500</span><span class="dim" data-dim="2">4 500</span><span class="dim" data-dim="3">7 500</span>')

# záložní obrázky bez WebGL
HERO_SVG = '''<svg id="kitchenFallback" hidden viewBox="0 0 480 300" aria-hidden="true">
      <defs><radialGradient id="glw"><stop offset="0" stop-color="#ffe2b0" stop-opacity=".9"/><stop offset="1" stop-color="#ffe2b0" stop-opacity="0"/></radialGradient></defs>
      <g class="fl">
        <rect x="0" y="0" width="480" height="300" fill="#1e1b17"/><rect x="0" y="240" width="480" height="60" fill="#2f3a26"/>
        <rect x="50" y="140" width="240" height="100" fill="#ece8e1"/><polygon points="34,142 170,70 306,142" fill="#3a3c3f"/>
        <rect x="290" y="160" width="130" height="80" fill="#e4e0d8"/><rect x="284" y="152" width="142" height="10" fill="#2f3134"/>
        <rect x="72" y="172" width="40" height="48" fill="#1a2633"/><rect x="128" y="172" width="40" height="48" fill="#1a2633"/><rect x="214" y="166" width="56" height="56" fill="#1a2633"/>
        <rect x="182" y="184" width="26" height="56" fill="#7a5032"/><rect x="316" y="180" width="86" height="56" fill="#1a2633"/>
      </g>
      <g class="lt">
        <rect x="72" y="172" width="40" height="48" fill="#ffcf8a" opacity=".85"/><rect x="128" y="172" width="40" height="48" fill="#ffcf8a" opacity=".85"/><rect x="214" y="166" width="56" height="56" fill="#ffcf8a" opacity=".85"/><rect x="316" y="180" width="86" height="56" fill="#ffcf8a" opacity=".85"/>
        <ellipse cx="195" cy="250" rx="60" ry="10" fill="url(#glw)"/><ellipse cx="359" cy="252" rx="80" ry="12" fill="url(#glw)"/><circle cx="230" cy="262" r="22" fill="url(#glw)"/>
      </g>
      <g>
        <path class="ln" pathLength="1" d="M50 140h240v100H50z M34 142L170 70L306 142"/>
        <path class="ln" pathLength="1" d="M290 160h130v80H290z M284 152h142v10H284z"/>
        <path class="ln" pathLength="1" d="M72 172h40v48H72z M128 172h40v48h-40z M214 166h56v56h-56z M182 184h26v56h-26z M316 180h86v56h-86z"/>
        <path class="ln" pathLength="1" d="M0 240h480 M50 262h370 M50 256v12 M420 256v12"/>
      </g>
    </svg>'''
CONF_SVG = '''<svg id="confFallback" hidden viewBox="0 0 400 260" aria-hidden="true">
          <rect x="0" y="0" width="400" height="200" id="cfWall" fill="#d9d2c7"/><rect x="0" y="200" width="400" height="60" fill="#5d7342"/>
          <rect id="cfUpper" x="40" y="110" width="200" height="90" fill="#efece6"/><polygon id="cfTop" points="26,112 140,48 254,112" fill="#3a3c3f"/>
          <rect id="cfTall" x="240" y="126" width="120" height="74" fill="#efece6"/><rect id="cfITop" x="234" y="118" width="132" height="9" fill="#2f3134"/>
          <rect id="cfBase" x="40" y="196" width="200" height="4" fill="#efece6"/><rect id="cfIsland" x="240" y="196" width="120" height="4" fill="#efece6"/>
          <g id="cfWin" fill="#dfeefa"><rect x="58" y="136" width="34" height="40"/><rect x="104" y="136" width="34" height="40"/><rect x="184" y="132" width="44" height="46"/><rect x="262" y="146" width="78" height="46"/></g>
          <rect x="152" y="150" width="22" height="50" fill="#7a5032"/>
          <g id="cfLed" opacity="0" fill="#ffcf8a"><rect x="58" y="136" width="34" height="40"/><rect x="104" y="136" width="34" height="40"/><rect x="184" y="132" width="44" height="46"/><rect x="262" y="146" width="78" height="46"/></g>
        </svg>'''
block('<svg id="kitchenFallback"', '\n    <span class="dim"', HERO_SVG)
block('<svg id="confFallback"', '\n        <div class="cv-bar">', CONF_SVG)
rep('$("cfWall").setAttribute("fill",m==="den"?"#d9d2c7":"#6e655a")', '$("cfWall").setAttribute("fill",m==="den"?"#cfe0ee":"#1b2330")')

rep("if(narrow)o.r*=1.75;", "if(narrow)o.r*=1.4;")
rep("else C.setViewOffset(W,H,-W*.2,0,W,H);", "else C.setViewOffset(W,H,-W*.25,0,W,H);")
rep("K.setPlan(sm(0,.11,P),1-sm(.36,.5,P));", "K.setPlan(sm(0,.22,P),1-sm(.38,.5,P));K.setElev(sm(.2,.25,P)*(1-sm(.44,.5,P)));")
rep("K.setGhost(P,sm(.06,.12,P)*(1-sm(.5,.62,P)));", "K.setGhost(P,sm(.17,.22,P)*(1-sm(.5,.62,P)));")
rep('const dv=sm(.03,.09,P)*(1-sm(.26,.32,P));C.updateMatrixWorld();', 'C.updateMatrixWorld();')
rep('el.style.opacity=dv.toFixed(3);', 'const w=K.dimWin[i]||[.03,.3];el.style.opacity=(sm(w[0],w[0]+.02,P)*(1-sm(w[1],w[1]+.04,P))).toFixed(3);')
# více kót v HTML
labels=["2 500","3 250","3 250","4 500","13 500","4 500","3 000","7 500","±0,000","+3,830","+6,450"]
rep('<span class="dim" data-dim="0">13 500</span><span class="dim" data-dim="1">7 500</span><span class="dim" data-dim="2">4 500</span><span class="dim" data-dim="3">7 500</span>',
    "".join(f'<span class="dim" data-dim="{i}">{t}</span>' for i,t in enumerate(labels)))
# styl výkresu: modrošedé pozadí, světle modré linky, pískový akcent
for a,b in [("#16120f","#0d1620"),("0x16120f","0x0d1620"),("#1e1814","#122030"),("#2a221b","#1a2a3a"),("0x2a221b","0x1a2a3a"),("#f4ede3","#eef3f7"),("#c7b9a7","#a9b9c7"),("#9c8c79","#7f91a2"),
            ("#f3ece1","#edf1f4"),("#e9e0d2","#dde4ea"),("#2b2219","#142231"),("#6e5f50","#526476"),("#3a2a1c88","#1b2d4088"),("#9a6634","#b07a45"),("#fffaf2","#f7f9fb"),("#b07a45","#2c6f9e"),("#8a7a69","#6c7d8d"),("Co vyrábíme","Služby"),
            ("#d9a66a","#e3ab6e"),("%23d9a66a","%23e3ab6e"),("#efc48f","#f3c896"),("#8cc4ea","#9fd3ff"),("0x8cc4ea","0x9fd3ff")]:
    s_count=s
    s=s.replace(a,b)


# ===== projekční prostředí (typografie, papír, listy, razítko) =====
rep("family=Instrument+Serif:ital@0;1&", "family=Space+Grotesk:wght@400;500;600&family=Instrument+Serif:ital@0;1&")
CSS = """
/* ===== PROJEKČNÍ STYL ===== */
:root{--f-display:"Space Grotesk",system-ui,sans-serif}
.h,.h-copy h1{font-weight:500;letter-spacing:-.035em;line-height:1.02}
.h-copy h1{font-size:clamp(2.6rem,6vw,5.4rem)}
.h{font-size:clamp(2.2rem,5vw,4.2rem)}
h2.h em,.h-copy h1 em{font-style:normal}
.mq span{font-family:var(--f-mono);text-transform:uppercase;font-size:clamp(1.2rem,2.8vw,2.2rem);letter-spacing:.08em}
.mq i{color:var(--blue)!important}
.btn{border-radius:3px}
.card,.stamp,.fc,.tile,.conf-view,.win-card,.map,.ph{border-radius:4px!important}
.stamp .st{font-family:var(--f-mono);font-size:clamp(.95rem,1.8vw,1.25rem);letter-spacing:.1em;text-transform:uppercase;border-radius:2px;border-width:1.5px;border-color:var(--blue);color:var(--blue)}
.light{background-image:linear-gradient(#14223112 1px,transparent 1px),linear-gradient(90deg,#14223112 1px,transparent 1px),linear-gradient(#14223109 1px,transparent 1px),linear-gradient(90deg,#14223109 1px,transparent 1px);background-size:120px 120px,120px 120px,24px 24px,24px 24px}
.price,.conf,.map-sec,.marq{background-image:linear-gradient(#9fd3ff0e 1px,transparent 1px),linear-gradient(90deg,#9fd3ff0e 1px,transparent 1px);background-size:40px 40px}
.s-head .h::after,.price .h::after,.map-sec .h::after,.contact .h::after{content:"";display:block;width:min(260px,60%);height:10px;margin-top:18px;background:linear-gradient(currentColor,currentColor) 0 50%/100% 1px no-repeat,linear-gradient(currentColor,currentColor) 0 0/1px 100% no-repeat,linear-gradient(currentColor,currentColor) 100% 0/1px 100% no-repeat;opacity:.35}
body{counter-reset:list}
.eyebrow.bar-rv>span::before{counter-increment:list;content:"List " counter(list,decimal-leading-zero);color:var(--blue);margin-right:.9em}
.light .eyebrow.bar-rv>span::before{color:#2c6f9e}
.tile::before,.fc::before{content:"";position:absolute;inset:9px;z-index:2;pointer-events:none;--c:#ffffffd0;background:linear-gradient(var(--c),var(--c)) 0 0/14px 1.5px,linear-gradient(var(--c),var(--c)) 0 0/1.5px 14px,linear-gradient(var(--c),var(--c)) 100% 0/14px 1.5px,linear-gradient(var(--c),var(--c)) 100% 0/1.5px 14px,linear-gradient(var(--c),var(--c)) 0 100%/14px 1.5px,linear-gradient(var(--c),var(--c)) 0 100%/1.5px 14px,linear-gradient(var(--c),var(--c)) 100% 100%/14px 1.5px,linear-gradient(var(--c),var(--c)) 100% 100%/1.5px 14px;background-repeat:no-repeat}
.tblock{position:absolute;z-index:3;right:max(16px,3vw);bottom:clamp(96px,14vh,140px);display:grid;grid-template-columns:auto auto;font-family:var(--f-mono);font-size:.6rem;letter-spacing:.1em;text-transform:uppercase;color:var(--blue);border:1px solid #9fd3ff55;background:#0d1620cc;pointer-events:none}
.tblock span{padding:5px 10px;border-right:1px solid #9fd3ff2a;border-bottom:1px solid #9fd3ff2a}
.tblock span:nth-child(2n){border-right:0}.tblock span:nth-last-child(-n+2){border-bottom:0}
.tblock b{font-weight:500;color:var(--ink)}
@media (max-width:900px){.tblock{display:none}}
.cgrid{border:1.5px solid var(--line-2);gap:0;grid-template-columns:1fr 1fr}
.cgrid div{padding:12px 14px;border-bottom:1px solid var(--line);border-right:1px solid var(--line)}
.cgrid div:nth-child(2n){border-right:0}.cgrid div:nth-last-child(-n+2){border-bottom:0}
@media (max-width:600px){.cgrid{grid-template-columns:1fr}.cgrid div{border-right:0}.cgrid div:nth-last-child(2){border-bottom:1px solid var(--line)}}
.bigword{font-weight:500;letter-spacing:-.05em}
"""
rep("</style>", CSS + "</style>")
block('<a class="logo" href="#top"><svg', '<span>', '<a class="logo" href="#top"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M6 15.5L16 7l10 8.5V25H6z" fill="none" stroke="#e3ab6e" stroke-width="1.8" stroke-linejoin="round"/><path d="M6 29h20M6 27.5v3M26 27.5v3M13.5 25v-6h5v6" fill="none" stroke="#9fd3ff" stroke-width="1.3" stroke-linecap="round"/></svg>')
rep('<div class="scroll-hint" aria-hidden="true">Scrollujte</div>', '<div class="scroll-hint" aria-hidden="true">Scrollujte</div>\n    <div class="tblock" aria-hidden="true"><span>Výkres</span><span><b>Půdorys 1.NP</b></span><span>Měřítko</span><span><b>1 : 100</b></span><span>Formát</span><span><b>A1</b></span><span>List</span><span><b>01</b></span></div>')
rep("Zavolejte nebo napište. Domluvíme konzultaci, přijedeme zaměřit a připravíme cenu přesně na míru.", "Zavolejte nebo napište. Domluvíme konzultaci nad vaším pozemkem nebo domem a připravíme nabídku.")
rep('<span class="o">Na míru.</span><span class="f">Na míru.</span>', '<span class="o">Projekt.</span><span class="f">Projekt.</span>')

(ROOT / "_gen" / "dum_base.html").write_text(s, encoding="utf-8")
print("hotovo: _gen/dum_base.html")
