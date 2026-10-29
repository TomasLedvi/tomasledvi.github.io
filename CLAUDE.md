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

## Stav klientů (k 19. 10. 2026)
- **Ing. Jaromír Veselý** (projektant, Sedlčany): HOTOVO a ZAPLACENO (12 000 Kč, výzva k úhradě č. 2026001).
  Jeho rodné číslo nikde nezveřejňovat.
  Ostrý web https://projekty-vesely.cz = repozitář `TomasLedvi/projekty-vesely` (GitHub Pages, doména u Wedosu).
  Formulář přes Web3Forms (účet Tomáše, klíč 3edf4b38-3fbf-445b-a25c-84f1d845e8cb, příjemce prokon-vesely@volny.cz).
  Search Console + Bing hotové, Seznam ohlášen přes IndexNow (klíč b9c4cd543e404532bb70c293790deaa2).
  Zkušební poptávka DORAZILA (potvrdil 19. 10.), ale spadla mu do hromadné pošty – hlídá si ji.
  Poděkoval za spolupráci, „ozve se s www stránkami pro manželku“ (ubytování) → další zakázka.
  Případně Firemní profil Google (zatím nechce). O referenci + svolení použít web v portfoliu požádat AŽ PO
  předání webu pro manželku (Tomášovo rozhodnutí 19. 10.). Poslán návod na filtr „Poptávky z webu“ (web3forms.com).
- **SKIP** (střechy): návrh `skip/` hotový (scroll video stavby střechy, opravené načítání na iPhonu),
  e-mail připravený, Tomáš ho zatím odložil.
- **Karásek a Stülpner** (pivovar Chomutov, IČO 02193744): návrh `karasek/` hotový (Three.js lahve se skutečnými
  etiketami, vlající zatykač „Hledají se“, čísla od nuly, čára postupu u „Jak vaříme“, basa, prohlídky).
  E-mail ODESLÁN (Tomáš, 18. 10. 2026), čeká se na odpověď. Cenový návrh: cca 18 tis. základ, DE verze +3–5 tis.,
  správa 300–500 Kč/měs. Assety na CloudFrontu: etikety karaskova 47c9b56e…, stulpnerova 004a0953…,
  podloudnicka 37c2c925…, kvidona 4180b342… (plné ID v `karasek/hero3d.js` a `karasek/index.html`).
- **Bohuňovský** (instalatér a topenář Brno-Židenice, IČO 15567249, od 1992, tradice po dědečkovi): ukázka `bohunovsky/`
  (20. 10.; celostránkové realistické 3D pozadí bg3d.js: obkladová stěna, měď, bronzové lisovací tvarovky, objímky, kurzor = baterka, klik na kohout zastaví/pustí tok, šipky směru toku, rozdělovač služeb voda/topení/plyn, scroll stavba koupelny,
  trubka přes stránku plnící se vodou). 20. 10. večer přepnuto na SVĚTLÝ vzhled (mramor Calacatta z Higgsfieldu, 3 desky, ID ve world.js) a celé předěláno na 3D svět `world.js`: kamera jede po kolejích svázaných se sekcemi (stěna → servisní stěna s ventily/vodoměrem/manometrem → koupelna x=96 → zpět), úvod = průlet trubkou v rentgenu + rozložený lisovaný spoj s popisky, u kurzoru rentgenová lupa (2. průchod, vrstva 1, skryté rozvody ve zdi), koupelna se staví scrollem (výkres na podlaze + laser → růst trubek → obklady → vana, WC, umyvadlo, zrcadlo, žebřík, napouštění vany), tlačítka s vodou (napuštění, proud po obrysu, kapka v menu, ventily u záložek). Testy: `window.__snap=true`, `window.__cam`, `window.__intro.t`; SwiftShader je pomalý (spouští záložní ukončení úvodu po 12 s). Na jeho webu je Reference jen šablonový text a druhý odkaz nefunguje.
  Tomáš mu volá ráno 21. 10. s hotovou ukázkou (poctivě: „připravil jsem vám ukázku“).
