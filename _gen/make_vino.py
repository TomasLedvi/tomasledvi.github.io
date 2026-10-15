#!/usr/bin/env python3
"""Generátor ukázek pro vinařství z vinarstvi/index.html + _gen/vino/<slug>.json"""
import json, sys, re, pathlib, html
ROOT = pathlib.Path(__file__).resolve().parent.parent
BASE = (ROOT / "vinarstvi" / "index.html").read_text(encoding="utf-8")
E = html.escape
GLASS = {  # vzhled lahve podle typu vína
 "white": dict(glass=0x22401c, shape="flute", foil=0xb8923e, glow="#a8842a"),
 "aroma": dict(glass=0x4a2808, shape="flute", foil=0x7a1f2e, glow="#c06a1c"),
 "rose": dict(glass="clear", liquid=0xd9566a, shape="flute", foil=0xe8b3ae, glow="#c9566f", label="white"),
 "red": dict(glass=0x0e120b, shape="bdx", foil=0x2a0a12, glow="#8f1d33", label="black"),
 "red2": dict(glass=0x120e0b, shape="bdx", foil=0x6e1a2b, glow="#6e1a2b"),
 "spark": dict(glass="clear", liquid=0xb8901e, shape="flute", foil=0xc9a35e, glow="#b8962e", label="white"),
 "white2": dict(glass=0x2c4a20, shape="flute", foil=0xa8834a, glow="#9aa03a"),
}
SERVE = {"white":"9–11 °C","white2":"9–11 °C","aroma":"10–12 °C","rose":"8–10 °C","red":"16–18 °C","red2":"15–17 °C","spark":"6–8 °C"}

def wine(i, w):
    g = dict(GLASS[w["t"]]); g.setdefault("label", "cream")
    d = {"id": f"w{i}", "n": w["n"], "y": w["y"], "k": w["k"], "notes": w["notes"], "pr": w["pr"],
         "f": w.get("f") or [["Typ", w["k"].split(" · ")[0]], ["Podávat", SERVE[w["t"]]], ["K jídlu", w.get("food", "dle chuti")]]}
    d.update(g); return d

def rep(s, a, b, count=1):
    assert a in s, ("NENALEZENO", a[:70]); return s.replace(a, b, count)

