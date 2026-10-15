#!/usr/bin/env python3
"""Generátor náhledů z truhlářské šablony (kacha/index.html).

Použití:  python3 _gen/make.py _gen/firms/<slug>.json
Výstup:   <slug>/index.html

Každá „karta firmy“ (JSON) vyplní místa, která se liší firma od firmy.
Šablona se nemění; skript jen nahrazuje přesné úseky textu a hlídá, že každý existuje.
"""
import json, re, sys, html, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
TPL = (ROOT / "kacha" / "index.html").read_text(encoding="utf-8")


def js(v):
    return json.dumps(v, ensure_ascii=False)


def main(cfg_path):
    c = json.loads(pathlib.Path(cfg_path).read_text(encoding="utf-8"))
    s = (ROOT / "_gen" / "dum_base.html").read_text(encoding="utf-8") if c.get("template") == "dum" else TPL
    n = c["name"]

    def rep(old, new, count=1):
        nonlocal s
        k = s.count(old)
        if k != count:
            sys.exit(f"Šablona: čekal jsem {count}× „{old[:70]}…“, nalezeno {k}×")
        s = s.replace(old, new)

    def block(start, end, new):
        nonlocal s
        a = s.find(start); b = s.find(end, a)
        if a < 0 or b < 0:
            sys.exit(f"Šablona: blok {start[:40]}… nenalezen")
        s = s[:a] + new + s[b:]

    # hlavička, lišta, logo, patička
    rep("<title>Truhlář Kácha · návrh nového webu</title>", f"<title>{n} · návrh nového webu</title>")
    rep("/* Neoficiální koncept redesignu pro Truhlář Kácha (Řisuty u Slaného).", f"/* Neoficiální koncept redesignu pro {n}.")
    rep("nejde o oficiální web Truhlář Kácha</div>", f"nejde o oficiální web {n}</div>")
    rep("<span>Truhlář Kácha<small>Nábytek na míru · Slaný</small></span>", f"<span>{c['logo']}<small>{c['logo_sub']}</small></span>")
    rep("Neoficiální návrh nového webu pro Truhlář Kácha. Nejde o oficiální stránky.",
        f"Neoficiální návrh nového webu pro {n}. Nejde o oficiální stránky. © 2026 Tomáš Ledvina – koncept, použití jen po dohodě s autorem.")
    rep('<a href="#oblast">Kde působíme</a>', f'<a href="#oblast">{c["map_nav"]}</a>')

    # hero
    rep('<div class="eyebrow">Truhlářství · <b>Řisuty u Slaného</b></div>', f'<div class="eyebrow">{c["hero_eyebrow"]}</div>')
    rep("Kuchyně, vestavěné skříně a interiéry z dílny u Slaného. Návrh, zaměření, vynáška i montáž jsou vždy v ceně.", c["hero_p"])
    steps = "\n".join(
        f'        <div class="sc{" on" if i == 0 else ""}"><small>{st[0]}</small><b>{st[1]}</b><span>{st[2]}</span></div>'
        for i, st in enumerate(c["steps"]))
    block('        <div class="sc on">', "      </div>\n      <div class=\"ticks\"", steps + "\n")

    # sekce „ceny / proč my“
    p = c["price"]
    stamps = "\n".join(
        f'        <div class="stamp" style="--d:{i*.12:.2f}s"><span class="st">{a}</span><span><b>{b}</b> {t}</span></div>'
        for i, (a, b, t) in enumerate(p["stamps"]))
    price_html = f'''      <div class="eyebrow bar-rv"><span><b>—</b> {p["eyebrow"]}</span></div>
      <h2 class="h" data-split>{p["h"]}</h2>
      <p class="lead rv">{p["lead"]}</p>
    </div>
    <div>
      <div class="stamps">
{stamps}
      </div>
      <p class="price-note rv">{p["note"]}</p>
'''
    block('      <div class="eyebrow bar-rv"><span><b>—</b> Naše ceny</span></div>', "    </div>\n  </div>\n</section>\n\n<section class=\"", price_html)

    # konfigurátor, služby, značky
    rep("Korpusy z lamina 18 mm (Egger, Kronospan), hrany ABS 0,5 až 2 mm. Pracovní desky z laminátu, masivu nebo umělého kamene. Závěsy a zásuvky s tlumením od výrobců Blum, Hettich, Häfele a Mivokor s doživotní garancí plné funkčnosti.", c["conf_spec"])
    rep('<h2 class="h" data-split>Od kuchyně <em>po schody.</em></h2><p class="lead rv">Realizujeme soukromé interiéry (kuchyně, ložnice, šatny, obývací a dětské pokoje) i komerční prostory (školy, ordinace, kanceláře). Klikněte pro podrobnosti.</p>',
        f'<h2 class="h" data-split>{c["svc_h"]}</h2><p class="lead rv">{c["svc_lead"]}</p>')
    rep('<span>Pracujeme s</span><b>Egger</b><b>Kronospan</b><b>Blum</b><b>Hettich</b><b>Häfele</b><b>Solodoor</b><b>Erkado</b>',
        "<span>Pracujeme s</span>" + "".join(f"<b>{b}</b>" for b in c["brands"]))

    # mapa
    m = c["map"]
    rep('<h2 class="h" data-split>Z dílny u Slaného <em>až k vám.</em></h2>', f'<h2 class="h" data-split>{m["h"]}</h2>')
    rep("Dopravu máte zdarma v Praze, ve Středních Čechách, na Lounsku a Litoměřicku. Ostatní lokality podle domluvy a objemu zakázky.", m["lead"])
    rep('<div class="eyebrow bar-rv"><span><b>—</b> Kde působíme</span></div>', f'<div class="eyebrow bar-rv"><span><b>—</b> {m["eyebrow"]}</span></div>')
    block("  const CITIES=", "  {const ro=",
          f"  const CITIES={js(m['cities'])};\n"
          f"  const prj=(lo,la)=>[30+(lo-{m['lo'][0]})/({m['lo'][1]}-{m['lo'][0]})*460,350-(la-{m['la'][0]})/({m['la'][1]}-{m['la'][0]})*320];\n")

    # kontakt
    k = c["contact"]
    tel = re.sub(r"\D", "", k["tel"]); tel = tel if tel.startswith("420") else "420" + tel
    rep('<div><small>Truhlářství</small><span>Bohuslav Kácha</span></div>', f'<div><small>{k["label"]}</small><span>{k["who"]}</span></div>')
    rep('<div><small>Adresa</small><span>Řisuty 105, 273 78 Řisuty</span></div>', f'<div><small>Adresa</small><span>{k["addr"]}</span></div>')
    rep('<a href="tel:+420605568991">+420 605 568 991</a>', f'<a href="tel:+{tel}">{k["tel"]}</a>')
    rep('<a href="mailto:info@truhlarkacha.cz">info@truhlarkacha.cz</a>', f'<a href="mailto:{k["mail"]}">{k["mail"]}</a>')

    # poptávkový formulář
    f = c["form"]
    rep('<p>Pošlete nám pár údajů a ozveme se s termínem konzultace. Návrh i zaměření jsou v ceně.</p>', f'<p>{f["p"]}</p>')
    rep('${["Kuchyně","Vestavěná skříň","Šatna","Jiný nábytek","Dveře"]', "${" + js(f["chips"]))
    rep('let pType="Kuchyně";', 'let pType=' + js(f["chips"][0]) + ';')
    rep('placeholder="např. Kladno"', f'placeholder="např. {f["city"]}"')
    rep("na skutečném webu přijde poptávka rovnou do e-mailu truhlářství.", "na skutečném webu přijde poptávka rovnou do vašeho e-mailu.")

    # data: fotky, kategorie, služby
    ph = [[a, b, t] for a, b, t in c["photos"]]
    data = (f"  const PH={js(ph)};\n"
            f"  const FEAT={js(c['feat'])};\n"
            f"  const CAT={js(c['cat'])};\n"
            f"  const SVC={js(c['svc'])};\n\n")
    block('  const B1="https://webmium', "  /* ================= OBSAH STRÁNKY", data)
    rep('const words=["Kuchyně","Vestavěné skříně","Šatny","Interiérové dveře","Egger","Kronospan","Blum","Hettich","Häfele","Masiv","Umělý kámen"]', "const words=" + js(c["marquee"]))

    # firmy bez webu / údaje z katalogu
    if c.get("new_site"):
        rep("NEOFICIÁLNÍ NÁVRH REDESIGNU · nejde o oficiální web", "NEOFICIÁLNÍ NÁVRH WEBU · nejde o oficiální web")
    if c.get("source_note"):
        rep("Fotografie a údaje převzaty ze současného webu truhlářství.", c["source_note"])

    if c.get("template") == "dum":
        s = s.replace("<span>Pracujeme s</span>", "<span>Navrhujeme</span>")

    # otisk razítka (volitelně): v úvodu a na kontaktech
    if c.get("stamp"):
        st = c["stamp"]
        rep('<div class="tblock" aria-hidden="true">',
            f'<div class="stamp-wrap" aria-hidden="true"><div class="stamp-ink stamp-hero" style="--m:url({st})"></div></div>\n    <div class="tblock" aria-hidden="true">')
        rep('<div class="cgrid rv">', f'<div class="cgrid rv" style="position:relative"><div class="stamp-ink stamp-c" aria-hidden="true" style="--m:url({st})"></div>')
        rep("</style>", """
.stamp-ink{pointer-events:none;-webkit-mask:var(--m) center/contain no-repeat;mask:var(--m) center/contain no-repeat;opacity:0}
.stamp-ink.on{animation:stampIn .6s cubic-bezier(.3,1.45,.5,1) forwards}
@keyframes stampIn{0%{opacity:0;transform:rotate(-24deg) scale(2.6);filter:blur(4px)}55%{opacity:1;filter:blur(0)}100%{opacity:var(--o,.9);transform:rotate(var(--r,-12deg)) scale(1);filter:blur(0)}}
.stamp-wrap{position:absolute;z-index:4;left:clamp(560px,46vw,760px);top:calc(var(--bar,40px) + 22vh);width:clamp(150px,13vw,200px);aspect-ratio:1;pointer-events:none;will-change:opacity}
.stamp-hero{width:100%;height:100%;background:#b9e0ff;--o:.92;filter:drop-shadow(0 0 18px #9fd3ff55)}
.stamp-wrap::after{content:"";position:absolute;inset:-14%;border-radius:50%;border:2px solid #9fd3ff;opacity:0}
.stamp-wrap.hit::after{animation:stampRing .8s ease-out forwards}
@keyframes stampRing{0%{opacity:.7;transform:scale(.6)}100%{opacity:0;transform:scale(1.35)}}
.stamp-c{position:absolute;right:-26px;bottom:-34px;width:132px;height:132px;background:#2650b8;--o:.8;--r:9deg;mix-blend-mode:multiply;z-index:2}
@media (max-width:900px){.stamp-wrap{left:auto;right:18px;top:auto;bottom:140px;width:110px}.stamp-c{right:-6px;bottom:-40px;width:104px;height:104px}}
@media (prefers-reduced-motion:reduce){.stamp-ink.on{animation:none;opacity:var(--o,.9);transform:rotate(var(--r,-12deg))}.stamp-wrap.hit::after{animation:none}}
</style>""")
        rep('<div class="h-ctas rv" style="--d:.65s">', f'<div class="h-ctas rv" style="--d:.65s;position:relative"><div class="stamp-ink stamp-done" aria-hidden="true" style="--m:url({st})"></div>')
        rep("</style>", """
.stamp-done{position:absolute;left:360px;top:-46px;width:clamp(110px,9vw,138px);aspect-ratio:1;background:#b9e0ff;--o:.9;--r:-9deg;filter:drop-shadow(0 0 14px #9fd3ff4d);z-index:2}
.stamp-done.off{animation:none;opacity:0;transition:opacity .3s}
@media (max-width:900px){.stamp-done{left:min(390px,calc(100% - 118px));top:-34px;width:106px}}
@media (max-width:559px){.stamp-done{left:40px;top:calc(100% + 16px);width:100px}}
</style>""")
        rep("</body>", """<script>(()=>{const w=document.querySelector(".stamp-wrap"),h=w&&w.firstElementChild;
addEventListener("load",()=>setTimeout(()=>{h&&h.classList.add("on");setTimeout(()=>w&&w.classList.add("hit"),230)},700));
if(w){const f=()=>{w.style.opacity=Math.max(0,1-scrollY/(innerHeight*.35)).toFixed(3)};addEventListener("scroll",f,{passive:true});f()}
const sd=document.querySelector(".stamp-done"),hero=document.getElementById("postup");
if(sd&&hero){let on=false;const g=()=>{const r=hero.getBoundingClientRect(),P=-r.top/Math.max(1,r.height-innerHeight);if(!on&&P>.8&&P<1.02){on=true;sd.classList.remove("off");sd.classList.add("on")}else if(on&&P<.72){on=false;sd.classList.remove("on");sd.classList.add("off")}};addEventListener("scroll",g,{passive:true});g()}
const sc=document.querySelector(".stamp-c");if(sc&&"IntersectionObserver"in window){const io=new IntersectionObserver(e=>{if(e[0].isIntersecting){setTimeout(()=>sc.classList.add("on"),450);io.disconnect()}},{threshold:.6});io.observe(sc)}else if(sc)sc.classList.add("on")})();</script>
</body>""")

    # sekce s osvědčením o autorizaci (volitelně)
    if c.get("cert"):
        ce = c["cert"]
        facts = "".join(f"<div><small>{a}</small><span>{b}</span></div>" for a, b in ce["facts"])
        rep('<section class="map-sec gut" id="oblast">', f'''<section class="sec gut light cert" id="autorizace">
  <div class="wrap cert-grid">
    <div>
      <div class="eyebrow bar-rv"><span><b>—</b> {ce["eyebrow"]}</span></div>
      <h2 class="h" data-split>{ce["h"]}</h2>
      <p class="lead rv">{ce["lead"]}</p>
      <div class="cert-facts rv">{facts}</div>
    </div>
    <a class="cert-sheet rv" href="{ce["img"]}" target="_blank" rel="noopener" aria-label="Zobrazit osvědčení o autorizaci ve větší velikosti">
      <img src="{ce["img"]}" alt="Osvědčení o autorizaci ČKAIT" loading="lazy" width="760" height="1191">
      <span>Zobrazit osvědčení</span>
    </a>
  </div>
</section>

<section class="map-sec gut" id="oblast">''')
        rep("</style>", """
.cert-grid{display:grid;grid-template-columns:1.1fr .9fr;gap:clamp(32px,6vw,90px);align-items:center}
.cert-facts{display:grid;grid-template-columns:1fr 1fr;margin-top:28px;border:1px solid var(--pline)}
.cert-facts div{padding:14px 16px;border-right:1px solid var(--pline);border-bottom:1px solid var(--pline);display:grid;gap:4px}
.cert-facts div:nth-child(2n){border-right:0}.cert-facts div:nth-last-child(-n+2){border-bottom:0}
.cert-facts small{font-family:var(--f-mono);font-size:.62rem;letter-spacing:.12em;text-transform:uppercase;color:var(--pmuted)}
.cert-facts span{font-size:1.02rem;color:var(--pink)}
.cert-sheet{position:relative;display:block;justify-self:center;width:min(100%,420px);background:#fff;padding:14px;box-shadow:0 30px 60px -30px #14223166,0 2px 6px #14223122;transform:rotate(2deg);transition:transform .5s var(--ease)}
.cert-sheet:hover{transform:rotate(0) translateY(-6px)}
.cert-sheet img{display:block;width:100%;height:auto}
.cert-sheet span{position:absolute;left:50%;bottom:-14px;transform:translateX(-50%);font-family:var(--f-mono);font-size:.62rem;letter-spacing:.12em;text-transform:uppercase;background:var(--pink);color:var(--paper);padding:7px 12px;white-space:nowrap}
@media (max-width:900px){.cert-grid{grid-template-columns:1fr}.cert-sheet{width:min(86%,360px)}}
</style>""")
        rep('<a href="#oblast">', '<a href="#autorizace">Autorizace</a><a href="#oblast">')

    # seznam vybraných zakázek (volitelně)
    if c.get("refs"):
        import html as _h
        def per(y):
            a=int(y[:4]);b=int(y[-4:])
            if b-a>10: return "long"
            return "90" if a<2000 else "00" if a<2010 else "10"
        rows="".join(
            f'<li data-p="{per(r["y"])}"{" class=\"hid\"" if i>=10 else ""}><span class="ry">{r["y"]}</span>'
            f'<div class="rt"><b>{_h.escape(r["t"])}</b><small>Investor: {_h.escape(r["inv"])}'
            + (f' · Dodavatel: {_h.escape(r["sup"])}' if r.get("sup") else "") + '</small></div>'
            f'<span class="rc">{_h.escape(r["cost"])}</span></li>' for i,r in enumerate(c["refs"]))
        n=len(c["refs"])
        rep('<section class="map-sec gut" id="oblast">', f'''<section class="sec gut refs" id="zakazky">
  <div class="wrap">
    <div class="eyebrow bar-rv"><span><b>—</b> Vybrané zakázky</span></div>
    <h2 class="h" data-split>Stavby, které <em>stojí.</em></h2>
    <p class="lead rv">Realizováno přes 500 nových staveb a rekonstrukcí. Tady je výběr z nich, projektovaný samostatně nebo jako vedoucí projektu a zpracovatel stavební části v rámci ateliéru PROKON Příbram.</p>
    <div class="ref-f rv" role="group" aria-label="Období">
      <button type="button" class="ref-chip" data-f="all" aria-pressed="true">Vše ({n})</button><button type="button" class="ref-chip" data-f="90" aria-pressed="false">1991–1999</button><button type="button" class="ref-chip" data-f="00" aria-pressed="false">2000–2009</button><button type="button" class="ref-chip" data-f="10" aria-pressed="false">2010–2019</button><button type="button" class="ref-chip" data-f="long" aria-pressed="false">Dlouhodobě</button>
    </div>
    <ol class="ref-list">{rows}</ol>
    <button type="button" class="ref-more">Zobrazit všechny zakázky ({n})</button>
  </div>
</section>
<script>(()=>{{const s=document.getElementById("zakazky"),li=[...s.querySelectorAll(".ref-list li")],more=s.querySelector(".ref-more");let f="all",open=false;
const draw=()=>{{let k=0;li.forEach(l=>{{const ok=f==="all"||l.dataset.p===f;const show=ok&&(f!=="all"||open||k<10);if(ok)k++;l.classList.toggle("hid",!show)}});more.hidden=f!=="all"||open}};
s.querySelectorAll(".ref-chip").forEach(b=>b.addEventListener("click",()=>{{f=b.dataset.f;s.querySelectorAll(".ref-chip").forEach(x=>x.setAttribute("aria-pressed",x===b));draw()}}));
more.addEventListener("click",()=>{{open=true;draw()}});draw()}})();</script>

<section class="map-sec gut" id="oblast">''')
        rep("</style>", """
.refs .lead{max-width:62ch}
.ref-f{display:flex;flex-wrap:wrap;gap:8px;margin-top:30px}
.ref-chip{font-family:var(--f-mono);font-size:.68rem;letter-spacing:.1em;text-transform:uppercase;padding:9px 14px;border:1px solid var(--line);border-radius:999px;background:transparent;color:inherit;cursor:pointer;transition:background .3s,color .3s,border-color .3s}
.ref-chip[aria-pressed="true"]{background:var(--oak);color:#0f1720;border-color:var(--oak)}
.ref-chip:focus-visible,.ref-more:focus-visible{outline:2px solid var(--oak);outline-offset:3px}
.ref-list{list-style:none;margin:26px 0 0;padding:0;border-top:1px solid var(--line)}
.ref-list li{display:grid;grid-template-columns:118px minmax(0,1fr) auto;gap:22px;align-items:baseline;padding:17px 4px;border-bottom:1px solid var(--line);transition:background .3s}
.ref-list li:hover{background:color-mix(in srgb,var(--line) 35%,transparent)}
.ref-list li.hid{display:none}
.ry{font-family:var(--f-mono);font-size:.76rem;letter-spacing:.06em;color:var(--muted);font-variant-numeric:tabular-nums}
.rt b{display:block;font-weight:500;font-size:1.02rem;line-height:1.4}
.rt small{display:block;margin-top:5px;font-size:.84rem;line-height:1.5;color:var(--muted)}
.rc{font-family:var(--f-mono);font-size:.78rem;white-space:nowrap;color:var(--oak)}
.ref-more{margin-top:26px;font-family:var(--f-mono);font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;padding:13px 20px;border:1px solid var(--oak);background:transparent;color:var(--oak);cursor:pointer;border-radius:999px}
.ref-more:hover{background:var(--oak);color:#0f1720}
@media (max-width:700px){.ref-list li{grid-template-columns:1fr auto;gap:6px 14px}.ry{grid-column:1/-1}.rt{grid-column:1/-1}.rc{grid-column:1/-1}}
</style>""")
        rep('<a href="#oblast">', '<a href="#zakazky">Zakázky</a><a href="#oblast">')

    # jen jedna kategorie fotek: bez filtru, na dlaždici popisek místo kategorie
    if len(c.get("cat",{}))<=2 and all(len(ph)>2 for ph in c.get("photos",[])):
        rep('<div class="filters rv" id="filters"></div>','<div class="filters rv" id="filters" hidden></div>')
        rep('<figcaption><small>${CAT[p[0]]}</small>','<figcaption>')
        rep('<span class="tg">${CAT[p[0]]}</span>','<span class="tg tgc">${esc(p[2])}</span>')
        rep("</style>", ".tgc{text-transform:none!important;letter-spacing:0!important;font-family:inherit!important;white-space:normal!important;max-width:calc(100% - 28px);line-height:1.35;border-radius:8px!important;font-size:.78rem!important;padding:6px 10px!important}\n</style>")

    # barva akcentu (volitelně)
    if c.get("accent"):
        a, a2 = c["accent"]
        s = s.replace("#d9a66a", a).replace("%23d9a66a", "%23" + a[1:]).replace("#efc48f", a2)

    out = ROOT / c["slug"] / "index.html"
    out.parent.mkdir(exist_ok=True)
    out.write_text(s, encoding="utf-8")
    print("hotovo:", out.relative_to(ROOT))


if __name__ == "__main__":
    main(sys.argv[1])