- **BLEACH DENT CLINIC s.r.o.** (zubní klinika Most, IČO 30147751, založena 13. 10. 2026, sídlo Jaroslava Ježka 168/6, jednatelé dle ARES; web ani telefon nenalezeny): návrh `bleachdent/` (22. 10.; světlý, 3D zub z brom-dent bělá při scrollu podle stupnice VITA; služby označené jako ukázkové). Oslovení DOPISEM s QR kódem (PDF připraveno, Tomáš doplní telefon a datum). Zdroj leadů: ARES dotaz na IČO 3008000x–3017500x (nové firmy 15. 9.–22. 10.), dopis = legální cesta bez telefonu.
- **Vodoinstalatérství Jan Hotárek** (Klášterec n. O., IČO 63741555 aktivní, od 1995 dle jeho karty na ceskestavby.cz; jan.hotarek@seznam.cz, 603 178 325, Polní 653 Miřetice; BEZ webu; služby + autorizovaný servis kotlů EKOKOMFORT): návrh `hotarek/` (22. 10.; tmavý, 3 filmové scény z Higgsfieldu přehrávané scrollem jako sekvence snímků: kapka z baterie, výkres → koupelna, měď → kotel; Kling 3.0 std 5 s po 7,5 kr., obrázky gpt_image_2_5). Plán: osobní e-mail na míru (Tomáš chce e-mail, ne telefon).
- **KANO CAR – karosárna, s.r.o.** (Šestajovice, Ženíškova 412, IČO 49613065, zapsána 1993, sídlo v Šestajovicích od 1994; jednatel Martin Noha dle ARES;
  603 919 651, canocar@email.cz dle Firmy.cz, Po–Pá 8–17; klempířina, lakování, mechanika, prohlídky havarovaných vozidel, krycí dopis u smluvních pojišťoven,
  geometrie, oleje Agip a Texaco, příprava na STK a emise; BEZ webu): návrh `kanocar/` (23. 10.; tmavý, jeden připnutý záběr ze 3 videí Kling – promáčklina → tmel a maskování
  → lakovací box → lesk, kolejnice kroků 01–04; před/po posuvník s výběrem odstínu přes mix-blend-mode:hue; fonty Big Shoulders Display + Instrument Serif + Schibsted Grotesk + IBM Plex Mono).
  Higgsfield: obrázky 8e988f6c (před), e64841f2 (tmel), 30397c5c (box), 9cf96669 (po); videa d13593bb, b2ec3812, 4be6f002. Lead z ověření lakoven (Firmy.cz) 23. 10.
  24. 10. zkoušen redesign podle taste skillu (commit 4414b02: věta s okénkem, Imbue, MetallicPaint v závěru) – Tomášovi se
  NELÍBIL, vráceno na předchozí verzi. Ponaučení: jeho původní tmavý „filmový“ styl s více efekty má radši než střídmý
  „award“ styl taste skillu; skilly používat spíš na dílčí vylepšení než na celkové přestavby.
  Sekce „Vrstvy laku“: řez lakem (ocel, tmel, plnič, barva, bezbarvý lak) vyrenderovaný v Blenderu, 128 snímků v `kanocar/vrstvy/` + polohy popisků v `layers.js`.
  Blender: na Macu chybí MCP doplněk, proto render v kontejneru přes `pip install bpy` (Cycles CPU, ~10 min); skript `_gen/blender_vrstvy_laku.py` (`NF=128 SPP=28 RX=1120 RY=630 python3 … -- out 0:128`, ~20 min).
