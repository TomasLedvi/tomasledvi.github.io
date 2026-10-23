/* Nastavení firmy pro sledování zakázky. Pro nové řemeslo stačí zkopírovat tenhle soubor a upravit ho. */
window.FIRMA={
  id:'kanocar',
  nazev:'KANO CAR',
  podnazev:'Karosárna Šestajovice',
  telefon:'+420603919651',telefonText:'603 919 651',
  adresa:'Ženíškova 412, Šestajovice',mapa:'https://www.google.com/maps/search/?api=1&query=%C5%BDen%C3%AD%C5%A1kova%20412%2C%20%C5%A0estajovice',
  oteviraci:'Po–Pá 8:00–17:00',
  barva:'#e0242f',barva2:'#ff5a63',
  pismoNadpisu:'"Big Shoulders Display"',pismaUrl:'https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;800&family=Schibsted+Grotesk:wght@400;500;600&display=swap',
  predmet:'Vozidlo',
  kroky:[
    {k:'prijato',nazev:'Přijato',popis:'Auto je u nás v dílně a prohlédli jsme poškození.'},
    {k:'klempirina',nazev:'Klempířina',popis:'Vyrovnáváme plech, aby pod lakem nezůstala ani vlnka.'},
    {k:'priprava',nazev:'Tmel a příprava',popis:'Brousíme do ztracena a zakrýváme zbytek auta.'},
    {k:'lakovani',nazev:'Lakování',popis:'Díl je v lakovacím boxu, odstín ladíme k původnímu laku.'},
    {k:'lesteni',nazev:'Leštění',popis:'Leštíme a kontrolujeme za denního světla.'},
    {k:'hotovo',nazev:'Hotovo k vyzvednutí',popis:'Auto je připravené. Můžete si pro něj přijet.'}
  ],
  ukazka:{
    zakazky:[
      {kod:'KC-2611',predmet:'Škoda Octavia Combi',detail:'zadní dveře a blatník, kandy červená',jmeno:'Ukázkový zákazník',krok:2,predani:4,
       vzkaz:'Dobrý den, plech šel vyrovnat bez výměny dílu. Lakovat budeme zítra dopoledne.'},
      {kod:'KC-2614',predmet:'VW Golf',detail:'přední nárazník, škrábanec',jmeno:'Ukázkový zákazník 2',krok:0,predani:6,vzkaz:''}
    ],
    /* ukázkové fotky ke krokům (u skutečné zakázky fotí dílna mobilem) */
    fotky:{
      prijato:'https://d8j0ntlcm91z4.cloudfront.net/user_3JxAqGLPvN22taooKUlAO1hTSfT/hf_20261023_173327_8e988f6c-b687-458a-b973-a6d34e59a0c3.png',
      klempirina:'https://d8j0ntlcm91z4.cloudfront.net/user_3JxAqGLPvN22taooKUlAO1hTSfT/hf_20261023_173610_d13593bb-ffee-4f94-8366-b91d986551d8.mp4#t=2.6',
      priprava:'https://d8j0ntlcm91z4.cloudfront.net/user_3JxAqGLPvN22taooKUlAO1hTSfT/hf_20261023_173413_e64841f2-69aa-4da2-a6ca-45efadd8fe85.png',
      lakovani:'https://d8j0ntlcm91z4.cloudfront.net/user_3JxAqGLPvN22taooKUlAO1hTSfT/hf_20261023_173413_30397c5c-4896-4900-9f2c-8bad11e62a31.png',
      lesteni:'https://d8j0ntlcm91z4.cloudfront.net/user_3JxAqGLPvN22taooKUlAO1hTSfT/hf_20261023_173559_4be6f002-ff45-4d79-acee-49bd38b665dc.mp4#t=3.6',
      hotovo:'https://d8j0ntlcm91z4.cloudfront.net/user_3JxAqGLPvN22taooKUlAO1hTSfT/hf_20261023_173414_9cf96669-9745-464b-8030-c028d8354ef1.png'
    }
  }
};
