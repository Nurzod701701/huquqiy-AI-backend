"use strict";
// Presentation-only enhancement: preserves QOMUS cards, labels, links, layout and functions.
const css = String.raw`<style id="qomus-service-icons-v1">
:root{--qomus-icon-navy:#102b4c;--qomus-icon-gold:#b69a6b}
.sideLink .sideIcon.qomus-svg-icon,.sourceCard .sourceIcon.qomus-svg-icon{
 display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;
 width:38px;height:38px;border-radius:12px;color:#285c90;
 background:#eaf1fa;border:1px solid rgba(36,91,145,.10);
}
.sideLink .sideIcon.qomus-svg-icon svg,.sourceCard .sourceIcon.qomus-svg-icon svg{width:21px;height:21px;stroke:currentColor;fill:none;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
.sideLink[href^="/ai"] .qomus-svg-icon{background:#f0ebff;color:#725cb4}
.sideLink[href^="/documents"] .qomus-svg-icon,.sideLink[href^="/legal-review"] .qomus-svg-icon{background:#e6f4ee;color:#267e65}
.sideLink[href^="/calculators"] .qomus-svg-icon{background:#fff1df;color:#9a6930}
.sideLink[href^="/family"] .qomus-svg-icon{background:#fbeeea;color:#93634e}
.sideLink[href^="/employment"] .qomus-svg-icon{background:#e5f1f9;color:#297595}
.sideLink[href^="/business"] .qomus-svg-icon,.sideLink[href^="/advokat-pro"] .qomus-svg-icon{background:#edf0fa;color:#435b95}
.sideLink[href^="/sources"] .qomus-svg-icon,.sourceCard .qomus-svg-icon{background:#e7eefc;color:#4268a0}
.sideLink[href^="/court"] .qomus-svg-icon{background:#f2eaf5;color:#7f5793}
.sideLink:focus-visible,.sourceCard:focus-visible{outline:3px solid #b69a6b;outline-offset:3px}
.qomus-legal-source-status{display:flex;flex-wrap:wrap;align-items:center;gap:9px;margin:10px 0 16px;padding:12px 15px;border:1px solid rgba(182,154,107,.36);border-radius:12px;background:rgba(255,249,234,.9);color:#4a3b29;font-size:14px;line-height:1.55}
.qomus-legal-source-status a{color:#183f6e;text-decoration:underline;text-underline-offset:3px;font-weight:700}
.qomus-legal-source-status strong{font-weight:800}
@media(max-width:600px){.sideLink .sideIcon.qomus-svg-icon,.sourceCard .sourceIcon.qomus-svg-icon{width:34px;height:34px;border-radius:11px}}
@media(prefers-reduced-motion:reduce){.sideLink .sideIcon.qomus-svg-icon{transition:none}}
</style>`;
const script = String.raw`<script id="qomus-service-icon-upgrade">
(function(){
 "use strict";
 const paths={
  home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
  ai:'<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
  document:'<path d="M7 3h8l5 5v12a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M15 3v6h5M9 13h7M9 17h7"/>',
  review:'<path d="M7 3h8l5 5v12a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="m9 15 2 2 5-5"/>',
  calculator:'<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M8 6h8v4H8zM8 14h2M14 14h2M8 18h2M14 18h2"/>',
  family:'<path d="M12 21s-9-5.8-9-12a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6.2-9 12-9 12z"/>',
  work:'<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18M10 12v2h4v-2"/>',
  book:'<path d="M12 6c-3-2-6-2-9-1v14c3-1 6-1 9 1m0-14c3-2 6-2 9-1v14c-3-1-6-1-9 1zM12 6v14"/>',
  scale:'<path d="M12 3v18M5 7h14M3 17l4-9 4 9H3zm10 0 4-9 4 9h-8zM8 21h8"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3-6 8-6s8 2 8 6"/>'
 };
 const routeIcons={
  '/fuqarolar':'home','/ai':'ai','/documents':'document','/legal-review':'review',
  '/calculators':'calculator','/family':'family','/employment':'work','/business':'work',
  '/sources':'book','/court':'scale','/advokat-pro':'work'
 };
 function replaceIcons(){
  document.querySelectorAll('a.sideLink[href],a.sourceCard[href]').forEach(function(a){
   const mark=a.querySelector('.sideIcon,.sourceIcon');
   if(!mark || mark.classList.contains('qomus-svg-icon'))return;
   let name='book';
   try{if(a.classList.contains('sideLink'))name=routeIcons[new URL(a.href,location.href).pathname]||'book'}catch(_){}
   const svg='<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">'+paths[name]+'</svg>';
   // Controlled, fixed SVG path data: never interpolate user content.
   mark.innerHTML=svg;mark.classList.add('qomus-svg-icon');mark.setAttribute('aria-hidden','true');
  });
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',replaceIcons,{once:true});
 else replaceIcons();
})();
</script>`;
module.exports={css,script};