- **Zahradní maringotky** (výroba maringotek, tiny house, dětských domečků a stánků; Otročín 61, 346 01, Karlovarský kraj;
  IČO 15463265; +420 704 708 946, +420 774 416 465, info@zahradnimaringotky.cz; web zahradnimaringotky.cz = WordPress,
  v patičce chyba „Copyright © [year]“): ukázka `maringotky/` (25. 10.; tmavý les, fonty Anybody + Hanken Grotesk – Fraunces/Jost
  se Tomášovi pletly s webem Veselého; úvod = jeden den a rok scrollem: jaro ráno → léto → podzim s listím → zimní noc se sněhem,
  hodiny 06:40→22:15, SVG maringotka s točícími se koly jako záloha za 3D; řez stěnou z Blenderu (`_gen/blender_stena_maringotky.py`, 72 snímků WebP s průhledností v `maringotky/stena/` + `labels.json`, render `NF=72 SPP=20 RX=960 RY=720 python3 … -- out 0:72` ~26 min; skladba stěny zatím obecná – ověřit s firmou); AR „Zobrazit na zahradě“
  přes model-viewer ar + QR (qrious); 3D maringotka otáčená scrollem přes model-viewer, katalog 9 modelů se skutečnými cenami + sestavení poptávky do e-mailu, výbava 01–06,
  galerie, FAQ). Fotky z jejich webu (jen 800 px, s vodoznakem; při zakázce vyžádat originály). 3D modely z TRELLIS.2
  (Hugging Face demo, Tomáš nahrává fotky sám, je přihlášený jako Tomikleda) → `maringotky/models/drevo.glb`
  a `antracit.glb` (25. 10. dodán Tomášem jeden model v metrech, 6,2 m, 11 tis. trojúhelníků, bez textur; dřevěné materiály
  měly bílou barvu → v GLB nastavena barva obkladu ve dvou variantách; 25. 10. v Blenderu vyměněny terénní pneumatiky za litinová kola s loukotěmi, odstraněny blatníky, přidány schůdky ke dveřím – `_gen/blender_maringotka_kola.py`). Úvod ukazuje celou scénu `models/scena_*.glb` (maringotka v lesním údolí – terén ~90 m se svahy, pás bližšího a vzdáleného lesa, kvantizováno gltf-transform; okolí: Tomášův okoli.glb z ChatGPT vylepšený skriptem `_gen/blender_okoli_maringotky.py` – organické smrky, trsy trávy, kvítí, kameny, kapradí, hromada dřeva, lucerna; barvy přes vertex colors), AR jen samotnou maringotku; plameny a lucerna blikají přes materiály model-vieweru.
  model-viewer a qrious hostujeme ve `vendor/` (unpkg/cdnjs z kontejneru nejdou). K ověření s firmou: kroky postupu, odpovědi v FAQ, otevírací doba
  Po–Pá 7–16 (z ČESKÉSTAVBY). Hero = celá 3D scéna `models/scena_*.glb` (`_gen/blender_okoli_maringotky.py`, hustý les, za maringotkou otevřené údolí kvůli obloze); kamera v objektu `CAM` v index.html; oheň = canvas `.firecv` mimo model-viewer, poloha z `queryHotspot('hotspot-fire')` (filtr jasu na model-vieweru by ho jinak ztlumil). Lead v Obvolávání (`zahradni-maringotky`); další 3D leady tam: Finka sauny, Jana Blacká.
