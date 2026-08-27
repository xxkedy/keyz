(function(){
'use strict';
function setText(el,text){if(el&&el.textContent!==text)el.textContent=text}
function patchHome(){
  setText(document.querySelector('.version'),'v2.1 · 2026.08.27');
  var grid=document.getElementById('urgeGrid');
  var food=document.querySelector('[data-id="sweets"]');
  if(food){setText(food.querySelector('.emoji'),'🍽️');setText(food.querySelector('b'),'食事');setText(food.querySelector('small'),'HALAL・お菓子・外食')}
  var anger=document.querySelector('[data-id="pork"]');
  if(anger){setText(anger.querySelector('.emoji'),'😤');setText(anger.querySelector('b'),'怒り');setText(anger.querySelector('small'),'言う前に止まる')}
  if(grid){grid.setAttribute('data-count','8');grid.querySelectorAll('.urge').forEach(function(card){card.classList.remove('faith')})}
  var rw=document.querySelector('.recent-win');
  if(rw){var empty=rw.textContent.includes('まだログなし')||rw.textContent.includes('最初の1回');var d=empty?'none':'';if(rw.style.display!==d)rw.style.display=d}
}
function replaceLabels(el){
  if(!el||!el.innerHTML)return;
  var h=el.innerHTML;
  var n=h.replaceAll('🍫 お菓子','🍽️ 食事').replaceAll('🍔 ジャンク食','🍽️ 食事').replaceAll('🥙 ハラル食','😤 怒り');
  if(h!==n)el.innerHTML=n;
}
function apply(){patchHome();['recent','rs','logList','sheetTitle'].forEach(function(id){replaceLabels(document.getElementById(id))})}
var queued=false;
function queue(){if(queued)return;queued=true;requestAnimationFrame(function(){queued=false;apply()})}
apply();
new MutationObserver(queue).observe(document.body,{childList:true,subtree:true,characterData:true});
})();
