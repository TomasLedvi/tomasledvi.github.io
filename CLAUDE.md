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
  29. 10. odpoledne UX audit podle Tomášova zadání: příběh zkrácen (620vh/560vh), odkaz „Přeskočit animaci“, sekce „Jak to probíhá“
  (4 kroky) + prázdné místo na skutečné recenze, pruh čísel jen s ověřenými údaji, štítek „Orientační výpočet · nejde o cenovou nabídku“,
  kontrola telefonu ve formuláři, fallback bez JS, reduced-motion, galerie z klávesnice. Texty ověřeny proti tesarstvistybr.cz.
  29. 10. hero předělán podle Tomášova zadání „Authentic Craftsmanship“: nová statická úvodní sekce `.hero2` se skutečnou fotkou
  krovu s vikýři (071436c8, z jejich webu, 2560 px), nadpis „Krovy, střechy a stavby ze dřeva“ (ne verzálkami), CTA Nezávazná poptávka → #kontakt,
  Prohlédnout realizace → #reference; 3D příběh začíná až pod ní („Jak vzniká krov“). Živý web lze fotit Playwrightem v Higgsfield sandboxu (má internet).
  29. 10. večer v3 přes skill scroll-craft (brief + plán v `_gen/scrollcraft/builds/stybr/BRIEF.md`, registr `_gen/scrollcraft/FINGERPRINTS.md`):
  gramatika „continuous world s dokovaným pracovním stolem“ – 3D svět krov.js je `position:fixed` za celou stránkou, kamera jede podle
  `data-p0/p1` na sekcích (page.js `worldP()`), texty zastávek `.cue` uvnitř `.track` (fixed, okna podle polohy tracku), obsah v `.dock .sheet`.
  Hero = 3 vrstvy ze skutečné fotky krovu d921c4b4: pozadí s dokresleným místem pod krokvemi (ebc5e9e9.jpg, mobil c2c5a41c.jpg),
  titulek „Poctivé konstrukce. Na dlouhá léta.“, výřez krovu (125c47ac.webp, mobil c014b3f1.webp; rembg isnet v sandboxu zdarma,
  spodek výřezu se ztrácí do pozadí u hlavního trámu = společný kotevní bod škálování). Podpis = trám s tesařskými značkami I–V
  (vpravo, scroll je „vyřezává“, klik = skok; na mobilu jen u zastávek), stejné značky u nadpisů. Realizace = boční pás fotek (pan, 2,5× rychlejší).
  Engine scroll-craftu ani shoot.mjs nepoužíváme (vlastní Three.js svět); ověřovací skript je v scratchpadu (cue opacity, arch snímků).
- **Třetí chalupa U Smrčiny** (Janské Lázně, Krkonošská, 542 25; majitelé bratři Lukáš a Tomáš; +420 733 645 729, +420 603 416 095,
  chalupa-usmrciny@janskelazne.cz; BEZ vlastního webu, jen Booking 9,0/102 recenzí): ukázka `smrcina/` (31. 10.; hero = zimní diorama
  přehrávané scrollem, 126 snímků ze 2 videí Google Flow (Veo 3.1 Lite): sjezdovka → chalupa → do mraků → statický pohled shora s „Zima je krátká“ + „Pod Černou horou“ (rozhledna a noční sjezdovka vyřazeny 31. 10. na Tomášovo přání), mraky přes přechody; písma Zilla Slab + Work Sans ve `smrcina/fonts/` (od 4. 11., Tomáš vybral variantu C; dříve Cormorant + Onest); pod tím celý web
  z údajů z Bookingu: o chalupě, ubytování, okolí zima/léto, restaurace, galerie, hodnocení, ukázkový kalendář + formulář, info, kontakt).
  Fotky a recenze hotlinkované z cf.bstatic.com (Booking) – jen pro ukázku majitelům, při zakázce originály. Formulář zatím demo (Web3Forms doplnit).
  4. 11. HERO předělán na „Živé okno“ jako u Lípy: den = Booking fotka 875368038 (hotlink), soumrak/noc/zima = Tomášovy AI úpravy `smrcina/img/h_{dusk,night,winter}.webp`; počasí Janské Lázně (50.633, 15.783) Open-Meteo → MET Norway, karta ukazuje výšku sněhu; režimy Živě/Léto/Soumrak/Noc/Zima; diorama (frames/) z úvodu vyřazeno, soubory zůstaly.
  Zdroj: /home/claude/smrcina-web/source.html (mimo repo). Argument do telefonu: provize Bookingu vs. přímé rezervace.
