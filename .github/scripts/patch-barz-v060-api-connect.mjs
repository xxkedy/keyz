import fs from 'node:fs';

const corePath='barz/index.html';
const qaPath='barz/phase2-desktop-v2.html';
let core=fs.readFileSync(corePath,'utf8');
let qa=fs.readFileSync(qaPath,'utf8');

function replaceBetween(src,start,end,repl,label){
  const a=src.indexOf(start), b=a<0?-1:src.indexOf(end,a+start.length);
  if(a<0||b<0) throw new Error('Missing range: '+label);
  return src.slice(0,a)+repl+src.slice(b);
}
function insertBefore(src,marker,text,label){
  if(src.includes(text.trim().slice(0,64))) return src;
  const i=src.indexOf(marker);
  if(i<0) throw new Error('Missing marker: '+label);
  return src.slice(0,i)+text+src.slice(i);
}

const apiObject=`window.BarzPhase2={
  artists:Object.keys(TYPE_BEAT_ARTISTS),
  hasApiKey:()=>{try{return String(localStorage.getItem(API_KEY)||'').trim().length>=20}catch(e){return false}},
  setApiKey:async(key,artist)=>{key=String(key||'').trim();artist=normalizeTypeArtist(artist);if(key.length<20)return{ok:false,reason:'APIキーを確認してな',tracks:[]};try{localStorage.setItem(API_KEY,key)}catch(e){return{ok:false,reason:'この端末へ保存できへん',tracks:[]}}smart.key=key;delete smart.candidates[typeBeatSlot(artist)];saveSmart();const tracks=await getTypeBeatCandidates(artist,true);return tracks.length?{ok:true,tracks}:{ok:false,reason:smart.error||'候補を取得できへん',tracks:[]}},
  getTypeCandidates:getTypeBeatCandidates,
  playTypeCandidate:playTypeBeatCandidate,
  getBeatState:()=>{const t=radio.idx>=0?radio.queue[radio.idx]:null;return{ready:!!(t&&radio.live&&!t.bad),live:radio.live,title:t?.title||'',videoId:t?.videoId||'',reason:t?.bad||radio.msg||''}}
};`;
core=replaceBetween(core,'window.BarzPhase2={','\nasync function playSmart(){',apiObject,'BarzPhase2 API');

const apiCss=`      .candidateSetup{border:1px solid #285259;border-radius:12px;background:#0a181b;padding:10px;margin-top:6px}.candidateSetup b{display:block;font-size:9.5px;color:#42dce3}.candidateSetup span{display:block;margin-top:4px;font-size:8px;line-height:1.45;color:#859096}.apiInline{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px;margin-top:8px}.apiInline input{min-width:0;height:36px;border:1px solid #2c383d;border-radius:10px;background:#080c0e;color:#f4f1e9;padding:0 10px;font-size:9px;outline:none}.apiInline input:focus{border-color:#2bd8df}.apiInline button{min-width:70px;border:1px solid #23616a;border-radius:10px;background:#0e2528;color:#43dce2;font-size:8.5px;font-weight:950}.apiInline button:disabled{opacity:.45}.apiError{margin-top:7px;color:#f0c879;font-size:8px;line-height:1.4}.candidateRetry{width:100%;min-height:34px;margin-top:7px;border:1px solid #2d3c41;border-radius:10px;background:#111719;color:#f4f1e9;font-size:8.5px;font-weight:900}\n`;
qa=insertBefore(qa,'      .nowBeat{',apiCss,'API inline CSS');

