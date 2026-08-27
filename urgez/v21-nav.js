(function(){
'use strict';
function inject(){
  if(document.getElementById('urgezBackReach'))return;
  var style=document.createElement('style');
  style.id='urgezBackReachStyle';
  style.textContent='\
#urgezBackReach{position:fixed;right:18px;bottom:92px;z-index:80;display:none;align-items:center;justify-content:center;gap:7px;min-width:108px;min-height:50px;padding:0 17px;border:1px solid rgba(255,255,255,.16);border-radius:999px;background:rgba(18,20,24,.92);color:#f5f5f2;font:900 14px/1 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.38);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);-webkit-tap-highlight-color:transparent}\
#urgezBackReach.show{display:flex}\
#urgezBackReach:active{transform:scale(.96)}\
body.urgez-standalone #urgezBackReach{bottom:calc(env(safe-area-inset-bottom,0px) + 18px)}\
#detailView{padding-bottom:150px!important}\
';
  document.head.appendChild(style);
  var b=document.createElement('button');
  b.id='urgezBackReach';
  b.type='button';
  b.setAttribute('aria-label','ホームへ戻る');
  b.innerHTML='<span aria-hidden="true">←</span><span>戻る</span>';
  b.addEventListener('click',function(){var top=document.getElementById('back');if(top)top.click()});
  document.body.appendChild(b);
  var standalone=window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;
  document.body.classList.toggle('urgez-standalone',!!standalone);
}
function sync(){
  inject();
  var detail=document.getElementById('detailView');
  var b=document.getElementById('urgezBackReach');
  if(!b)return;
  b.classList.toggle('show',!!(detail&&detail.classList.contains('active')));
}
var queued=false;
function queue(){if(queued)return;queued=true;requestAnimationFrame(function(){queued=false;sync()})}
sync();
new MutationObserver(queue).observe(document.body,{attributes:true,attributeFilter:['class'],childList:true,subtree:true});
window.addEventListener('pageshow',sync);
})();
