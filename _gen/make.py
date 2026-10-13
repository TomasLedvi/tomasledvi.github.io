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

    # otisk razítka v úvodu (volitelně)
    if c.get("stamp"):
        st = c["stamp"]
        rep('<div class="tblock" aria-hidden="true">',
            f'<div class="stamp-hero" aria-hidden="true" style="--m:url({st})"></div>\n    <div class="tblock" aria-hidden="true">')
        rep("</style>", """
.stamp-hero{position:absolute;z-index:4;right:calc(max(16px,3vw) + 182px);bottom:calc(clamp(96px,14vh,140px) - 4px);width:118px;height:118px;pointer-events:none;
  background:var(--blue);-webkit-mask:var(--m) center/contain no-repeat;mask:var(--m) center/contain no-repeat;
  opacity:0;transform:rotate(-14deg) scale(2.4);filter:blur(3px)}
.stamp-hero.on{animation:stampIn .55s cubic-bezier(.3,1.5,.5,1) forwards}
@keyframes stampIn{0%{opacity:0;transform:rotate(-20deg) scale(2.4);filter:blur(3px)}60%{opacity:.95;filter:blur(0)}100%{opacity:.82;transform:rotate(-12deg) scale(1);filter:blur(0)}}
.stamp-hero::after{content:"";position:absolute;inset:-18%;border-radius:50%;border:2px solid var(--blue);opacity:0}
.stamp-hero.on::after{animation:stampRing .7s .12s ease-out forwards}
@keyframes stampRing{0%{opacity:.6;transform:scale(.7)}100%{opacity:0;transform:scale(1.25)}}
@media (max-width:900px){.stamp-hero{right:22px;bottom:150px;width:96px;height:96px}}
@media (prefers-reduced-motion:reduce){.stamp-hero.on{animation:none;opacity:.82;transform:rotate(-12deg);filter:none}.stamp-hero.on::after{animation:none}}
</style>""")
        rep("</body>", """<script>addEventListener("load",()=>setTimeout(()=>{const e=document.querySelector(".stamp-hero");e&&e.classList.add("on")},900));</script>
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