const loader=`    let candidateSeq=0;
    function renderApiSetup(slot,count,fallback,message){
      const api=frame.contentWindow.BarzPhase2;
      if(count)count.textContent='0 PICKS';
      if(api?.hasApiKey?.()){
        slot.innerHTML='<div class="candidateEmpty">'+esc(message||'候補を取得できへん。')+'</div><button class="candidateRetry" data-api-retry>↻ Barz内で再取得</button>';
      }else{
        slot.innerHTML='<div class="candidateSetup"><b>⚡ 初回だけYouTube API設定</b><span>このPCにだけ保存。設定後はBladee候補をBarz内へ直接出す。</span><div class="apiInline"><input type="password" autocomplete="off" spellcheck="false" data-api-key placeholder="YouTube API key"><button type="button" data-api-connect>接続</button></div><div class="apiError" data-api-error></div></div>';
      }
      if(fallback)fallback.style.display='grid';
    }
    async function loadTypeCandidates(force=false){
      const seq=++candidateSeq,slot=beatBody.querySelector('[data-candidate-slot]'),count=beatBody.querySelector('[data-candidate-count]'),fallback=beatBody.querySelector('[data-fallback]');
      if(!slot||beatMode!=='type')return;
      slot.innerHTML='<div class="candidateEmpty">⚡ Barz内で候補を準備中…</div>';
      if(count)count.textContent='LOADING';
      try{
        const api=frame.contentWindow.BarzPhase2;
        if(!api?.getTypeCandidates)throw new Error('候補API準備待ち');
        const tracks=await api.getTypeCandidates(selectedArtist,!!force);
        if(seq!==candidateSeq||beatMode!=='type')return;
        const list=(tracks||[]).slice(0,4);
        if(!list.length){renderApiSetup(slot,count,fallback,'候補はまだ0件。');return}
        if(count)count.textContent=list.length+' PICKS';
        if(fallback)fallback.style.display='none';
        slot.innerHTML=list.map(t=>'<button class="candidateCard" data-candidate="'+esc(t.videoId)+'"><img class="candidateThumb" src="https://i.ytimg.com/vi/'+esc(t.videoId)+'/mqdefault.jpg" alt=""><span class="candidateInfo"><b>'+esc(t.title||'Untitled Beat')+'</b><span>'+esc([t.channel,fmtDur(t.durationSec),fmtViews(t.views)].filter(Boolean).join(' · '))+'</span></span></button>').join('');
      }catch(err){
        if(seq!==candidateSeq)return;
        renderApiSetup(slot,count,fallback,err?.message||'候補を取得できへん。');
      }
    }
`;
qa=replaceBetween(qa,'    let candidateSeq=0;','    function renderBeat(){',loader,'Type candidate loader');

const clickMarker="      const candidate=e.target.closest('[data-candidate]');";
if(!qa.includes("data-api-connect")) throw new Error('API UI missing after patch');
if(!qa.includes("const apiConnect=e.target.closest('[data-api-connect]')")){
  const apiClicks=`      const apiConnect=e.target.closest('[data-api-connect]');if(apiConnect){const wrap=apiConnect.closest('.candidateSetup'),input=wrap?.querySelector('[data-api-key]'),err=wrap?.querySelector('[data-api-error]'),key=String(input?.value||'').trim();apiConnect.disabled=true;if(err)err.textContent='接続中…';try{const api=frame.contentWindow.BarzPhase2;if(!api?.setApiKey)throw new Error('API接続準備待ち');const r=await api.setApiKey(key,selectedArtist);if(input)input.value='';if(!r?.ok){if(err)err.textContent=r?.reason||'接続できへん';return}setBeatState('✓ YouTube API接続 · 候補取得済み','ok');await loadTypeCandidates(false)}catch(ex){if(input)input.value='';if(err)err.textContent=ex?.message||'接続できへん'}finally{apiConnect.disabled=false}return}
      const apiRetry=e.target.closest('[data-api-retry]');if(apiRetry){apiRetry.disabled=true;setBeatState('候補を再取得中…','warn');try{await loadTypeCandidates(true)}finally{apiRetry.disabled=false}return}
`;
  const i=qa.indexOf(clickMarker);
  if(i<0) throw new Error('Candidate click marker missing');
  qa=qa.slice(0,i)+apiClicks+qa.slice(i);
}

fs.writeFileSync(corePath,core);
fs.writeFileSync(qaPath,qa);
console.log('Patched Barz inline YouTube API connect');