def main(path):
    c = json.loads(pathlib.Path(path).read_text(encoding="utf-8"))
    s = BASE
    V = [wine(i, w) for i, w in enumerate(c["wines"])]
    brand = {"label": c["label"], "zrani": c["zrani"], "discount": c.get("discount", .1)}
    if c.get("labelSp") is not None: brand["labelSp"] = c["labelSp"]
    s = rep(s, "<title>Rodinné vinařství · ukázka webu</title>", f"<title>{E(c['name'])} · návrh webu</title>")
    s = rep(s, '<div class="bar">Ukázka webu pro vinařství · vína a ceny jsou ilustrační</div>',
            f'<div class="bar">Neoficiální návrh webu pro {E(c["name"])} · ceny a údaje u vín jsou ilustrační</div>')
    s = rep(s, '<a class="logo" href="#">Rodinné vinařství<i>Morava · od roku 1998</i></a>', f'<a class="logo" href="#">{E(c["logo"])}<i>{E(c["logo_sub"])}</i></a>')
    s = rep(s, '<div class="k3">Rodinné vinařství · jižní Morava</div>', f'<div class="k3">{E(c["hero_k"])}</div>')
    s = rep(s, '<h1>Čtyři vína. <em>Jeden kopec.</em></h1>', f'<h1>{c["hero_h"]}</h1>')
    s = rep(s, '<div class="k2 rv">Náš příběh</div>', f'<div class="k2 rv">{E(c["story_k"])}</div>')
    s = rep(s, '<h2 class="h2 rv">Tři generace <em>u jednoho sklepa.</em></h2>', f'<h2 class="h2 rv">{c["story_h"]}</h2>')
    s = re.sub(r'<p class="lead rv">Vinice obděláváme ručně.*?</p>', f'<p class="lead rv">{E(c["story"])}</p>', s, count=1, flags=re.S)
    s = rep(s, '<blockquote class="rv">„Dobré víno se nedělá ve spěchu. Dělá se s trpělivostí a s láskou k vinici.“<cite>— Vinař</cite></blockquote>',
            f'<blockquote class="rv">„{E(c["quote"])}“<cite>— {E(c["quote_by"])}</cite></blockquote>')
    nums = "".join(f'\n    <div class="rv"><b>{E(a)}</b><span>{E(b)}</span></div>' for a, b in c["nums"])
    s = re.sub(r'(<div class="wrap nums">).*?(\n  </div>)', lambda m: m.group(1) + nums + m.group(2), s, count=1, flags=re.S)
    s = re.sub(r'<p class="lead rv">Vyberte vína do dřevěné bedny.*?</p>', f'<p class="lead rv">{E(c["crate_lead"])}</p>', s, count=1, flags=re.S)
    d = c["deg"]
    s = rep(s, '<div class="k2 rv">Degustace ve sklepě</div>', f'<div class="k2 rv">{E(d["k"])}</div>')
    s = rep(s, '<h2 class="h2 rv">Posezení <em>u sudu.</em></h2>', f'<h2 class="h2 rv">{d["h"]}</h2>')
    s = rep(s, '<p class="lead rv">Řízená degustace pro páry i skupiny, s prohlídkou sklepa a domácími pochutinami.</p>', f'<p class="lead rv">{E(d["lead"])}</p>')
    lst = "".join(f'\n        <div><b>{n}.</b><span><strong>{E(a)}</strong>{E(b)}</span></div>' for n, (a, b) in zip(["i", "ii", "iii"], d["list"]))
    s = re.sub(r'(<div class="list rv">).*?(\n      </div>)', lambda m: m.group(1) + lst + m.group(2), s, count=1, flags=re.S)
    # ubytování
    if c.get("stay"):
        st = c["stay"]
        rooms = "".join(f'<div class="room rv"><small>{E(r[0])}</small><b>{E(r[1])}</b><span>{E(r[2])}</span><em>{E(r[3])}</em></div>' for r in st["rooms"])
        amen = "".join(f"<i>{E(a)}</i>" for a in st["amen"])
        sec = f'''<section class="sec stay" id="ubytovani">
  <div class="wrap">
    <div class="k2 rv">Ubytování</div>
    <h2 class="h2 rv">{st["h"]}</h2>
    <p class="lead rv">{E(st["lead"])}</p>
    <div class="rooms">{rooms}</div>
    <div class="amen rv">{amen}</div>
    <a class="pill fill rv" href="#kontakt">Zeptat se na volný termín</a>
  </div>
</section>

'''
        s = rep(s, '<section class="sec contact" id="kontakt">', sec + '<section class="sec contact" id="kontakt">')
        s = rep(s, '<li><a href="#degustace">Degustace</a></li>', '<li><a href="#degustace">Degustace</a></li><li><a href="#ubytovani">Ubytování</a></li>')
        s = rep(s, "/* ===== bedna ===== */", """.stay{background:var(--paper)}
.rooms{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:16px;margin-top:44px}
.room{background:#fbf7f1;border:1px solid var(--line);border-radius:18px;padding:26px 24px;display:grid;gap:10px;align-content:start}
.room small{font:500 .66rem/1 var(--sans);letter-spacing:.24em;text-transform:uppercase;color:var(--gold)}
.room b{font:400 1.45rem/1.15 var(--serif)}.room span{color:var(--muted);font-weight:300;line-height:1.6}
.room em{font-style:normal;font:400 1.25rem/1 var(--serif);color:var(--wine);margin-top:6px}
.amen{display:flex;flex-wrap:wrap;gap:8px;margin:26px 0 30px}.amen i{font-style:normal;padding:8px 14px;border:1px solid var(--line);border-radius:999px;font-size:.85rem;background:#ffffff80}
/* ===== bedna ===== */""")
    k = c["contact"]
    cards = f'''<div><small>Adresa</small><span>{k["addr"]}</span></div>
      <div><small>{E(k.get("open_k","Návštěva"))}</small><span>{k["open"]}</span></div>
      <div><small>Rezervace</small><span>{k["tel"]}<br>{E(k["mail"])}</span></div>'''
    s = re.sub(r'<div><small>Adresa</small>.*?</div>\s*<div><small>Otevřeno</small>.*?</div>\s*<div><small>Rezervace</small>.*?</div>', cards, s, count=1, flags=re.S)
    s = s.replace("info@vase-vinarstvi.cz", k["mail"])
    s = rep(s, '<footer>Ukázka webu pro vinařství. Lahve, etikety a ceny jsou ilustrační, na skutečném webu budou vaše vlastní vína. © 2026 Tomáš Ledvina – koncept, použití jen po dohodě s autorem.</footer>',
            f'<footer>Neoficiální návrh webu pro {E(c["name"])}. Texty vycházejí z vašich současných stránek, ceny a údaje u vín jsou ilustrační. © 2026 Tomáš Ledvina – koncept, použití jen po dohodě s autorem.</footer>')
    # vína a značka
    a = s.index("window.VINO=["); b = s.index("];", a) + 2
    s = s[:a] + "window.BRAND=" + json.dumps(brand, ensure_ascii=False) + ";\nwindow.VINO=" + json.dumps(V, ensure_ascii=False) + ";" + s[b:]
    # bedna: sleva / doprava
    if c.get("discount", .1) == 0:
        s = rep(s, "disc=n>=6,fin=disc?Math.round(sum*.9):sum", "disc=false,fin=sum")
        s = re.sub(r'hint\.textContent=n===0\?.*?;\n', 'hint.textContent=n===0?"Klikněte na víno a vložte ho do bedny":n<6?`Ještě ${6-n} ${lahvi(6-n)} a máte dopravu zdarma`:n>=MAX?"Větší odběr rádi domluvíme e-mailem":"Doprava zdarma";\n', s, count=1, flags=re.S)
    # cesty ke sdíleným skriptům
    s = re.sub(r'<script src="(hero3d|vyroba3d|sud3d)\.js\?v=\d+"></script>', lambda m: f'<script src="../vinarstvi/{m.group(1)}.js?v=5"></script>', s)
    out = ROOT / c["slug"] / "index.html"; out.parent.mkdir(exist_ok=True); out.write_text(s, encoding="utf-8")
    print("hotovo:", out.relative_to(ROOT))

if __name__ == "__main__":
    for p in sys.argv[1:]: main(p)