- **Bustan Kebab** (Teplice, Benešovo nám. 776/13, IČO 17315263, +420 774 897 322, bustankebabteplice@gmail.com; Tomášův oblíbený kebab; BEZ webu, jen Foodora):
  ukázka `bustan/` (28. 10.; tmavý, hero = 3D animace z Blenderu přehrávaná scrollem, 240 snímků v `bustan/frames/`: dvě jehly hovězí/kuřecí
  na grilu → elektrický nůž odřízne maso → padá do kapsy pide (čtvrtka kulatého chleba) → zelenina, sýr (rigid body fyzika, zapečeno do klíčů)
  → česneková a pálivá omáčka z lahviček (metaballs). Skripty `_gen/bustan/` (`build.py` + `parts2.py`, `KEBAB_FAST=1` pro rychlý test, simulace ~6 min v kontejneru).
  Finální render na Tomášově MacBooku Air (Blender 5.4, Metal GPU, ~10 s/snímek, 64 spp): v Blenderu záložka Scripting → konzole → `mac_finalize.py`
  (stáhne AI textury z Higgsfieldu – z kontejneru CloudFront 403 – a přepne na GPU) → render animace. Mac při renderu nesmí usnout.
  Ceník je ORIENTAČNÍ (odvozený od Bustan Kebab Praha, Foodora Teplice nešla načíst) – při zakázce vyfotit jejich tabuli. Otevírací doba podle Google (zdroje se liší).
- **Tesařství Štýbr** (Liberec, Na Bídě 566/4, 737 708 433, stybr13@gmail.com; od roku 1992; tesařství, pokrývačství, sádrokartony;
  Liberecký kraj, Mladá Boleslav, Praha; IČO neověřeno – Živéfirmy uvádí 16260023, v ARES dohledat): jejich web tesarstvistybr.cz (WordPress 2020)
  má `noindex,nofollow` → Google je nevidí (ověřeno 29. 10. 2026) = hlavní argument do telefonu. Ukázka `stybr/` (29. 10., cílová cena ~40 tis.):
  3D příběh „Od kmene ke střeše“ v reálném čase (`krov.js`, Three.js r128, procedurální textury: kůra, smrk, letokruhy): kmen → odletí kůra → trám →
  křídová šňůra → čep, dlab, kolík → zdi → stropní trámy, pozednice, sloupky, vaznice, krokve s tesařskými značkami I–XII, kleštiny → laťování →
  krytina po řadách (clipping plane) + střešní okna, hřebenáče, měděné okapy a svody, štíty. 29. 10. v2 „web, který prodává“: moderní vzhled,
  fonty Mona Sans (široký řez 125 %, nadpisy) + Martian Mono, self-hosted ve `vendor/fonts/` (OFL). HOOK = kalkulačka střechy (`strecha.js`):
  sedlová/valbová/pultová, rozměry, sklon, 5 krytin s barvami, střešní okna, nová/výměna → 3D dům živě + plocha, tašky, latě, hřeben, okapy, svody
  → jedním klikem do poptávky (koeficienty orientační). Druhá záložka = konfigurátor pergoly (`konfigurator.js`). Společné 3D díly v `stavba.js`
  (window.STAVBA: textury, krytiny, dům, okapy, okna, smrky, tráva). Ukazatel postupu příběhu vpravo (Dřevo, Míra, Spoj, Krov, Střecha),
  mobilní lišta Zavolat/Spočítat. Fotky jsou z jejich webu (importované na Higgsfield CloudFront přes media_import_url,
  URL `<id>.png`, i když jde o JPEG) – při zakázce vyžádat originály.
- Ostatní složky jsou starší ukázky; stav jednání u nich ověřit s Tomášem.
- Obvolávání (19. 10.): artifact „Obvolávání firem“ https://claude.ai/artifact/SBevjYz2MhNeh2o3Dk5d9h
  (db kolekce `leads`, 20 firem z celé ČR se starým/žádným webem, stav + poznámky z hovorů; číst přes ArtifactData).
  Postup: nejdřív telefon, e-mail s ukázkou až po souhlasu (zákon 480/2004 Sb. – žádné hromadné e-maily).

## Sledování zakázky (`sledovani/`, 24. 10. 2026) – produkt pro měsíční poplatek
- „Pizza tracker“ pro řemeslníky: dílna v mobilu posune krok / přidá fotku / vzkaz, zákazník na odkazu vidí stav živě.
- Šablona: `core.js` + `core.css` společné, firma = jeden soubor `firmy/<id>.js` (název, barva, písmo, kroky, ukázková data).
  Nové řemeslo = zkopírovat `firmy/kanocar.js` a upravit kroky (ukázka: `firmy/instalater.js`).
- Stránky: `index.html` (předváděčka – dva mobily vedle sebe, přepínač řemesla), `zakaznik.html?f=&z=`, `dilna.html?f=`.
- Ukázka ukládá do localStorage + BroadcastChannel (funguje jen v jednom prohlížeči). Ostré nasazení: vyměnit objekt STORE
  v `core.js` za databázi (např. Supabase), přidat přihlášení dílny, SMS/e-mail s odkazem, GDPR (fotky mohou ukazovat SPZ).
- Fotky v ukázce: Higgsfield obrázky a snímky z videí přes `video#t=sekunda`.

## Nápady na další kroky
- Tomášův vlastní web s portfoliem a značkou; reference od pana Veselého.
- Promo videa (TikTok/Reels/FB): „před a po“, jen s webem klienta se souhlasem nebo s vymyšlenými firmami.
- Motion-graphics videa (styl „Claude cooked“: velké texty, odpočítávaná čísla, skládající se dashboardy, maskot),
  dělané kódem (HTML/JS animace → Playwright → ffmpeg MP4), bez kreditů. Plán na úterý 20. 10.:
  1) promo Tomášovy služby (~20 s, 9:16: starý web se rozpadne → animovaný web → podpis; zeptat se na jméno/značku),
  2) případně krátké video k návrhu pro Karáska (jen neveřejně).
  Cíl: nabízet firmám videa na Instagram/FB/TikTok, i v balíčku s webem nebo měsíčně ke správě.
