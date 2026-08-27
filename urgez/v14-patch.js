(function(){
'use strict';
function setText(el,text){if(el&&el.textContent!==text)el.textContent=text}
function setHTML(el,html){if(el&&el.innerHTML!==html)el.innerHTML=html}
function setItems(el,items,cls){if(!el)return;var html=items.map(function(t){return '<div class="'+cls+'">'+t+'</div>'}).join('');setHTML(el,html)}
function patchHome(){
  var v=document.querySelector('.version');setText(v,'v1.9 · 2026.08.27');
  var grid=document.getElementById('urgeGrid');
  var food=document.querySelector('[data-id="sweets"]');
  if(food){var em=food.querySelector('.emoji'),b=food.querySelector('b'),s=food.querySelector('small');setText(em,'🍽️');setText(b,'食事');setText(s,'HALAL・お菓子・外食')}
  var anger=document.querySelector('[data-id="pork"]');
  if(anger){var ae=anger.querySelector('.emoji'),ab=anger.querySelector('b'),as=anger.querySelector('small');setText(ae,'😤');setText(ab,'怒り');setText(as,'言う前に止まる')}
  if(grid){grid.setAttribute('data-count','8');grid.querySelectorAll('.urge').forEach(function(card){card.classList.remove('faith')})}
  var rw=document.querySelector('.recent-win');if(rw){var empty=rw.textContent.includes('まだログなし')||rw.textContent.includes('最初の1回');var d=empty?'none':'';if(rw.style.display!==d)rw.style.display=d}
}
function ruleRow(icon,text){return '<div class="v18-rule-row"><span class="v18-emoji">'+icon+'</span><span>'+text+'</span></div>'}
function whyRow(icon,text){return '<div class="reason"><span class="v18-emoji">'+icon+'</span><span>'+text+'</span></div>'}
function patchFoodDetail(){
  var t=document.getElementById('title');if(!t||(!t.textContent.includes('お菓子')&&!t.textContent.includes('ジャンク食')&&!t.textContent.includes('食事')))return;
  setText(t,'🍽️ 食事');
  var detail=document.getElementById('detailView');if(detail)detail.classList.add('v18-food');
  var impact=document.getElementById('impact'),desc=document.getElementById('desc'),rules=document.getElementById('rules'),note=document.getElementById('note'),whys=document.getElementById('whys'),loss=document.getElementById('loss'),ideal=document.getElementById('ideal'),stop=document.getElementById('stop'),allow=document.getElementById('allow'),faith=document.getElementById('faith'),did=document.getElementById('did');
  var impactKicker=document.querySelector('#detailView .impact-kicker');setText(impactKicker,'🚨 いま止める理由');
  var ruleHead=rules&&rules.closest('.block')?rules.closest('.block').querySelector('.block-head b'):null;setText(ruleHead,'🧭 MY RULE｜先に決めた条件');
  var whyHead=whys&&whys.closest('.block')?whys.closest('.block').querySelector('.block-head b'):null;setText(whyHead,'🎯 WHY｜なんでやめたい？');
  var lossHead=loss&&loss.closest('.block')?loss.closest('.block').querySelector('.block-head b'):null;setText(lossHead,'🚨 REAL LOSS｜またこうなる？');
  var idealHead=ideal&&ideal.closest('.block')?ideal.closest('.block').querySelector('.block-head b'):null;setText(idealHead,'🌱 IDEAL｜こうなりたい');
  setText(impact,'HALAL？ BODY？ どっちも見てから食べる。');
  setText(desc,'お菓子・ラーメン・マック・普通の外食まで入口はここ1つ。宗教上の成分と、腹・体重・肌・仕事への影響を同じ画面で見る。');
  setText(faith,'Qur’an 2:173 / 5:3 · 豚を避ける ／ Qur’an 7:200 · 誘惑に一度止まる');
  var rulesHTML=
    '<div class="v18-rule-groups">'+
      '<div class="v18-rule-group"><div class="v18-rule-title halal">🕌 HALAL</div>'+
        ruleRow('🐷','豚肉・ラード・豚由来ゼラチンを確認')+
        ruleRow('🍷','酒・洋酒を使った物も確認')+
        ruleRow('🔎','分からなければ成分を見るか別の物へ')+
      '</div>'+
      '<div class="v18-rule-group"><div class="v18-rule-title body">💪 BODY</div>'+
        ruleRow('🤔','空腹？ 口寂しいだけ？')+
        ruleRow('🍟','今日もうお菓子・ジャンクを食べた？')+
        ruleRow('📏','量を先に決めた？ 大盛り・追加はしない')+
        ruleRow('💼','明日の腹・仕事に響かない？')+
      '</div>'+
      '<div class="v18-ok">✅ HALALを確認できて、本当に食べたい1食ならOK</div>'+
    '</div>';
  setHTML(rules,rulesHTML);
  if(note){note.hidden=false;setText(note,'HALAL＝健康食ではない。宗教上OKでも、爆食い・ジャンクの重ね食いはBODY側で止める。')}
  var whyHTML=
    whyRow('🕌','ハラル寄りを自然に選びたい')+
    whyRow('💼','腹痛・下痢で仕事を邪魔されたくない')+
    whyRow('⚖️','体重を増やす食べ方を減らしたい')+
    whyRow('✨','肌を整えたい')+
    whyRow('😮‍💨','食後のだるさ・後悔を減らしたい')+
    whyRow('💸','惰性のお菓子・ジャンクに金を使いたくない');
  setHTML(whys,whyHTML);
  setHTML(loss,'<div class="v18-loss-flow"><div class="v18-loss-step">🍫 8/26　お菓子を爆食い</div><div class="v18-arrow">↓</div><div class="v18-loss-step">🚽 8/27　腹痛・下痢・ガス</div><div class="v18-arrow">↓</div><div class="v18-loss-step">💼 仕事中に何度もトイレ</div></div><div class="v18-loss-note">Diaryでも夜のお菓子・爆食い・体重増加を何度も反省。今うまそうだけで決めず、翌日の身体まで見る。</div>');
  setHTML(ideal,'<div class="v18-ideal-grid"><div class="v18-ideal-chip">🕌 ハラルを自然に選べる</div><div class="v18-ideal-chip">🍔 ジャンクは本当に食べたい1食だけ</div><div class="v18-ideal-chip">📏 量と回数を自分で決めて終われる</div></div>');
  setText(stop,'🛡 今は別の物を選ぶ');
  setText(allow,'✅ 2軸とも条件内｜食べてOK');
  setText(did,'条件外で食べた');
}
function patchAngerDetail(){
  var t=document.getElementById('title');if(!t||(!t.textContent.includes('ハラル食')&&!t.textContent.includes('怒り')))return;
  setText(t,'😤 怒り');
  var detail=document.getElementById('detailView');if(detail)detail.classList.remove('v18-food');
  var impact=document.getElementById('impact'),desc=document.getElementById('desc'),rules=document.getElementById('rules'),note=document.getElementById('note'),whys=document.getElementById('whys'),loss=document.getElementById('loss'),ideal=document.getElementById('ideal'),stop=document.getElementById('stop'),allow=document.getElementById('allow'),faith=document.getElementById('faith'),did=document.getElementById('did'),sheetTitle=document.getElementById('sheetTitle');
  var bh=rules&&rules.closest('.block')?rules.closest('.block').querySelector('.block-head b'):null;setText(bh,'MY RULE｜怒った時の順番');
  setText(impact,'今この一言、本当に言う必要ある？');
  setText(desc,'怒ること自体は失敗やない。怒りのまま言葉・LINE・決断に変える前に、一回止まる。');
  setText(faith,'Qur’an 3:134 · 怒りを抑え、人を赦す');
  setItems(rules,['Aʿūdhuを1回言う','まず黙る。怒ったまま返事しない','その場で全部決着させようとしない','相手が何を感じてるか1回確認する','落ち着いてから、伝えたい要点を1つだけ言う'],'rule-item');
  if(note){note.hidden=false;setText(note,'怒りを感じた＝失敗ではない。怒りのまま反応したかを見る。')}
  setItems(whys,['言い方で大事な人を傷つけたくない','同じ喧嘩を繰り返したくない','怒りに自分の判断を持っていかれたくない','後から謝る言葉を減らしたい','腹が立っても相手を見て言葉を選べるようになりたい'],'reason');
  setText(loss,'Diaryで「自分の言い方や怒り方を見直した。怒りが出る前に相手を見る」と反省。怒りそのものより、その直後の言葉で関係を悪くするのが損。');
  setText(ideal,'腹が立っても一回止まり、相手を見て、必要なことだけ落ち着いて伝えられる。');
  setText(stop,'🛡 一回黙る');
  if(allow){allow.classList.remove('show');allow.style.display='none'}
  setText(did,'怒りのまま言った / 送った');
  if(sheetTitle&&sheetTitle.textContent.includes('ハラル食'))setText(sheetTitle,'😤 怒り');
}
function replaceFoodLabels(el){if(!el)return;var h=el.innerHTML;if(!h)return;var n=h.replaceAll('🍫 お菓子','🍽️ 食事').replaceAll('🍔 ジャンク食','🍽️ 食事');if(h!==n)el.innerHTML=n}
function replaceAngerLabels(el){if(!el)return;var h=el.innerHTML;if(!h)return;var n=h.replaceAll('🥙 ハラル食','😤 怒り');if(h!==n)el.innerHTML=n}
function syncDetailClass(){var detail=document.getElementById('detailView'),t=document.getElementById('title');if(detail)detail.classList.toggle('v18-food',!!(t&&t.textContent.includes('食事')))}
function apply(){patchHome();syncDetailClass();patchFoodDetail();patchAngerDetail();['recent','rs','logList','sheetTitle'].forEach(function(id){var el=document.getElementById(id);replaceFoodLabels(el);replaceAngerLabels(el)})}
var queued=false;function queue(){if(queued)return;queued=true;requestAnimationFrame(function(){queued=false;apply()})}
apply();
new MutationObserver(queue).observe(document.body,{childList:true,subtree:true,characterData:true});
document.addEventListener('click',function(e){if(e.target.closest('[data-id="sweets"]')||e.target.closest('[data-id="pork"]')){setTimeout(apply,0);setTimeout(apply,80);setTimeout(apply,240)}},true);
})();