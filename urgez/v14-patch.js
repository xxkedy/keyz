(function(){
'use strict';
function setItems(el,items,cls){if(!el)return;el.innerHTML='';items.forEach(function(t){var d=document.createElement('div');d.className=cls;d.textContent=t;el.appendChild(d)})}
function patchHome(){
  var v=document.querySelector('.version');if(v)v.textContent='v1.5 · 2026.08.27';
  var grid=document.getElementById('urgeGrid');
  var food=document.querySelector('[data-id="sweets"]');
  if(food){var em=food.querySelector('.emoji'),b=food.querySelector('b'),s=food.querySelector('small');if(em)em.textContent='🍽️';if(b)b.textContent='食事';if(s)s.textContent='HALAL・お菓子・ジャンク'}
  var anger=document.querySelector('[data-id="pork"]');
  if(anger){var ae=anger.querySelector('.emoji'),ab=anger.querySelector('b'),as=anger.querySelector('small');if(ae)ae.textContent='😤';if(ab)ab.textContent='怒り';if(as)as.textContent='言う前に止まる'}
  if(grid)grid.setAttribute('data-count','8');
}
function patchFoodDetail(){
  var t=document.getElementById('title');if(!t||(!t.textContent.includes('お菓子')&&!t.textContent.includes('ジャンク食')&&!t.textContent.includes('食事')))return;
  t.textContent='🍽️ 食事';
  var impact=document.getElementById('impact'),desc=document.getElementById('desc'),rules=document.getElementById('rules'),note=document.getElementById('note'),whys=document.getElementById('whys'),loss=document.getElementById('loss'),ideal=document.getElementById('ideal'),stop=document.getElementById('stop'),allow=document.getElementById('allow'),faith=document.getElementById('faith'),did=document.getElementById('did');
  var bh=rules&&rules.closest('.block')?rules.closest('.block').querySelector('.block-head b'):null;if(bh)bh.textContent='MY RULE｜HALAL + BODY';
  if(impact)impact.textContent='HALAL？ BODY？ どっちも見てから食べる。';
  if(desc)desc.textContent='お菓子・ラーメン・マック・普通の外食まで入口はここ1つ。宗教上の成分と、腹・体重・肌・仕事への影響を同じ画面で見る。';
  if(faith)faith.textContent='Qur’an 2:173 / 5:3 · 豚を避ける ／ Qur’an 7:200 · 誘惑に一度止まる';
  setItems(rules,[
    '🕌 豚肉・ラード・豚由来ゼラチンなど、分かる範囲で確認する',
    '🕌 酒・洋酒を使った物も確認する',
    '🕌 分からない時は成分を見るか、別の選択肢にする',
    '💪 空腹じゃなく口寂しいだけならやめる',
    '💪 今日すでにお菓子・ジャンクを食べてるなら重ねない',
    '💪 量を先に決める。大盛り・追加お菓子で連鎖させない',
    '💪 翌日の腹や仕事に響きそうなら選ばない',
    '✅ ハラル面を確認できて、友達との外食や本当に食べたい1食ならOK'
  ],'rule-item');
  if(note){note.hidden=false;note.textContent='HALAL＝健康食ではない。宗教上OKでも、爆食い・ジャンクの重ね食いはBODY側で止める。'}
  setItems(whys,[
    '豚・豚由来を惰性で選ばず、ハラル寄りを自然に選びたい',
    '腹痛・下痢・ガスで仕事を邪魔されたくない',
    '体重を増やす食べ方を減らしたい',
    '肌を整えたい',
    '食後のだるさ・後悔を減らしたい',
    '食費を惰性のお菓子・ジャンクに持っていかれたくない'
  ],'reason');
  if(loss)loss.textContent='8/26にお菓子を爆食い→8/27朝は腹痛・下痢・ガスで何度もトイレ。食べ物は「今うまそう」だけで決めず、HALALと翌日の身体まで含めて選ぶ。';
  if(ideal)ideal.textContent='食べ物で迷ったらここ1つ。ハラルを自然に選び、ジャンクは本当に食べたい時だけ量と回数を自分で決める。';
  if(stop)stop.textContent='🛡 今は別の物を選ぶ';
  if(allow)allow.textContent='✅ 2軸とも条件内｜食べてOK';
  if(did)did.textContent='条件外で食べた';
}
function patchAngerDetail(){
  var t=document.getElementById('title');if(!t||(!t.textContent.includes('ハラル食')&&!t.textContent.includes('怒り')))return;
  t.textContent='😤 怒り';
  var impact=document.getElementById('impact'),desc=document.getElementById('desc'),rules=document.getElementById('rules'),note=document.getElementById('note'),whys=document.getElementById('whys'),loss=document.getElementById('loss'),ideal=document.getElementById('ideal'),stop=document.getElementById('stop'),allow=document.getElementById('allow'),faith=document.getElementById('faith'),did=document.getElementById('did'),sheetTitle=document.getElementById('sheetTitle');
  var bh=rules&&rules.closest('.block')?rules.closest('.block').querySelector('.block-head b'):null;if(bh)bh.textContent='MY RULE｜怒った時の順番';
  if(impact)impact.textContent='今この一言、本当に言う必要ある？';
  if(desc)desc.textContent='怒ること自体は失敗やない。怒りのまま言葉・LINE・決断に変える前に、一回止まる。';
  if(faith)faith.textContent='Qur’an 3:134 · 怒りを抑え、人を赦す';
  setItems(rules,[
    'Aʿūdhuを1回言う',
    'まず黙る。怒ったまま返事しない',
    'その場で全部決着させようとしない',
    '相手が何を感じてるか1回確認する',
    '落ち着いてから、伝えたい要点を1つだけ言う'
  ],'rule-item');
  if(note){note.hidden=false;note.textContent='怒りを感じた＝失敗ではない。怒りのまま反応したかを見る。'}
  setItems(whys,[
    '言い方で大事な人を傷つけたくない',
    '同じ喧嘩を繰り返したくない',
    '怒りに自分の判断を持っていかれたくない',
    '後から謝る言葉を減らしたい',
    '腹が立っても相手を見て言葉を選べるようになりたい'
  ],'reason');
  if(loss)loss.textContent='Diaryで「自分の言い方や怒り方を見直した。怒りが出る前に相手を見る」と反省。怒りそのものより、その直後の言葉で関係を悪くするのが損。';
  if(ideal)ideal.textContent='腹が立っても一回止まり、相手を見て、必要なことだけ落ち着いて伝えられる。';
  if(stop)stop.textContent='🛡 一回黙る';
  if(allow){allow.classList.remove('show');allow.style.display='none'}
  if(did)did.textContent='怒りのまま言った / 送った';
  if(sheetTitle&&sheetTitle.textContent.includes('ハラル食'))sheetTitle.textContent='😤 怒り';
}
function replaceFoodLabels(el){if(!el)return;var h=el.innerHTML;if(!h)return;h=h.replaceAll('🍫 お菓子','🍽️ 食事').replaceAll('🍔 ジャンク食','🍽️ 食事');if(el.innerHTML!==h)el.innerHTML=h}
function replaceAngerLabels(el){if(!el)return;var h=el.innerHTML;if(!h)return;h=h.replaceAll('🥙 ハラル食','😤 怒り');if(el.innerHTML!==h)el.innerHTML=h}
function apply(){patchHome();patchFoodDetail();patchAngerDetail();['recent','rs','logList','sheetTitle'].forEach(function(id){var el=document.getElementById(id);replaceFoodLabels(el);replaceAngerLabels(el)})}
var queued=false;function queue(){if(queued)return;queued=true;requestAnimationFrame(function(){queued=false;apply()})}
apply();
new MutationObserver(queue).observe(document.body,{childList:true,subtree:true,characterData:true});
document.addEventListener('click',function(e){if(e.target.closest('[data-id="sweets"]')||e.target.closest('[data-id="pork"]'))setTimeout(apply,0)},true);
})();