- **Hotel a restaurace Lípa** (Cínovec 99, Dubí; IČO 64026167 dle Firmy.cz; 603 426 109, 605 310 922, lipa-hotel@seznam.cz, stehlicidl@seznam.cz;
  8 pokojů / 20 lůžek + přistýlky, restaurace 24 míst, salonek 45, terasa, svatby/školy v přírodě/firmy; web jen hotellipa.webmium.com (bezplatný builder s reklamou);
  Firmy.cz restaurace 3,7 z 21 hodnocení – číslo na webu neukazujeme): ukázka `lipa/` (1. 11.). Tomáš chtěl kratší úvody a místo videa „něco prémiovějšího“ →
  HERO „Živé okno“: skutečná fotka hotelu (webmium u02) rozložená na vrstvy v Higgsfield sandboxu (rembg isnet + barevný flood fill oblohy, skripty v sandboxu ~/lipa: sky.py, lights.py, snow.py),
  vlastní obloha na canvasu podle polohy slunce (výpočet v JS) a oblačnosti, sníh/déšť/mlha podle Open-Meteo (GPS 50.7338, 13.7623), večer svítí okna a nápis RESTAURACE (vrstva lights),
  sníh na střeše při sněhové pokrývce (vrstva snow), parallax myší, přepínač „Vyzkoušejte: Živě/Den/Soumrak/Noc/Sněží“, karta „Na Cínovci právě teď“.
  Vrstvy na CloudFrontu: fg f090cc0a…, wall 556ae2de…, lights 9682eec2…, snow 7c7f5204… (plná URL v lipa/index.html). Ostatní fotky hotlink z webmium.blob.core.windows.net.
  Pozor: mix-blend multiply vrstva uvnitř transformovaného kontejneru nad průhlednem = bílá plocha → tónování maskované fotkou (mask-image). Zdroj: /home/claude/lipa-web/source.html (mimo repo, /*FONTS*/ se nahrazuje fonts.css).
  1. 11. odpoledne v2: písma Urbanist (tenké nadpisy, 200) + Montserrat (prostrkané popisky) – náhrada za Tomášův Qunotz (DEMO font jen pro osobní použití, chybí ť; až koupí licenci, vyměnit), paleta (finál 1. 11.): tmavě smrková #0d1714 / krém #f3eee6 / měď #e0946a (Tomáš vybral z variant A–D, náhled ?barvy=A..D zůstal v kódu). Nová vrstva světel lights2 72ee2ec8… (okna s texturou záclon místo plných obdélníků, jemnější nápis), noc a soumrak světlejší. 1. 11. v3: HERO předělán na 4 celé fotky s prolínáním – den = originál z webmium (1006257.jpg), soumrak/noc/zima = Tomášovy AI úpravy v `lipa/img/` (dusk/night/winter.webp; AI přepsala ceduli nad vchodem na „HOTEL BÍLÝ TÁBOR“ → opraveno na „HOTEL LÍPA · LINDE“ vlastním textem v PIL). Výběr podle polohy slunce, zima při sněhové pokrývce/sněžení; režimy Živě/Den/Soumrak/Noc/Zima. Vrstvy fg/wall/lights/snow + obloha canvas už se nepoužívají. Přepínač CZ/DE nahoře (i18n.js ve zdroji, slovník CZ→DE, výchozí podle jazyka prohlížeče, localStorage lipa-lang). Sekce: hotel, pokoje (pás), restaurace + otevírací doba z Firmy.cz, akce (předvyplní poptávku), Tehdy a dnes (posuvník pohlednice vs. dnes), okolí zima/léto, 2 recenze z Firmy.cz, poptávka (demo).
  Živý web lze fotit Playwrightem v Higgsfield sandboxu: require('/usr/local/lib/node_modules/playwright'), python bez PYTHONPATH pro venv.
