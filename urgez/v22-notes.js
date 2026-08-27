(function(){
'use strict';
var active=null;
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
  if(document.getElementById('urgez-v22-style'))return;
  var s=document.createElement('style');s.id='urgez-v22-style';s.textContent=`
.version{font-size:0!important}.version:after{content:'v2.2 · 2026.08.27';font-size:8.5px;color:var(--dim);letter-spacing:.5px}
#urgezBackReach{bottom:68px!important}
body.urgez-standalone #urgezBackReach{bottom:calc(env(safe-area-inset-bottom,0px) + 18px)!important}
#detailView{padding-bottom:132px!important}
.urgez-note-panel{border-color:rgba(50,217,233,.15);background:linear-gradient(145deg,rgba(50,217,233,.055),rgba(20,22,28,.78))}
.urgez-note-head{display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:8px}.urgez-note-head b{font-size:10px;letter-spacing:.8px;color:var(--cyan)}.urgez-note-head span{font-size:8px;color:var(--dim)}
#urgezFreeNote{width:100%;min-height:86px;resize:vertical;border:1px solid rgba(255,255,255,.09);border-radius:14px;background:rgba(7,8,12,.72);color:var(--text);padding:11px 12px;font-size:11px;line-height:1.5;outline:none}#urgezFreeNote:focus{border-color:rgba(50,217,233,.35);box-shadow:0 0 0 3px rgba(50,217,233,.06)}
.urgez-note-foot{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:7px}.urgez-note-state{font-size:8px;color:var(--dim)}
#urgezChatGPT{width:100%;min-height:48px;margin-top:9px;border:1px solid rgba(255,173,50,.26);border-radius:16px;background:linear-gradient(135deg,rgba(255,173,50,.16),rgba(50,217,233,.08));color:#fff4df;font-size:12px;font-weight:950}#urgezChatGPT:active{transform:scale(.985)}#urgezChatGPT[disabled]{opacity:.38}
.urgez-note-tip{margin-top:7px;color:#80848d;font-size:8px;line-height:1.45}
`;document.head.appendChild(s);
}
function injectPanel(){
  if(document.getElementById('urgezNotePanel'))return;
  var detail=document.getElementById('detailView');if(!detail)return;
  var p=document.createElement('section');p.id='urgezNotePanel';p.className='block urgez-note-panel';
  p.innerHTML='<div class="urgez-note-head"><b>✍️ 自分メモ</b><span>変えたいこと・気づき</span></div><textarea id="urgezFreeNote" placeholder="例：友達といる日だけOKにしたい／この理由も追加したい"></textarea><div class="urgez-note-foot"><span class="urgez-note-state" id="urgezNoteState">このiPhoneに自動保存</span></div><button id="urgezChatGPT" type="button">🤖 ChatGPTで修正</button><div class="urgez-note-tip">メモからGitHub修正用の指示を作ってコピーし、ChatGPTを開く。</div>';
  var ref=document.getElementById('hold')||document.getElementById('holdBox')||document.getElementById('stop')||document.getElementById('stopBtn');
  if(ref&&ref.parentNode===detail)detail.insertBefore(p,ref);else detail.appendChild(p);
  var ta=document.getElementById('urgezFreeNote'),btn=document.getElementById('urgezChatGPT');
  ta.addEventListener('input',function(){var id=infer();if(id)setNote(id,ta.value);syncButton()});
  ta.addEventListener('blur',function(){var id=infer();if(id)setNote(id,ta.value)});
  btn.addEventListener('click',handoff);
}
function syncButton(){var ta=document.getElementById('urgezFreeNote'),btn=document.getElementById('urgezChatGPT');if(btn&&ta)btn.disabled=!ta.value.trim()}
function syncPanel(){
  injectStyle();injectPanel();
  var v=document.querySelector('.version');if(v)v.setAttribute('aria-label','v2.2 · 2026.08.27');
  var detail=document.getElementById('detailView');if(!detail||!detail.classList.contains('active'))return;
  var id=infer();if(!id)return;
  var ta=document.getElementById('urgezFreeNote');if(ta&&document.activeElement!==ta){var saved=getNote(id);if(ta.value!==saved)ta.value=saved}
  syncButton();
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
  var id=infer(),ta=document.getElementById('urgezFreeNote'),btn=document.getElementById('urgezChatGPT'),state=document.getElementById('urgezNoteState');
  if(!id||!ta||!ta.value.trim())return;
  setNote(id,ta.value);
  var prompt=buildPrompt(id,ta.value);
  var copy=(navigator.clipboard&&navigator.clipboard.writeText)?navigator.clipboard.writeText(prompt).catch(function(){return fallbackCopy(prompt)}):fallbackCopy(prompt);
  copy.then(function(){if(state)state.textContent='✅ 修正指示をコピー済み';if(btn)btn.textContent='✅ コピー済み｜ChatGPTへ';setTimeout(function(){window.location.href='https://chatgpt.com/'},120)});
}
var queued=false;function queue(){if(queued)return;queued=true;requestAnimationFrame(function(){queued=false;syncPanel()})}
document.addEventListener('click',function(e){var c=e.target.closest('[data-id]');if(c&&labels[c.dataset.id]){active=c.dataset.id;setTimeout(syncPanel,0);setTimeout(syncPanel,120)}if(e.target.closest('#back,#backBtn,#home,#resultHome'))active=null},true);
syncPanel();new MutationObserver(queue).observe(document.body,{attributes:true,attributeFilter:['class'],childList:true,subtree:true});window.addEventListener('pageshow',syncPanel);
})();
