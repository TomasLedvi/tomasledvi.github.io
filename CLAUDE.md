# Ukázkové weby Tomáše Ledviny – poznámky pro Clauda

Tomáš prodává malým firmám weby s animacemi. Claude weby navrhuje a staví,
Tomáš jedná s klienty a sám posílá všechny e-maily. Mluvit česky, tykat.

## Pravidla
- Nikdy nic neposílat za Tomáše (e-maily, zprávy). Jen návrhy textu, bez tučného písma.
  V podpisech ledvina.tomi@gmail.com (gametom2002 nepoužívat).
- Neutrácet (Higgsfield kredity, platby) bez jeho souhlasu – nejdřív říct cenu.
- Nic nevymýšlet: údaje o firmách jen ověřené (ARES, jejich web, Facebook).
- Na ostrém webu projekty-vesely.cz nic neměnit bez Tomášova souhlasu.
- Ukázky cizích firem nepublikovat veřejně (TikTok apod.) bez jejich svolení.
- HZS: k výdělečné činnosti potřebuje písemný souhlas služebního funkcionáře (§ 48 zák. 361/2003 Sb.); živnost zatím nemá.

## Tento repozitář (GitHub Pages: https://tomasledvi.github.io/)
- Každá ukázka je složka (`skip/`, `karasek/`, `vesely/`, `vinarstvi/`…), nasazení = commit + push na `main`.
- Čekání na nasazení:
  `for i in $(seq 1 50); do r=$(gh run list -L 1 --json headSha,status -q '.[0].headSha[0:7]+" "+.[0].status'); [ "$r" = "$(git rev-parse --short=7 HEAD) completed" ] && break; sleep 5; done`
- Generátory: `_gen/make.py` (projektanti/domy), `_gen/make_vino.py` (vinařství).
- Kontrola v reálném prohlížeči: built-in browser na Tomášově Macu. Pozor: v tom panelu neběží requestAnimationFrame,
  animace proto testovat lokálně přes Playwright (`python3 -m http.server`).
- Obrázky/videa hostujeme na Higgsfield CloudFront (`https://d2ol7oe51mr4n9.cloudfront.net/user_3JxAqGLPvN22taooKUlAO1hTSfT/<id>`),
  nahrávání: media_upload → PUT z prohlížeče na Macu → media_confirm.

## Stav klientů (k 18. 10. 2026)
- **Ing. Jaromír Veselý** (projektant, Sedlčany): HOTOVO a ZAPLACENO (12 000 Kč, výzva k úhradě č. 2026001).
  Jeho rodné číslo nikde nezveřejňovat.
  Ostrý web https://projekty-vesely.cz = repozitář `TomasLedvi/projekty-vesely` (GitHub Pages, doména u Wedosu).
  Formulář přes Web3Forms (účet Tomáše, klíč 3edf4b38-3fbf-445b-a25c-84f1d845e8cb, příjemce prokon-vesely@volny.cz).
  Search Console + Bing hotové, Seznam ohlášen přes IndexNow (klíč b9c4cd543e404532bb70c293790deaa2).
  Čeká se: potvrzení, že zkušební poptávka dorazila; případně Firemní profil Google (zatím nechce).
  Další možná zakázka: web pro jeho paní (ubytování).
- **SKIP** (střechy): návrh `skip/` hotový (scroll video stavby střechy, opravené načítání na iPhonu),
  e-mail připravený, Tomáš ho zatím odložil.
- **Karásek a Stülpner** (pivovar Chomutov, IČO 02193744): návrh `karasek/` hotový (Three.js lahve se skutečnými
  etiketami, vlající zatykač „Hledají se“, čísla od nuly, čára postupu u „Jak vaříme“, basa, prohlídky).
  E-mail ODESLÁN (Tomáš, 18. 10. 2026), čeká se na odpověď. Cenový návrh: cca 18 tis. základ, DE verze +3–5 tis.,
  správa 300–500 Kč/měs. Assety na CloudFrontu: etikety karaskova 47c9b56e…, stulpnerova 004a0953…,
  podloudnicka 37c2c925…, kvidona 4180b342… (plné ID v `karasek/hero3d.js` a `karasek/index.html`).
- Ostatní složky jsou starší ukázky; stav jednání u nich ověřit s Tomášem.

## Nápady na další kroky
- Tomášův vlastní web s portfoliem a značkou; reference od pana Veselého.
- Promo videa (TikTok/Reels/FB): „před a po“, jen s webem klienta se souhlasem nebo s vymyšlenými firmami.
- Motion-graphics videa (styl „Claude cooked“: velké texty, odpočítávaná čísla, skládající se dashboardy, maskot),
  dělané kódem (HTML/JS animace → Playwright → ffmpeg MP4), bez kreditů. Plán na úterý 20. 10.:
  1) promo Tomášovy služby (~20 s, 9:16: starý web se rozpadne → animovaný web → podpis; zeptat se na jméno/značku),
  2) případně krátké video k návrhu pro Karáska (jen neveřejně).
  Cíl: nabízet firmám videa na Instagram/FB/TikTok, i v balíčku s webem nebo měsíčně ke správě.
- Písemný souhlas HZS: Tomáš si zažádá, až přijde další nabídka.

## Videa (složka `_video/`, stav 18. 10. 2026)
- Hotové verze promo videa pro Tomáše (podpis „Tomáš Ledvina“ + ledvina.tomi@gmail.com, značku zatím nemá –
  Webdílna/Webmotion obsazené, Webkovárna se mu nelíbila):
  v1 `promo.html` (jednoduchá), v2 `promo2.html` (hook „Váš web je pořád z roku 2010“, efekty + zvuky `sfx.py`),
  v3 `promo3.html` (světlý tech styl, oranžová kulička-zákazník, hudba `sfx3.py`). Tomášovi přišly „staré“ oproti
  referencím (plynulé proměny, 3D, motion blur, 60 fps).
- 3D casting maskota `cast.html` (Three.js) – Tomáš VYBRAL postavičku 2 „Okénko“ (malý prohlížeč s obličejem
  na obrazovce, obličej se umí proměnit ve web). NEdělat maskota podobného Claudovi/logu Anthropicu.
- Plán na úterý: celé promo v novém stylu s Okénkem (jeden plynulý záběr, proměny, 60 fps, motion blur), pak šablona
  pro videa firmám. Postup: `npm i three @fontsource/instrument-serif`, 2D: `python3 render.py <abs cesta html> video out.mp4`,
  3D: `FPS=60 python3 render3d.py cast.html video out.mp4` (SwiftShader ~1,8 s/snímek → pouštět na pozadí),
  zvuk: `python3 sfx_*.py out.wav` (vše syntetizované, bez licencí), pak ffmpeg mux + loudnorm I=-15.
- Tomáš má doma PC s RTX 2060 (rychlejší render), zatím neřešíme.
- Skilly pro videa/animace (18. 10. připraveny jako zip k nahrání do jeho účtu, prověřené, MIT): motion-design
  (github.com/lottiefiles/motion-design-skill), design-dna (github.com/zanwei/design-dna), genjutsu
  (github.com/AThevon/genjutsu – cast/paint, uvnitř i GSAP a Three.js). Genjutsu „bunshin“ NEPOUŠTĚT
  (paralelní subagenti, miliony tokenů). Pokud v seznamu skillů nejsou, naklonovat repo a číst SKILL.md přímo.
