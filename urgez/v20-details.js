(function(){
'use strict';
var active=null;
var D={
  sweets:{
    title:'🍽️ 食事',impact:'HALAL？ BODY？ どっちも見てから食べる。',desc:'お菓子・ラーメン・マック・普通の外食まで入口はここ1つ。宗教上の成分と、腹・体重・肌・仕事への影響を同じ画面で見る。',faith:'Qur’an 2:173 / 5:3 · 豚を避ける ／ Qur’an 7:200 · 誘惑に一度止まる',
    groups:[{title:'🕌 HALAL',tone:'green',rows:[['🐷','豚肉・ラード・豚由来ゼラチンを確認'],['🍷','酒・洋酒を使った物も確認'],['🔎','分からなければ成分を見るか別の物へ']]},{title:'💪 BODY',tone:'cyan',rows:[['🤔','空腹？ 口寂しいだけ？'],['🍟','今日もうお菓子・ジャンクを食べた？'],['📏','量を先に決めた？ 大盛り・追加はしない'],['💼','明日の腹・仕事に響かない？']]}],ok:'✅ HALALを確認できて、本当に食べたい1食ならOK',
    why:[['🕌','ハラル寄りを自然に選びたい'],['💼','腹痛・下痢で仕事を邪魔されたくない'],['⚖️','体重を増やす食べ方を減らしたい'],['✨','肌を整えたい'],['😮‍💨','食後のだるさ・後悔を減らしたい'],['💸','惰性のお菓子・ジャンクに金を使いたくない']],
    loss:['🍫 8/26　お菓子を爆食い','🚽 8/27　腹痛・下痢・ガス','💼 仕事中に何度もトイレ'],lossNote:'Diaryでも夜のお菓子・爆食い・体重増加を何度も反省。今うまそうだけで決めず、翌日の身体まで見る。',
    ideal:['🕌 ハラルを自然に選べる','🍔 ジャンクは本当に食べたい1食だけ','📏 量と回数を自分で決めて終われる'],note:'HALAL＝健康食ではない。宗教上OKでも、爆食い・ジャンクの重ね食いはBODY側で止める。',stop:'🛡 今は別の物を選ぶ',allow:'✅ 2軸とも条件内｜食べてOK',did:'条件外で食べた'
  },
  tobacco:{
    title:'🚬 タバコ',impact:'もう判断しない。VAPEも紙タバコも吸わない。',desc:'友達の日も含めて例外なし。2026-08-31から紙タバコも終了。吸いたくなった時だけここを開いてSTOPして終わる。',faith:'Qur’an 7:200 · 欲望に自動で従わず、一度止まる',
    groups:[{title:'🚭 NICOTINE ZERO',tone:'red',rows:[['🚭','VAPEも紙タバコも吸わない'],['👥','友達と一緒でも例外なし']]},{title:'🚫 NO CARRY',tone:'red',rows:[['🛒','自分用に買わない'],['🤝','もらわない'],['📦','余りを持ち帰らない'],['✋','もし1本吸っても続けず、その場で止める']]}],
    why:[['🧠','タバコのことを考える時間をなくしたい'],['🗣️','喉を荒らしたくない'],['👃','服・部屋・息に臭いを残したくない'],['💸','ニコチンに金を使いたくない'],['🔓','吸う予定に生活を決められたくない']],
    loss:['👥 「友達の日だけOK」','📦 余りを持ち帰る','🚬 翌日1人でも吸う'],lossNote:'2026-08-31、1本吸った後に残り約10本を処分。友達の日だけOKという旧ルールを終了。',
    ideal:['🧠 タバコのことを考えない生活','👥 友達の日も普通に吸わない','🚭 VAPEを買い直さない'],note:'VAPE卒業ライン：2026-08-15開始／ニコチン0ライン：2026-08-31開始／2026-10-02の誕生日を吸わない状態で迎える。',stop:'🚭 吸わないで終わり',did:'吸った → その場で止めて残りを処分'
  },
  sns:{
    title:'📱 SNS',impact:'目的なしで開いたら、時間だけ消える。',desc:'必要な投稿を見るSNSと、指が勝手に開くSNSは別。何を見るか言える時だけ使う。',faith:'Qur’an 7:200 · 注意を奪う誘惑にも一回止まる',
    groups:[{title:'🎯 PURPOSE',tone:'cyan',rows:[['🎯','何を見るか1つ言える時だけ開く'],['🔎','目的の投稿・相手だけ見る']]},{title:'🚪 EXIT',tone:'green',rows:[['🏠','目的の物を見たらホームTLへ流れない'],['✋','見終わったらその場で閉じる']]}],ok:'✅ 目的が明確なら使ってOK',
    why:[['⏱️','無意識スクロールに時間を取られたくない'],['🎵','制作へ集中を戻したい'],['🗣️','英語や人との時間を削りたくない'],['🌙','寝る前の「もう少し」で睡眠を削りたくない']],
    loss:['📱 目的なく開く','♾️ ホームTLを流し続ける','⏱️ 気づいたら時間だけ消える'],lossNote:'Diaryでも「SNSはマジにやめれな…」と反省。残るのは見た内容より、消えた時間。',
    ideal:['🎯 用事がある時だけ開く','✅ 見たい物を見て終わる','🧠 指より自分が使い方を決める'],stop:'🛡 今は開かない',allow:'✅ 見る目的があるならOK',did:'無目的で見続けた'
  },
  shopping:{
    title:'🛒 買いすぎ',impact:'欲しい＝ダメじゃない。即決だけ切る。',desc:'香水みたいに本当に欲しい物まで止めない。24時間置いて、用途・重複・予算を通ったら買う。',faith:'Qur’an 7:200 · 衝動と判断の間に時間を置く',
    groups:[{title:'⏳ 24H HOLD',tone:'amber',rows:[['⏳','まず24時間置く'],['🔁','24時間後もまだ欲しいか見る']]},{title:'✅ BUY CHECK',tone:'green',rows:[['🎯','使う場面・目的が具体的'],['♻️','似た役割があるなら置換か明確な違い'],['💰','貯金・投資・必要支出を崩さない']]}],ok:'✅ 24時間＋用途＋重複＋予算を通ったら買ってOK',
    why:[['💰','無駄な買い物を減らして貯金・投資へ回したい'],['🏠','部屋の物を増やしすぎたくない'],['⚡','安い・欲しいだけで即決したくない'],['⭐','本当に使う一軍だけ残したい'],['🧾','買った後の「いらんかった」を減らしたい']],
    loss:['🛒 欲しい瞬間に即購入','📦 物が増える・金が減る','😮‍💨 後から「いらんかった」'],lossNote:'Diaryでも「買いすぎ」「貯金しよう」と反省。問題は買うこと自体ではなく、条件なしの即決。',
    ideal:['⏳ 欲しい→24時間置ける','⭐ 本当に使う一軍だけ買う','💰 買っても貯金・投資を崩さない'],stop:'⏳ 24時間保留する',allow:'✅ 条件を満たした｜買ってOK',did:'条件外で買った'
  },
  porn:{
    title:'🔞 ポルノ',impact:'見たいのか、刺激に引っ張られてるだけか。',desc:'罪悪感で罰するより、暇・ストレス・惰性で自動的に開く流れを止める。',faith:'Qur’an 24:30 · 視線と欲望を自分で制御する判断軸',
    groups:[{title:'🛑 AUTO-PILOT STOP',tone:'red',rows:[['😶','暇だから、で自動的に開かない'],['😣','ストレス逃避で自動的に開かない']]},{title:'🧠 LIMIT',tone:'cyan',rows:[['📈','より強い刺激を探し続けない'],['⏱️','現実の時間・関係・睡眠を削らない']]}],
    why:[['🧠','刺激を求めて無意識に開く癖を弱くしたい'],['⏱️','時間と集中を持っていかれたくない'],['📈','より強い刺激を探し続ける使い方を避けたい'],['🤝','現実の人間関係より画面を優先したくない']],
    loss:['😶 暇・ストレス','📱 自動で開く','⏱️ 刺激探しで時間が消える'],lossNote:'繰り返しの実害ログはまだ少ない。まず「衝動＝即開く」を切ることを優先する。',
    ideal:['🧠 衝動が来ても一度止まれる','📵 見ない選択を普通にできる','🤝 現実の時間を優先できる'],stop:'🛡 今は見ない',did:'惰性で見た'
  },
  alcohol:{
    title:'🍺 酒',impact:'イスラムでは避ける。少なくとも習慣にはしない。',desc:'宗教上の判断と、常習化を防ぐ個人ルールを混同しない。友達の日でも「イスラム的にOK」になるわけではない。',faith:'Qur’an 5:90–91 · 酒（khamr）は避ける対象',
    groups:[{title:'🕌 ISLAM',tone:'green',rows:[['🕌','宗教上は避ける対象として覚える']]},{title:'⚠️ DAMAGE CONTROL',tone:'amber',rows:[['👥','個人ルールでは友達との特別な日だけ'],['🧍','1人では飲まない'],['📅','曜日固定・ストレス飲みにしない'],['➡️','翌日へ持ち越さない']]}],ok:'⚠️ 個人ルール内でも宗教上の許可ではない',
    why:[['🕌','イスラムの判断軸を忘れたくない'],['🧠','酒を自動習慣にしたくない'],['🏠','1人飲みを習慣にしたくない'],['😶‍🌫️','飲んだ後のぼーっとした感じを避けたい'],['🌅','翌日の時間と判断力を残したい']],
    loss:['🍺 飲む','😶‍🌫️ ぼーっとする','📉 その後の時間・判断が落ちる'],lossNote:'Diaryに「酒のあとはぼーとする」。Islamzでも「金曜夜＝酒」の習慣化が怖いと整理済み。',
    ideal:['🕌 酒を避ける判断が自然になる','🏠 1人・習慣では飲まない','🧠 ストレス対処を酒に任せない'],note:'友達と一緒でもイスラム上の許可にはならない。条件内OKは常習化防止の個人ログ。',stop:'🛡 今日は飲まない',allow:'✅ 個人ルール内なら記録',did:'条件外で飲んだ'
  },
  sleep:{
    title:'🌙 夜更かし',impact:'今日の30分より、明日の1日を守る。',desc:'予定してない「もう少し」で寝る時間を後ろにずらす癖を止める。予定した特別な夜と惰性を分ける。',faith:'Qur’an 78:9 · 睡眠を休息として扱う',
    groups:[{title:'🌙 NORMAL NIGHT',tone:'cyan',rows:[['🕚','23:00を基本の終了ラインにする'],['📱','SNS・動画の「もう少し」で延長しない'],['🛏️','ベッドに入ってからもう1本始めない']]},{title:'✅ EXCEPTION',tone:'green',rows:[['🎤','友達・イベント・移動・RECなど先に決めた夜だけ例外']]}],ok:'✅ 先に決めた特別な夜なら例外',
    why:[['🌅','朝のだるさを増やしたくない'],['💼','仕事中の眠気・集中低下を避けたい'],['🧠','寝不足で翌日の判断を落としたくない'],['📱','SNS・動画・作業の惰性に睡眠を渡したくない']],
    loss:['📱 「あと少し」を続ける','🌙 睡眠時間を削る','😵 翌朝・日中の調子が落ちる'],lossNote:'Diaryでも「寝不足はあかんね」と反省。睡眠時間が取れた日は朝・日中の調子が良い記録あり。',
    ideal:['🕚 23時を基本に切り上げる','🌅 翌朝から普通に動ける','✅ 特別な夜だけ自分で例外を決める'],stop:'🌙 今日はここで寝る',allow:'✅ 予定した特別な夜ならOK',did:'惰性で夜更かしした'
  },
  pork:{
    title:'😤 怒り',impact:'今この一言、本当に言う必要ある？',desc:'怒ること自体は失敗やない。怒りのまま言葉・LINE・決断に変える前に、一回止まる。',faith:'Qur’an 3:134 · 怒りを抑え、人を赦す',
    groups:[{title:'🕌 STOP SEQUENCE',tone:'green',rows:[['🕌','Aʿūdhuを1回言う'],['🤐','まず黙る。怒ったまま返事しない'],['⏸️','その場で全部決着させない'],['👀','相手が何を感じてるか1回見る'],['1️⃣','落ち着いて要点を1つだけ言う']]}],
    why:[['❤️','言い方で大事な人を傷つけたくない'],['🔁','同じ喧嘩を繰り返したくない'],['🧠','怒りに判断を持っていかれたくない'],['🙏','後から謝る言葉を減らしたい'],['👀','腹が立っても相手を見て言葉を選びたい']],
    loss:['😤 怒りが出る','💬 そのまま言葉・LINEにする','💥 関係が悪くなって後悔する'],lossNote:'Diaryで「自分の言い方や怒り方を見直した。怒りが出る前に相手を見る」と反省。',
    ideal:['🕌 Aʿūdhuで一度止まれる','👀 相手を見てから話せる','1️⃣ 必要なことだけ落ち着いて言える'],note:'怒りを感じた＝失敗ではない。怒りのまま反応したかを見る。',stop:'🛡 一回黙る',did:'怒りのまま言った / 送った'
  }
};
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function setText(el,t){if(el&&el.textContent!==t)el.textContent=t}
function setHTML(el,h){if(el&&el.innerHTML!==h)el.innerHTML=h}
function infer(){if(active&&D[active])return active;var t=document.getElementById('title');if(!t)return null;var x=t.textContent;if(x.includes('食事')||x.includes('お菓子'))return'sweets';if(x.includes('タバコ'))return'tobacco';if(x.includes('SNS'))return'sns';if(x.includes('買いすぎ'))return'shopping';if(x.includes('ポルノ'))return'porn';if(x.includes('酒'))return'alcohol';if(x.includes('夜更かし'))return'sleep';if(x.includes('怒り')||x.includes('ハラル食'))return'pork';return null}
function row(x){return'<div class="v20-row"><span class="v20-emoji">'+esc(x[0])+'</span><span>'+esc(x[1])+'</span></div>'}
function renderGroups(d){return'<div class="v20-groups">'+d.groups.map(function(g){return'<div class="v20-group '+(g.tone||'')+'"><div class="v20-group-title">'+esc(g.title)+'</div>'+g.rows.map(row).join('')+'</div>'}).join('')+(d.ok?'<div class="v20-ok">'+esc(d.ok)+'</div>':'')+'</div>'}
function renderWhy(d){return d.why.map(function(x){return'<div class="v20-chip"><span class="v20-emoji">'+esc(x[0])+'</span><span>'+esc(x[1])+'</span></div>'}).join('')}
function renderLoss(d){return'<div class="v20-loss-flow">'+d.loss.map(function(x,i){return(i?'<div class="v20-arrow">↓</div>':'')+'<div class="v20-loss-step">'+esc(x)+'</div>'}).join('')+'</div><div class="v20-loss-note">'+esc(d.lossNote)+'</div>'}
function renderIdeal(d){return'<div class="v20-ideal">'+d.ideal.map(function(x){return'<div class="v20-ideal-chip">'+esc(x)+'</div>'}).join('')+'</div>'}
function setHead(el,text){var b=el&&el.closest('.block')?el.closest('.block').querySelector('.block-head b'):null;setText(b,text)}
function render(){
  var id=infer(),d=id&&D[id];if(!d)return;
  var view=document.getElementById('detailView');if(!view||!view.classList.contains('active'))return;
  view.classList.add('v20-visual');
  setText(document.querySelector('.version'),'v2.4 · 2026.08.31');
  setText(document.getElementById('title'),d.title);
  setText(view.querySelector('.impact-kicker'),'🚨 いま止める理由');
  setText(document.getElementById('impact'),d.impact);
  setText(document.getElementById('desc'),d.desc);
  setText(document.getElementById('faith'),d.faith);
  var rules=document.getElementById('rules'),whys=document.getElementById('whys'),loss=document.getElementById('loss'),ideal=document.getElementById('ideal'),note=document.getElementById('note'),allow=document.getElementById('allow');
  setHead(rules,'🧭 MY RULE｜先に決めた条件');setHTML(rules,renderGroups(d));
  setHead(whys,'🎯 WHY｜なんでやめたい？');setHTML(whys,renderWhy(d));
  setHead(loss,'🚨 REAL LOSS｜またこうなる？');setHTML(loss,renderLoss(d));
  setHead(ideal,'🌱 IDEAL｜こうなりたい');setHTML(ideal,renderIdeal(d));
  if(note){if(d.note){note.hidden=false;setText(note,d.note)}else note.hidden=true}
  setText(document.getElementById('stop'),d.stop);
  if(allow){if(d.allow){allow.hidden=false;setText(allow,d.allow)}else{allow.hidden=true}}
  setText(document.getElementById('did'),d.did);
}
function inject(){if(document.getElementById('v20-style'))return;var s=document.createElement('style');s.id='v20-style';s.textContent=`
#detailView.v20-visual .faith-strip{position:relative;padding-top:31px}
#detailView.v20-visual .faith-strip:before{content:'🕌  ISLAM';position:absolute;left:13px;top:10px;color:var(--green);font-size:9px;font-weight:950;letter-spacing:1px}
#detailView.v20-visual .block-head b{font-size:10px;letter-spacing:.7px}
#detailView.v20-visual .v20-groups{display:grid;gap:9px}
#detailView.v20-visual .v20-group{padding:10px 11px;border:1px solid rgba(255,255,255,.08);border-radius:15px;background:rgba(255,255,255,.028)}
#detailView.v20-visual .v20-group-title{font-size:10px;font-weight:950;letter-spacing:.6px;margin-bottom:7px;color:var(--cyan)}
#detailView.v20-visual .v20-group.green .v20-group-title{color:var(--green)}
#detailView.v20-visual .v20-group.red .v20-group-title{color:var(--red)}
#detailView.v20-visual .v20-group.amber .v20-group-title{color:var(--amber)}
#detailView.v20-visual .v20-row{display:flex;gap:9px;align-items:flex-start;padding:7px 0;border-top:1px solid rgba(255,255,255,.05);font-size:10.5px;line-height:1.4;color:#ececea}
#detailView.v20-visual .v20-row:nth-child(2){border-top:0}
#detailView.v20-visual .v20-emoji{flex:0 0 22px;font-size:15px;line-height:1.15;text-align:center}
#detailView.v20-visual .v20-ok{padding:10px 11px;border-radius:13px;border:1px solid rgba(87,223,140,.18);background:rgba(87,223,140,.065);font-size:10.5px;line-height:1.4;color:#dff9e9}
#detailView.v20-visual .reasons{display:grid;gap:7px}
#detailView.v20-visual .reason{display:none!important}
#detailView.v20-visual .v20-chip{display:flex;align-items:flex-start;gap:9px;padding:10px 11px;border:1px solid rgba(255,255,255,.08);border-radius:13px;background:rgba(255,255,255,.035);font-size:10.5px;line-height:1.4}
#detailView.v20-visual .v20-loss-flow{display:grid;gap:5px;text-align:center}
#detailView.v20-visual .v20-loss-step{padding:10px;border-radius:13px;background:rgba(255,93,104,.065);border:1px solid rgba(255,93,104,.13);font-size:11px;font-weight:850;line-height:1.35}
#detailView.v20-visual .v20-arrow{color:var(--red);font-size:15px;line-height:1}
#detailView.v20-visual .v20-loss-note{margin-top:9px;color:#c9aeb1;font-size:9.5px;line-height:1.5}
#detailView.v20-visual .v20-ideal{display:grid;gap:7px}
#detailView.v20-visual .v20-ideal-chip{padding:10px 11px;border-radius:13px;background:rgba(87,223,140,.055);border:1px solid rgba(87,223,140,.12);font-size:10.5px;line-height:1.4}
`;document.head.appendChild(s)}
function apply(){inject();render()}
var queued=false;function queue(){if(queued)return;queued=true;requestAnimationFrame(function(){queued=false;render()})}
document.addEventListener('click',function(e){var b=e.target.closest('[data-id]');if(b&&D[b.dataset.id]){active=b.dataset.id;setTimeout(render,0);setTimeout(render,80);setTimeout(render,220)}if(e.target.closest('#back,#home'))active=null},true);
apply();new MutationObserver(queue).observe(document.body,{childList:true,subtree:true,characterData:true});
})();
