(function(){
'use strict';
function setItems(el,items,cls){if(!el)return;el.innerHTML='';items.forEach(function(t){var d=document.createElement('div');d.className=cls;d.textContent=t;el.appendChild(d)})}
function patchHome(){
  var v=document.querySelector('.version');if(v)v.textContent='v1.3 · 2026.08.27';
  var card=document.querySelector('[data-id="sweets"]');if(card){var em=card.querySelector('.emoji'),b=card.querySelector('b'),s=card.querySelector('small');if(em)em.textContent='🍔';if(b)b.textContent='ジャンク食';if(s)s.textContent='お菓子・ラーメン・マック'}
}
function patchDetail(){
  var t=document.getElementById('title');if(!t||(!t.textContent.includes('お菓子')&&!t.textContent.includes('ジャンク食')))return;
  t.textContent='🍔 ジャンク食';
  var impact=document.getElementById('impact'),desc=document.getElementById('desc'),rules=document.getElementById('rules'),note=document.getElementById('note'),whys=document.getElementById('whys'),loss=document.getElementById('loss'),ideal=document.getElementById('ideal'),stop=document.getElementById('stop'),allow=document.getElementById('allow');
  if(impact)impact.textContent='「食べたい」だけで、明日の身体まで払う？';
  if(desc)desc.textContent='ラーメン・マック・お菓子を禁止はせん。口寂しさや勢いで選んで、腹・体重・肌・仕事まで崩す食べ方だけ止める。';
  setItems(rules,['空腹じゃなく口寂しいだけならやめる','今日すでにジャンク食やお菓子を食べてるなら重ねない','量を先に決める。大盛り・追加お菓子で連鎖させない','翌日の腹や仕事に響きそうなら選ばない','友達との外食や、本当に食べたい1食として選ぶならOK'],'rule-item');
  if(note){note.hidden=false;note.textContent='ラーメン・マック・お菓子＝絶対NGではない。惰性・連続・爆食いを止める。'}
  setItems(whys,['腹痛・下痢・ガスで仕事を邪魔されたくない','体重を増やす食べ方を減らしたい','肌を整えたい','脂・糖・塩分に偏る食事を続けたくない','食後のだるさ・後悔を減らしたい','食費を惰性のジャンクに持っていかれたくない'],'reason');
  if(loss)loss.textContent='8/26にお菓子を爆食い→8/27朝は腹痛・下痢・ガスで何度もトイレ。ラーメンやマックも「食べたい瞬間」だけで決めず、翌日の体調まで含めて選ぶ。';
  if(ideal)ideal.textContent='普段は身体が楽な物を選ぶ。ジャンクは本当に食べたい時に、量と回数を自分で決めて楽しむ。';
  if(stop)stop.textContent='🛡 今は別の物を選ぶ';
  if(allow){allow.textContent='✅ 条件内なら食べてOK'}
}
function replaceOld(el){if(!el)return;var h=el.innerHTML;if(h&&h.includes('🍫 お菓子'))el.innerHTML=h.replaceAll('🍫 お菓子','🍔 ジャンク食')}
function apply(){patchHome();patchDetail();replaceOld(document.getElementById('recent'));replaceOld(document.getElementById('rs'));replaceOld(document.getElementById('logList'))}
var queued=false;function queue(){if(queued)return;queued=true;requestAnimationFrame(function(){queued=false;apply()})}
apply();
new MutationObserver(queue).observe(document.body,{childList:true,subtree:true,characterData:true});
document.addEventListener('click',function(e){if(e.target.closest('[data-id="sweets"]'))setTimeout(apply,0)},true);
})();
