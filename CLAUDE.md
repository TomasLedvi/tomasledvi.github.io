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
- Ostatní složky jsou starší ukázky; stav jednání u nich ověřit s Tomášem.
- Obvolávání (19. 10.): artifact „Obvolávání firem“ https://claude.ai/artifact/SBevjYz2MhNeh2o3Dk5d9h
  (db kolekce `leads`, 20 firem z celé ČR se starým/žádným webem, stav + poznámky z hovorů; číst přes ArtifactData).
  Postup: nejdřív telefon, e-mail s ukázkou až po souhlasu (zákon 480/2004 Sb. – žádné hromadné e-maily).

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
- Na začátku každého nového videa dát Tomášovi krátký dotazník (AskUserQuestion, max 4 otázky s volbami):
  pro koho a kam (platforma/formát), pocit/styl, délka, co tam musí být (texty, logo, kontakt) + požádat o referenci.
  Pak hned náhled, ne dlouhé plánování.
- Tomáš má doma PC s RTX 2060 (rychlejší render), zatím neřešíme.
- Skilly pro videa/animace (18. 10. připraveny jako zip k nahrání do jeho účtu, prověřené, MIT): motion-design
  (github.com/lottiefiles/motion-design-skill), design-dna (github.com/zanwei/design-dna), genjutsu
  (github.com/AThevon/genjutsu – cast/paint, uvnitř i GSAP a Three.js). Genjutsu „bunshin“ NEPOUŠTĚT
  (paralelní subagenti, miliony tokenů). Pokud v seznamu skillů nejsou, naklonovat repo a číst SKILL.md přímo.
