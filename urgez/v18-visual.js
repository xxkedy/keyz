(function(){
'use strict';
function injectStyle(){
  var old=document.getElementById('v18VisualStyle');if(old)old.remove();
  var s=document.createElement('style');s.id='v18VisualStyle';s.textContent=`
.v18-food .impact-kicker{font-size:9px!important;letter-spacing:1.2px!important}
.v18-food .block-head b{font-size:10px!important;letter-spacing:.7px!important}
.v18-food .faith-strip{position:relative;padding-top:31px!important}
.v18-food .faith-strip:before{content:"🕌  ISLAM";position:absolute;left:13px;top:10px;color:var(--green);font-size:9px;font-weight:950;letter-spacing:1px}
.v18-food .reasons{gap:7px!important}
.v18-food .reason{display:flex!important;align-items:flex-start!important;gap:9px!important;padding:9px 10px!important;border:1px solid rgba(255,255,255,.08)!important;border-radius:13px!important;background:rgba(255,255,255,.035)!important;font-size:10.5px!important;line-height:1.35!important}
.v18-food .reason:before{display:none!important}
.v18-food .v18-emoji{flex:0 0 21px;font-size:15px;line-height:1.1;text-align:center}
.v18-food .v18-rule-groups{display:grid;gap:8px}
.v18-food .v18-rule-group{padding:10px;border-radius:15px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.028)}
.v18-food .v18-rule-title{font-size:10px;font-weight:950;letter-spacing:.5px;margin-bottom:7px}
.v18-food .v18-rule-title.halal{color:var(--green)}
.v18-food .v18-rule-title.body{color:var(--cyan)}
.v18-food .v18-rule-row{display:flex;gap:8px;align-items:flex-start;padding:6px 0;border-top:1px solid rgba(255,255,255,.045);font-size:10.5px;line-height:1.35;color:#e9e9e5}
.v18-food .v18-rule-row:first-of-type{border-top:0}
.v18-food .v18-ok{margin-top:8px;padding:9px 10px;border-radius:13px;border:1px solid rgba(87,223,140,.18);background:rgba(87,223,140,.065);font-size:10.5px;line-height:1.35;color:#dff9e9}
.v18-food .v18-loss-flow{display:grid;gap:5px;margin-top:2px;text-align:center}
.v18-food .v18-loss-step{padding:9px 10px;border-radius:13px;background:rgba(255,93,104,.065);border:1px solid rgba(255,93,104,.13);font-size:11px;font-weight:800;line-height:1.3}
.v18-food .v18-arrow{color:var(--red);font-size:14px;line-height:1}
.v18-food .v18-loss-note{margin-top:8px;color:#c9aeb1;font-size:9.5px;line-height:1.45}
.v18-food .v18-ideal-grid{display:grid;gap:7px}
.v18-food .v18-ideal-chip{padding:9px 10px;border-radius:13px;background:rgba(87,223,140,.055);border:1px solid rgba(87,223,140,.12);font-size:10.5px;line-height:1.35}
`;
  document.head.appendChild(s);
}
injectStyle();
})();