- **Pedikúra Prostějov** (poptávka z portálu 2. 11. 2026: web pro začínající pedikérku, start živnosti 1. 12. 2026, rozpočet do 35 000 Kč,
  růžová/oranžová, bezpatkové písmo + kreslené nadpisy, CMS, statistiky, lokální SEO do 15 km; jméno, adresa, telefon ani ceny NEZNÁME):
  ukázka `pedikura/` = 3D verze (Three.js 0.147 + GSAP ze `pedikura/vendor/`; plovoucí dóza, sérum, laky, kleště, nůžky, pilníky,
  ručník, lístky a kapky modelované v kódu – lathe/extrude, žádné GLB; připnutý hero, kamera najede k dóze; mapa chodidla „Co vás trápí“;
  všechny neznámé údaje jako čárkované placeholdery `.ph`). `pedikura/verze-1/` = první světlé demo „Lehký krok“ (stopy, kalkulačka,
  před/po, tipy, FAQ; jméno Petra a ceny jsou ukázkové). Fotky chodidel a místnosti vygeneroval Tomáš v ChatGPT (AI, při zakázce nahradit).
  Doporučeno: Pages CMS (spolupracovník přes e-mail, bez GitHubu), rezervace přes Reenio/Reservio místo vlastního systému,
  pro ostrou 3D verzi skutečné GLB modely (TRELLIS nebo Sketchfab/Fab). Cenové pásmo: jednodušší verze ~18–25 tis., 3D ~30–35 tis.
- **DERATIZACE 3D** (3 D, spol. s r.o., Veslařská 169, Ústí n. L. – Neštěmice; tel. 472 731 510, nonstop 606 879 380, 3dsro@centrum.cz,
  Po–Pá 7–15; jednatelé dle Živéfirmy: Jana Králová, Jan Šafr, Jana Netušilová; IČO neověřeno): tip od Tomášova kolegy z HZS (firma jeho mamky).
  Jejich doména 3dsro.cz ukazuje jen parkovací stránku Vedosu (4. 11. 2026) = web nejede. Ukázka `deratizace/` (4. 11.; tmavá noc + ambra,
  písma Bricolage Grotesque + Instrument Sans z Google Fonts; hero = baterka na canvasu najde švába, mravence a myš („Nalezeno: …“),
  vlna zásahu je rozpráší, pak kužel sleduje kurzor; výběr škůdce se 3 sloupci rad, služby, HACCP pro firmy s odškrtávaným záznamem,
  postup, bezpečnost, FAQ + JSON-LD, formulář Web3Forms s placeholderem `WEB3FORMS_KEY`). Bez fotek a recenzí – při zakázce vyžádat.
  Při hovoru zjistit, kdo má přístup k doméně 3dsro.cz.
  4. 11. večer v2 redesign „jako od designéra“: celý web tmavý, písma Archivo (šířková osa) + Public Sans,
  self-hosted v `deratizace/fonts/`; Atlas škůdců = karta na „kostěném“ papíře se siluetou (SVG v kódu), velikostí a 3 sloupci rad;
  služby jako tři obří D (Deratizace/Dezinsekce/Dezinfekce); jemná zrnitost + světlo kurzoru po celé stránce. Hero s fotkou kuchyně a spritey z ChatGPT Tomášovi nesedl (4. 11.) → zpět kreslená scéna, propracovaná: kachlíky se spárami, podlaha v perspektivě, trubka s odleskem, zásuvka, kuchyňská linka s úchytkami (vše předkreslené do offscreen canvasu `buildRoom()`), škůdci kreslení kódem s animací nohou (šváb s chůzí, myš běhá a zastavuje, mravenci v řadě), prach ve světle baterky. Latinské názvy v Atlasu na jeho přání odstraněny (font Newsreader smazán).
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
- scroll-craft (github.com/nateherkai/scroll-craft, MIT, 29. 10.): skill na prémiové scroll weby – vrstvený hero (pozadí/subjekt/popředí
  jako samostatné průhledné vrstvy s různou rychlostí), video přehrávané scrollem (`encode.sh`: hustý GOP -g 8, mobil 720p -g 4),
  „device kit“ (scrub, pin, reveal, pan…, min. 4 různé typy, nikdy stejný dvakrát po sobě), jeden vrchol stránky, ověřovací skript shoot.mjs
  (mrtvý scroll, kontrast, kontaktní arch). Generuje přes kie.ai (my máme Higgsfield → nepotřebujeme). Plugin do Claude Code CLI;
  kopie je v repu `_skills/scroll-craft/` (commit 75d81f7 z 30. 9. 2026) – číst `SKILL.md` + `references/`; zip k nahrání do účtu poslán 29. 10.. Pozor: zakazuje šipky „scroll“,
  počítadla 01/06 a vymyšlená čísla – sedí s Tomášovými pravidly. Rozhoduje Tomáš, kdy ho použít.
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
