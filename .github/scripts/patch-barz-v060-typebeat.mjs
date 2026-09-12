import fs from 'node:fs';

const file = 'barz/index.html';
let html = fs.readFileSync(file, 'utf8');

function replaceOnce(oldText, newText, label) {
  if (!html.includes(oldText)) throw new Error(`Patch target missing: ${label}`);
  html = html.replace(oldText, newText);
}

replaceOnce(
  "const RADIO_RULES={max:20,minSec:120,maxSec:480,year:2026,freshDays:30,",
  "const RADIO_RULES={max:20,minSec:60,maxSec:480,year:2026,freshDays:30,",
  'RADIO_RULES minSec'
);

replaceOnce(
  "const RADIO_NOTE='自動選定は今年・2〜8分・埋め込み可能を前提に、再生数と公開からの日数で順位付けする。選んだBeatはこの端末に残る。';",
  "const RADIO_NOTE='自動選定は今年・1〜8分・埋め込み可能を前提に、再生数と公開からの日数で順位付けする。選んだBeatはこの端末に残る。';",
  'RADIO_NOTE duration'
);

replaceOnce(
  "if(d>0){t.durationSec=Math.round(d);t.bad='';saveRadio();if(d<RADIO_RULES.minSec||d>RADIO_RULES.maxSec)return radioReject(t,'尺が2〜8分の外',tries)}",
  "if(d>0){t.durationSec=Math.round(d);t.bad='';saveRadio();if(d<RADIO_RULES.minSec||d>RADIO_RULES.maxSec)return radioReject(t,'尺が1〜8分の外',tries)}",
  'radio duration reject message'
);

const oldQuickRap = "async function quickRap(){if(rapSessionActive)return;if(radio.live)radioStop();quickRapBtn.disabled=true;quickRapBtn.textContent='…';let ok=await playSmart();if(!ok&&radio.queue.length){await radioPlayAt(radio.idx<0?0:radio.idx,0);ok=radio.live}if(!ok){quickRapBtn.disabled=false;renderRadio();if(fallbackTools)fallbackTools.open=true;quickRapStatus.textContent='Beat未準備 · FALLBACKを確認';return}try{player.pauseVideo();player.seekTo(0,true)}catch(e){}const mic=await ensureMic();if(!mic){quickRapBtn.disabled=false;renderRadio();return}rapSessionActive=true;rapTakeNo=1;await beginRapCountdown()}";
const newQuickRap = "async function quickRap(){if(rapSessionActive)return;if(radio.live)radioStop();quickRapBtn.disabled=true;quickRapBtn.textContent='…';quickRapStatus.textContent='Beat確認中…';let ok=await playSmart();if(!ok&&radio.queue.length){quickRapStatus.textContent='Beat再生を確認中…';await radioPlayAt(radio.idx<0?0:radio.idx,0);ok=radio.live}if(!ok){renderRadio();const t=radio.idx>=0?radio.queue[radio.idx]:null;const why=(t&&t.bad)||radio.msg||'再生できるBeatがない';quickRapStatus.textContent='開始できず · '+why;quickRapBtn.disabled=!radio.queue.length;quickRapBtn.textContent=radio.queue.length?'🎧 別Beatを試す':'🎧 BEATを選ぶ';if(fallbackTools)fallbackTools.open=true;return}try{player.pauseVideo();player.seekTo(0,true)}catch(e){}quickRapStatus.textContent='マイク準備中…';const mic=await ensureMic();if(!mic){quickRapBtn.disabled=false;quickRapBtn.textContent='🎤 RAP';quickRapStatus.textContent='マイクを確認してな';renderRadio();return}quickRapStatus.textContent='3秒カウント…';rapSessionActive=true;rapTakeNo=1;await beginRapCountdown()}";
replaceOnce(oldQuickRap, newQuickRap, 'quickRap state machine');

replaceOnce(
  "quickRapStatus.textContent=smart.key?'TAP GO TO PREPARE':'BEAT RETRY';quickRapBtn.disabled=false",
  "quickRapStatus.textContent=smart.key?'TAP GO TO PREPARE':'BEAT未準備 · 左でBeatを選ぶ';quickRapBtn.disabled=!smart.key",
  'renderQuick empty-cache state'
);

html = html.replaceAll('尺(2〜8分)', '尺(1〜8分)');

fs.writeFileSync(file, html);
console.log('Patched Barz v0.6 type-beat start flow');
