(function(){
'use strict';
var FOOD_WHY=[
  ['🕌','ハラル寄りを自然に選びたい'],
  ['💼','腹痛・下痢で仕事を邪魔されたくない'],
  ['⚖️','体重を増やす食べ方を減らしたい'],
  ['✨','肌を整えたい'],
  ['😮‍💨','食後のだるさ・後悔を減らしたい'],
  ['💸','惰性のお菓子・ジャンクに金を使いたくない']
];
var HALAL_RULES=[
  ['🐷','豚肉・ラード・豚由来ゼラチンを確認'],
  ['🍷','酒・洋酒を使った物も確認'],
  ['🔎','分からなければ成分を見るか別の物へ']
];
var BODY_RULES=[
  ['🤔','空腹？ 口寂しいだけ？'],
  ['🍟','今日もうお菓子・ジャンクを食べた？'],
  ['📏','量を先に決めた？ 大盛り・追加はしない'],
  ['💼','明日の腹・仕事に響かない？']
];
function q(){for(var i=0;i<arguments.length;i++){var e=document.querySelector(arguments[i]);if(e)return e}return null}
function injectStyle(){if(document.getElementById('v18VisualStyle'))return;var s=document.createElement('style');s.id='v18VisualStyle';s.textContent='\
.v18-food .impact-kicker{font-size:9px!important;letter-spacing:1.2px!important}\
.v18-food .block-head b{font-size:10px!important;letter-spacing:.7px!important}\
.v18-food .faith-strip{position:relative;padding-top:31px!important}\
.v18-food .faith-strip:before{content:"🕌  ISLAM";position:absolute;left:13px;top:10px;color:var(--green);font-size:9px;font-weight:950;letter-spacing:1px}\
.v18-food .reasons{gap:7px!important}\
.v18-food .reason{display:flex!important;align-items:flex-start!important;gap:9px!important;padding:9px 10px!important;border:1px solid rgba(255,255,255,.08)!important;border-radius:13px!important;background:rgba(255,255,255,.035)!important;font-size:10.5px!important;line-height:1.35!important}\
.v18-food .reason:before{display:none!important}\
.v18-food .v18-emoji{flex:0 0 21px;font-size:15px;line-height:1.1;text-align:center}\
.v18-food .v18-rule-groups{display:grid;gap:8px}\
.v18-food .v18-rule-group{padding:10px;border-radius:15px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.028)}\
.v18-food .v18-rule-title{font-size:10px;font-weight:950;letter-spacing:.5px;margin-bottom:7px}\
.v18-food .v18-rule-title.halal{color:var(--green)}\
.v18-food .v18-rule-title.body{color:var(--cyan)}\
.v18-food .v18-rule-row{display:flex;gap:8px;align-items:flex-start;padding:6px 0;border-top:1px solid rgba(255,255,255,.045);font-size:10.5px;line-height:1.35;color:#e9e9e5}\
.v18-food .v18-rule-row:first-of-type{border-top:0}\
.v18-food .v18-ok{margin-top:8px;padding:9px 10px;border-radius:13px;border:1px solid rgba(87,223,140,.18);background:rgba(87,223,140,.065);font-size:10.5px;line-height:1.35;color:#dff9e9}\
.v18-food .v18-loss-flow{display:grid;gap:5px;margin-top:2px;text-align:center}\
.v18-food .v18-loss-step{padding:9px 10px;border-radius:13px;background:rgba(255,93,104,.065);border:1px solid rgba(255,93,104,.13);font-size:11px;font-weight:800;line-height:1.3}\
.v18-food .v18-arrow{color:var(--red);font-size:14px;line-height:1}\
.v18-food .v18-loss-note{margin-top:8px;color:#c9aeb1;font-size:9.5px;line-height:1.45}\
.v18-food .v18-ideal-grid{display:grid;gap:7px}\
.v18-food .v18-ideal-chip{padding:9px 10px;border-radius:13px;background:rgba(87,223,140,.055);border:1px solid rgba(87,223,140,.12);font-size:10.5px;line-height:1.35}\
';document.head.appendChild(s)}
function titleEl(){return q('#detailTitle','#title')}
function foodActive(){var t=titleEl();return !!(t&&t.textContent&&t.textContent.indexOf('食事')>=0)}
function setHead(block,txt){if(!block)return;var b=block.querySelector('.block-head b');if(b)b.textContent=txt}
function decorateWhy(root){var box=q('#reasons','#whys');if(!box||box.dataset.v18==='1')return;box.dataset.v18='1';box.innerHTML='';FOOD_WHY.forEach(function(x){var d=document.createElement('div');d.className='reason';d.innerHTML='<span class="v18-emoji">'+x[0]+'</span><span>'+x[1]+'</span>';box.appendChild(d)});setHead(box.closest('.block'),'🎯 WHY｜なんでやめたい？')}
function decorateRules(root){var box=q('#rules');if(!box||box.dataset.v18==='1')return;box.dataset.v18='1';box.innerHTML='';var wrap=document.createElement('div');wrap.className='v18-rule-groups';function group(title,cls,items){var g=document.createElement('div');g.className='v18-rule-group';var h=document.createElement('div');h.className='v18-rule-title '+cls;h.textContent=title;g.appendChild(h);items.forEach(function(x){var r=document.createElement('div');r.className='v18-rule-row';r.innerHTML='<span class="v18-emoji">'+x[0]+'</span><span>'+x[1]+'</span>';g.appendChild(r)});wrap.appendChild(g)}group('🕌 HALAL','halal',HALAL_RULES);group('💪 BODY','body',BODY_RULES);var ok=document.createElement('div');ok.className='v18-ok';ok.textContent='✅ HALALを確認できて、本当に食べたい1食ならOK';wrap.appendChild(ok);box.appendChild(wrap);setHead(box.closest('.block'),'🧭 MY RULE｜先に決めた条件')}
function decorateLoss(){var box=q('#lossText','#loss');if(!box||box.dataset.v18==='1')return;box.dataset.v18='1';box.innerHTML='<div class="v18-loss-flow"><div class="v18-loss-step">🍫 8/26　お菓子を爆食い</div><div class="v18-arrow">↓</div><div class="v18-loss-step">🚽 8/27　腹痛・下痢・ガス</div><div class="v18-arrow">↓</div><div class="v18-loss-step">💼 仕事中に何度もトイレ</div></div><div class="v18-loss-note">Diaryでも夜のお菓子・爆食い・体重増加を何度も反省。今うまそうだけで決めず、翌日の身体まで見る。</div>';setHead(box.closest('.block'),'🚨 REAL LOSS｜またこうなる？')}
function decorateIdeal(){var box=q('#idealText','#ideal');if(!box||box.dataset.v18==='1')return;box.dataset.v18='1';box.innerHTML='<div class="v18-ideal-grid"><div class="v18-ideal-chip">🕌 ハラルを自然に選べる</div><div class="v18-ideal-chip">🍔 ジャンクは本当に食べたい1食だけ</div><div class="v18-ideal-chip">📏 量と回数を自分で決めて終われる</div></div>';setHead(box.closest('.block'),'🌱 IDEAL｜こうなりたい')}
function decorateImpact(){var k=q('.impact-kicker');if(k)k.textContent='🚨 いま止める理由';var t=q('#impactTitle','#impact');if(t&&t.id==='impactTitle')t.textContent='HALAL？ BODY？ どっちも見てから食べる。'}
function decorateFood(){if(!foodActive())return;var root=q('#detailView','.detail-view')||document.body;root.classList.add('v18-food');decorateImpact();decorateWhy(root);decorateRules(root);decorateLoss();decorateIdeal()}
function version(){var v=q('.version');if(v)v.textContent='v1.8 · 2026.08.27'}
function apply(){injectStyle();version();decorateFood()}
var queued=false;function queue(){if(queued)return;queued=true;requestAnimationFrame(function(){queued=false;apply()})}
apply();new MutationObserver(queue).observe(document.body,{childList:true,subtree:true,characterData:true});document.addEventListener('click',function(e){if(e.target.closest('[data-id="sweets"]'))setTimeout(apply,20)},true);
})();