- React Bits (github.com/DavidHDev/react-bits, 23. 10.): knihovna animovaných komponent (pozadí, kurzory, text, karty).
  Licence MIT + Commons Clause: používat ve webech klientů smíme (i placených), NESMÍME komponenty samotné prodávat/šířit
  (např. jako balíček nebo skill). Naše weby jsou čisté HTML/JS → komponentu přepsat do vanilla JS. Tipy: MetallicPaint
  (lakovny), LiquidEther/Ferrofluid (voda), GlareHover, CountUp, ScrollVelocity, TextPressure, MaskedHeading.
- Taste skill (design-taste-frontend) nainstalován 23. 10. – NEPOUŽÍVAT pro Tomášovy ukázky, pokud si o něj výslovně neřekne
  (25. 10. znovu udělal web příliš střídmý; Tomáš chce tmavý filmový styl s efekty jako `vinarstvi/`).
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
- Na začátku každého nového videa dát Tomášovi krátký dotazník (AskUserQuestion, max 4 otázky s volbami):
  pro koho a kam (platforma/formát), pocit/styl, délka, co tam musí být (texty, logo, kontakt) + požádat o referenci.
  Pak hned náhled, ne dlouhé plánování.
- Trailer „Sledování zakázky“ (24. 10.): `trailer.html` (1920×1080, 30 s, GSAP, seek), zvuk `sfx_trailer.py`,
  render `FPS=30 python3 render169.py <abs html> video out.mp4`. Příběh: otravné hovory „Tak co, už to bude?“ → klepnutí v dílně →
  zákazník vidí → přínosy → hotovo → web + sledování jako balíček → Tomáš Ledvina. Jen pro schůzky (je v něm KANO CAR).
  Fotky v `ta/` (mimo git): before/tmel/box/after.jpg + web.png – nahradit skutečnými z CloudFrontu přes prohlížeč na Macu.
- Tomáš má doma PC s RTX 2060 (rychlejší render), zatím neřešíme.
- Skilly pro videa/animace (18. 10. připraveny jako zip k nahrání do jeho účtu, prověřené, MIT): motion-design
  (github.com/lottiefiles/motion-design-skill), design-dna (github.com/zanwei/design-dna), genjutsu
  (github.com/AThevon/genjutsu – cast/paint, uvnitř i GSAP a Three.js). Genjutsu „bunshin“ NEPOUŠTĚT
  (paralelní subagenti, miliony tokenů). Pokud v seznamu skillů nejsou, naklonovat repo a číst SKILL.md přímo.
