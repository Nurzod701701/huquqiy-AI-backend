"use strict";
// QOMUS Advokat PRO: entry dashboard only; no confidential data stored.
module.exports = function advokatProPage(lang, appLayout) {
  const q = "?lang=" + encodeURIComponent(lang || "uz");
  const card = (title, description, href, label) =>
    '<article class="surface surfacePad" style="margin-bottom:16px"><h3 class="cardTitle">'+title+
    '</h3><p class="cardDescription">'+description+'</p><a class="btn btnGold" href="'+href+'">'+label+'</a></article>';
  const main =
    '<section class="surface surfacePad" style="margin-bottom:18px">'+
    '<h1>QOMUS — Advokat PRO</h1>'+
    '<p>Professional huquqiy ish muhiti. Hozircha boshlang‘ich kabinet: yangi mijoz ma’lumotlari va fayllar bu sahifada saqlanmaydi.</p>'+
    '<div class="notice noticeGold"><span class="noticeIcon">!</span><span>Advokatlik siriga oid materiallarni maxsus himoyalangan ishlar kabineti ishga tushmaguncha ushbu bo‘lim orqali yuklamang. Har qanday hujjatni topshirishdan oldin advokat tekshiradi.</span></div></section>'+
    card('Da’vo konstruktori','Mavjud da’vo yaratish va sudni tanlash mexanizmi.','/documents'+q,'Hujjatlarni ochish')+
    card('Sudga yo‘naltirish','Hudud va nizo turiga qarab mavjud sud tanlash shakli.','/claim'+q,'Sud tanlash')+
    card('Huquqiy materiallar','Mavjud QOMUS huquqiy yordam bo‘limlariga qaytish.','/'+q,'Bosh sahifa')+
    card('Advokatlar rasmiy reyestri','Ochiq rasmiy manbada advokat va advokatlik tuzilmasini tekshirish. Manzillar bu kabinetda hozircha saqlanmagan.','https://e-advokat.uz','E-advokat reyestri')+
    '<section class="surface surfacePad"><h3>Keyingi bosqich</h3><p>Himoyalangan mijozlar va ishlar kabineti, ruxsatlar, audit jurnali, hujjatlar va muddatlar nazorati alohida amalga oshiriladi.</p></section>';
  return appLayout(lang, "documents", main, "Advokat PRO", "Advokatlar uchun professional ish muhiti");
};
