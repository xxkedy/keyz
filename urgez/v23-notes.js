(function(){
'use strict';
var active=null;
var savedScrollY=0;
var labels={sweets:'🍽 食事',tobacco:'🚬 タバコ',sns:'📱 SNS',shopping:'🛒 買いすぎ',porn:'🔞 ポルノ',alcohol:'🍺 酒',sleep:'🌙 夜更かし',pork:'😤 怒り'};
var keyPrefix='urgez-free-note-v1:';
function infer(){
  if(active&&labels[active])return active;
  var t=document.getElementById('title')||document.getElementById('detailTitle');
  var x=t?t.textContent:'';
  if(x.includes('食事')||x.includes('お菓子'))return'sweets';
  if(x.includes('タバコ'))return'tobacco';
  if(x.includes('SNS'))return'sns';
  if(x.includes('買いすぎ'))return'shopping';
  if(x.includes('ポルノ'))return'porn';
  if(x.includes('酒'))return'alcohol';
  if(x.includes('夜更かし'))return'sleep';
  if(x.includes('怒り'))return'pork';
  return null;
}
function getNote(id){try{return localStorage.getItem(keyPrefix+id)||''}catch(e){return''}}
function setNote(id,v){try{localStorage.setItem(keyPrefix+id,v)}catch(e){}}
function injectStyle(){
  if(document.getElementById('urgez-v23-style'))return;
  var s=document.createElement('style');s.id='urgez-v23-style';s.textContent=`
.version{font-size:0!important}.version:after{content:'v2.3 · 2026.08.27';font-size:8.5px;color:var(--dim);letter-spacing:.5px}
#urgezBackReach{bottom:68px!important}
body.urgez-standalone #urgezBackReach{bottom:calc(env(safe-area-inset-bottom,0px) + 18px)!important}
#detailView{padding-bottom:132px!important}
#urgezNoteFloat{position:fixed;right:18px;bottom:126px;z-index:79;display:none;align-items:center;justify-content:center;gap:6px;min-width:88px;min-height:44px;padding:0 14px;border:1px solid rgba(50,217,233,.24);border-radius:999px;background:rgba(15,22,27,.94);color:#dffaff;font:900 12px/1 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;box-shadow:0 10px 28px rgba(0,0,0,.34);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);-webkit-tap-highlight-color:transparent}
#urgezNoteFloat.show{display:flex}#urgezNoteFloat:active{transform:scale(.96)}#urgezNoteFloat.has-note:after{content:'';width:6px;height:6px;border-radius:50%;background:var(--cyan);box-shadow:0 0 0 3px rgba(50,217,233,.10)}
body.urgez-standalone #urgezNoteFloat{bottom:calc(env(safe-area-inset-bottom,0px) + 76px)}
#urgezNoteSheet{position:fixed;inset:0;z-index:120;display:none;align-items:flex-end;background:rgba(0,0,0,.56);padding:0}#urgezNoteSheet.show{display:flex}
.urgez-note-sheet-card{width:min(560px,100%);margin:0 auto;background:#111319;border:1px solid rgba(255,255,255,.13);border-radius:25px 25px 0 0;padding:14px 14px calc(18px + env(safe-area-inset-bottom));box-shadow:0 -20px 55px rgba(0,0,0,.52)}
.urgez-note-sheet-head{display:flex;align-items:center;justify-content:space-between;gap:10px}.urgez-note-sheet-head div{min-width:0}.urgez-note-sheet-head b{display:block;color:var(--cyan);font-size:13px;line-height:1.2}.urgez-note-sheet-head span{display:block;margin-top:3px;color:var(--dim);font-size:8px}.urgez-note-close{flex:0 0 36px;width:36px;height:36px;border:0;border-radius:12px;background:rgba(255,255,255,.07);color:#fff;font-size:21px}
#urgezFreeNote{width:100%;min-height:118px;max-height:35dvh;resize:vertical;margin-top:11px;border:1px solid rgba(255,255,255,.10);border-radius:15px;background:#090a0e;color:var(--text);padding:12px;font-size:12px;line-height:1.55;outline:none}#urgezFreeNote:focus{border-color:rgba(50,217,233,.42);box-shadow:0 0 0 3px rgba(50,217,233,.07)}
.urgez-note-foot{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:7px}.urgez-note-state{font-size:8px;color:var(--dim)}
#urgezChatGPT{width:100%;min-height:50px;margin-top:10px;border:1px solid rgba(255,173,50,.28);border-radius:16px;background:linear-gradient(135deg,rgba(255,173,50,.18),rgba(50,217,233,.09));color:#fff4df;font-size:12px;font-weight:950}#urgezChatGPT:active{transform:scale(.985)}#urgezChatGPT[disabled]{opacity:.38}
.urgez-note-tip{margin-top:7px;color:#7d818a;font-size:8px;line-height:1.45}
body.urgez-note-open{overflow:hidden}
`;document.head.appendChild(s);
}
function injectUI(){
  var old=document.getElementById('urgezNotePanel');if(old)old.remove();
  if(!document.getElementById('urgezNoteFloat')){
    var f=document.createElement('button');f.id='urgezNoteFloat';f.type='button';f.setAttribute('aria-label','自分メモを開く');f.innerHTML='<span aria-hidden="true">✍️</span><span>メモ</span>';f.addEventListener('click',openSheet);document.body.appendChild(f);
  }
  if(!document.getElementById('urgezNoteSheet')){
    var sh=document.createElement('div');sh.id='urgezNoteSheet';sh.setAttribute('aria-hidden','true');sh.innerHTML='<div class="urgez-note-sheet-card" role="dialog" aria-modal="true" aria-label="自分メモ"><div class="urgez-note-sheet-head"><div><b id="urgezNoteTitle">✍️ 自分メモ</b><span>変えたいこと・気づき。カテゴリ別にこのiPhoneへ自動保存。</span></div><button class="urgez-note-close" id="urgezNoteClose" type="button" aria-label="閉じる">×</button></div><textarea id="urgezFreeNote" placeholder="例：友達といる日だけOKにしたい／この理由も追加したい"></textarea><div class="urgez-note-foot"><span class="urgez-note-state" id="urgezNoteState">入力中から自動保存</span></div><button id="urgezChatGPT" type="button">🤖 ChatGPTで修正</button><div class="urgez-note-tip">対象カテゴリとこのメモからGitHub修正指示をコピーしてChatGPTを開く。</div></div>';
    sh.addEventListener('click',function(e){if(e.target===sh)closeSheet()});document.body.appendChild(sh);
    document.getElementById('urgezNoteClose').addEventListener('click',closeSheet);
    var ta=document.getElementById('urgezFreeNote');
    ta.addEventListener('input',function(){var id=infer();if(id)setNote(id,ta.value);syncButton();syncFloat()});
    ta.addEventListener('blur',function(){var id=infer();if(id)setNote(id,ta.value)});
    document.getElementById('urgezChatGPT').addEventListener('click',handoff);
  }
}
function syncButton(){var ta=document.getElementById('urgezFreeNote'),btn=document.getElementById('urgezChatGPT');if(btn&&ta)btn.disabled=!ta.value.trim()}
function syncFloat(){
  var detail=document.getElementById('detailView'),f=document.getElementById('urgezNoteFloat');if(!f)return;
  var shown=!!(detail&&detail.classList.contains('active'));
  f.classList.toggle('show',shown);
  var id=infer();f.classList.toggle('has-note',!!(id&&getNote(id).trim()));
}
function openSheet(){
  var id=infer();if(!id)return;
  savedScrollY=window.scrollY||window.pageYOffset||0;
  var sh=document.getElementById('urgezNoteSheet'),ta=document.getElementById('urgezFreeNote'),title=document.getElementById('urgezNoteTitle'),state=document.getElementById('urgezNoteState');
  if(title)title.textContent='✍️ '+labels[id]+'メモ';
  if(ta)ta.value=getNote(id);
  if(state)state.textContent='入力中から自動保存';
  sh.classList.add('show');sh.setAttribute('aria-hidden','false');document.body.classList.add('urgez-note-open');syncButton();
  setTimeout(function(){if(ta)ta.focus()},80);
}
function closeSheet(){
  var id=infer(),ta=document.getElementById('urgezFreeNote'),sh=document.getElementById('urgezNoteSheet');if(id&&ta)setNote(id,ta.value);
  if(sh){sh.classList.remove('show');sh.setAttribute('aria-hidden','true')}
  document.body.classList.remove('urgez-note-open');syncFloat();
  requestAnimationFrame(function(){window.scrollTo(0,savedScrollY)});
}
function buildPrompt(id,note){return[
'Urgez改善依頼。',
'まず Notion の 📱HQ → 🛡️Urgez 正本 → GitHub xxkedy/keyz の main /urgez を確認して、現行版を基準にして。',
'対象カテゴリ: '+(labels[id]||id),
'kedyメモ: '+note.trim(),
'',
'既存の8カテゴリ・ログ・localStorage・Islamz接続・他カテゴリの仕様を壊さず、依頼対象と必要範囲だけ修正して。',
'iPhone前提で操作数を増やさず、見た目はdark/high contrastの現行Urgezに合わせる。',
'実装後は GitHub main を再取得して反映確認 → GitHub Pages build/deploy success確認 → Notionの🛡️Urgezと📱Appz正本を更新 → 両方再取得して一致確認。',
'iPhone実機でしか確認できない部分は「未確認」として残して。'
].join('\n')}
function fallbackCopy(text){var t=document.createElement('textarea');t.value=text;t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.select();try{document.execCommand('copy')}catch(e){}t.remove();return Promise.resolve()}
function handoff(){
  var id=infer(),ta=document.getElementById('urgezFreeNote'),btn=document.getElementById('urgezChatGPT'),state=document.getElementById('urgezNoteState');if(!id||!ta||!ta.value.trim())return;
  setNote(id,ta.value);var prompt=buildPrompt(id,ta.value);
  var copy=(navigator.clipboard&&navigator.clipboard.writeText)?navigator.clipboard.writeText(prompt).catch(function(){return fallbackCopy(prompt)}):fallbackCopy(prompt);
  copy.then(function(){if(state)state.textContent='✅ 修正指示をコピー済み';if(btn)btn.textContent='✅ コピー済み｜ChatGPTへ';setTimeout(function(){window.location.href='https://chatgpt.com/'},120)});
}
function sync(){
  injectStyle();injectUI();
  var v=document.querySelector('.version');if(v)v.setAttribute('aria-label','v2.3 · 2026.08.27');
  syncFloat();
  var sh=document.getElementById('urgezNoteSheet');if(sh&&sh.classList.contains('show')){var id=infer(),ta=document.getElementById('urgezFreeNote');if(id&&ta&&document.activeElement!==ta&&ta.value!==getNote(id))ta.value=getNote(id);syncButton()}
}
var queued=false;function queue(){if(queued)return;queued=true;requestAnimationFrame(function(){queued=false;sync()})}
document.addEventListener('click',function(e){var c=e.target.closest('[data-id]');if(c&&labels[c.dataset.id]){active=c.dataset.id;setTimeout(sync,0);setTimeout(sync,120)}if(e.target.closest('#back,#backBtn,#home,#resultHome')){closeSheet();active=null}},true);
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeSheet()});
sync();new MutationObserver(queue).observe(document.body,{attributes:true,attributeFilter:['class'],childList:true,subtree:true});window.addEventListener('pageshow',sync);
})();
