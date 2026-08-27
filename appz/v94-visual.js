(function(){
'use strict';
var style=document.createElement('style');
style.id='appz-v94-style';
style.textContent=`
header{height:40px!important}
.ready{font-size:0!important;color:var(--dim)!important;letter-spacing:.5px!important;gap:0!important}
.ready:before{display:none!important}
.ready:after{content:'v9.4 · 2026.08.27';font-size:8.5px;font-weight:800;color:var(--dim);letter-spacing:.5px}
.section-head{margin-top:13px!important;margin-bottom:6px!important}
.section-head b{font-size:8.5px!important;letter-spacing:1.6px!important;color:#777b85!important}
.section-head span{font-size:8px!important;color:#555963!important}
.tool-grid{column-gap:8px!important;row-gap:9px!important}
.tool{min-height:84px!important;gap:7px!important}
.tool-icon{width:58px!important;height:58px!important;border-radius:18px!important;font-size:29px!important;border-color:rgba(255,255,255,.12)!important;box-shadow:0 10px 24px rgba(0,0,0,.28),inset 0 1px rgba(255,255,255,.08)!important}
.tool-name{font-size:12.5px!important;line-height:1.05!important;font-weight:900!important;letter-spacing:-.15px!important}
.tool[data-kind='learn'] .tool-icon{background:linear-gradient(145deg,rgba(43,217,239,.25),#101218 70%)!important;border-color:rgba(43,217,239,.22)!important}
.tool[data-kind='create'] .tool-icon{background:linear-gradient(145deg,rgba(255,112,67,.27),#101218 70%)!important;border-color:rgba(255,112,67,.22)!important}
.tool[data-kind='life'] .tool-icon{background:linear-gradient(145deg,rgba(83,227,139,.24),#101218 70%)!important;border-color:rgba(83,227,139,.2)!important}
.tool[data-kind='faith'] .tool-icon{background:linear-gradient(145deg,rgba(255,157,36,.28),rgba(83,227,139,.12) 42%,#101218 72%)!important;border-color:rgba(255,157,36,.22)!important}
.tool[data-kind='tool'] .tool-icon{background:linear-gradient(145deg,rgba(160,165,180,.2),#101218 70%)!important;border-color:rgba(180,185,200,.14)!important}
.quick{min-height:104px!important}
.standby-row{margin-top:9px!important}
footer{font-size:0!important;margin-top:7px!important}
footer:after{content:'ONE SCREEN DECK';font-size:7.5px;color:#3f424b;letter-spacing:.8px}
@media(max-width:350px){.tool-icon{width:52px!important;height:52px!important;font-size:26px!important}.tool-name{font-size:11.5px!important}.tool{min-height:76px!important}}
@media(max-height:650px){.tool-icon{width:51px!important;height:51px!important;font-size:25px!important}.tool-name{font-size:11.5px!important}.tool{min-height:72px!important}}
`;
document.head.appendChild(style);
var map={Flowz:'learn',Digz:'learn',Barz:'create',Tagz:'create',Gainz:'life',Urgez:'life',Islamz:'faith',Keyz:'tool'};
document.querySelectorAll('.tool').forEach(function(el){var name=el.querySelector('.tool-name');if(name&&map[name.textContent.trim()])el.dataset.kind=map[name.textContent.trim()]});
var ready=document.querySelector('.ready');if(ready)ready.setAttribute('aria-label','Appz v9.4 · 2026.08.27');
})();
