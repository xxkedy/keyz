(()=>{
  'use strict';
  const stage=document.getElementById('stage');
  if(!stage)return;
  const FAV_KEY='barz_phase2_favorites_v1';
  let favOnly=false,renderSeq=0,lastSignature='',installedDoc=null;

  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const fmtDur=s=>{s=Math.max(0,Math.round(Number(s)||0));return s?Math.floor(s/60)+':'+String(s%60).padStart(2,'0'):''};
  const fmtViews=n=>{n=Math.max(0,Number(n)||0);if(n>=100000000)return(n/100000000).toFixed(n>=1000000000?0:1).replace(/\.0$/,'')+'億';if(n>=10000)return(n/10000).toFixed(n>=100000?0:1).replace(/\.0$/,'')+'万';if(n>=1000)return(n/1000).toFixed(1).replace(/\.0$/,'')+'K';return String(Math.round(n))};
  const viewTier=n=>n>=100000?'gold':n>=10000?'green':n>=1000?'cyan':'muted';
  const readFavs=()=>{try{const v=JSON.parse(localStorage.getItem(FAV_KEY)||'{}');return v&&typeof v==='object'?v:{}}catch(_){return{}}};
  const writeFavs=f=>{try{localStorage.setItem(FAV_KEY,JSON.stringify(f))}catch(_){}};

  function ctx(){
    const v2doc=stage.contentDocument;
    const inner=v2doc?.getElementById('barz');
    const d=inner?.contentDocument;
    return{inner,d,api:inner?.contentWindow?.BarzPhase2};
  }

  function installStyle(d){
    if(installedDoc===d&&d.getElementById('barz-v3-browser-style'))return;
    installedDoc=d;
    const s=d.getElementById('barz-v3-browser-style')||d.createElement('style');
    s.id='barz-v3-browser-style';
    s.textContent=`
      .candidateHead{gap:7px}.candidateHead>[data-candidate-count]{margin-left:auto;color:#43dce2!important}
      .candidateList{max-height:min(38vh,330px);overflow-y:auto!important;overscroll-behavior:contain;padding-right:3px;scrollbar-gutter:stable}
      .candidateList::-webkit-scrollbar{width:7px}.candidateList::-webkit-scrollbar-track{background:#090d0f;border-radius:99px}.candidateList::-webkit-scrollbar-thumb{background:#26383d;border-radius:99px}.candidateList::-webkit-scrollbar-thumb:hover{background:#315158}
      .candidateCard.v3Candidate{position:relative;grid-template-columns:76px minmax(0,1fr)!important;min-height:62px!important;padding-right:38px!important;transition:border-color .12s ease,background .12s ease,transform .12s ease}
      .candidateCard.v3Candidate:hover{transform:translateY(-1px)}
      .candidateCard.v3Candidate.isFav{border-color:#6c5a2e!important;background:linear-gradient(90deg,#17150e,#0d1113 42%)!important}
      .candidateInfo b{padding-right:4px!important;font-size:10px!important}
      .v3Meta{display:flex!important;align-items:center;gap:5px!important;margin-top:6px!important;white-space:nowrap!important;overflow:hidden!important}
      .v3Chip{display:inline-flex;align-items:center;min-height:17px;padding:1px 5px;border:1px solid #273137;border-radius:999px;background:#111719;font-style:normal;font-size:7.5px;line-height:1;color:#879198;flex:none}
      .v3Channel{min-width:0;max-width:42%;overflow:hidden;text-overflow:ellipsis;border-color:transparent;background:transparent;padding-left:0;color:#7c878e}
      .v3Duration{color:#8fb9df;border-color:#203c52;background:#0c1821}
      .v3Views[data-tier="cyan"]{color:#43dce2;border-color:#20545a;background:#0b1b1e}.v3Views[data-tier="green"]{color:#58e1c0;border-color:#245247;background:#0c1b17}.v3Views[data-tier="gold"]{color:#f1c96e;border-color:#5a4923;background:#1d180b}.v3Views[data-tier="muted"]{color:#8c959b}
      .v3Fav{position:absolute;right:7px;top:50%;transform:translateY(-50%);display:grid;place-items:center;width:28px;height:28px;border:1px solid #30393e;border-radius:9px;background:#111719;color:#687278;font-size:17px;line-height:1;z-index:3}
      .v3Fav.on{color:#f1c96e;border-color:#6a5729;background:#211a0b}.v3Fav:hover{border-color:#6a5729;color:#f1c96e}
      .v3FavFilter{min-height:26px;padding:0 8px;border:1px solid #30393e;border-radius:8px;background:#111719;color:#8c959b;font-size:8px;font-weight:950;white-space:nowrap}.v3FavFilter.on{color:#f1c96e;border-color:#6a5729;background:#211a0b}
      .v3EmptyFav{border:1px dashed #4c4228;border-radius:12px;padding:16px 10px;text-align:center;color:#b8a36d;font-size:9px;line-height:1.5}
      @media(max-width:900px){.candidateList{max-height:290px}.candidateCard.v3Candidate{min-height:58px!important}.v3Chip{font-size:7px}.v3Fav{width:26px;height:26px}}
    `;
    if(!s.parentNode)d.head.appendChild(s);
  }

  function ensureFilter(d,total,favCount){
    const head=d.querySelector('.candidateHead');
    if(!head)return;
    let b=head.querySelector('[data-v3-fav-filter]');
    if(!b){
      b=d.createElement('button');b.type='button';b.className='v3FavFilter';b.dataset.v3FavFilter='1';head.appendChild(b);
      b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();favOnly=!favOnly;lastSignature='';schedule();});
    }
    b.classList.toggle('on',favOnly);
    b.textContent=(favOnly?'★ FAV':'☆ FAV')+' '+favCount;
    b.title=favOnly?'お気に入り表示を解除':'お気に入りだけ表示';
    const count=head.querySelector('[data-candidate-count]');
    if(count)count.textContent=total+' PICKS';
  }

  async function render(){
    const {inner,d,api}=ctx();
    if(!inner||!d||!api?.getTypeCandidates)return;
    installStyle(d);
    let beatMode='';try{beatMode=localStorage.getItem('barz_phase2_beat_mode')||''}catch(_){ }
    if(beatMode!=='type'){lastSignature='';return}
    const slot=d.querySelector('[data-candidate-slot]');
    if(!slot)return;
    let artist='Bladee';try{artist=localStorage.getItem('barz_phase2_artist')||'Bladee'}catch(_){ }
    const seq=++renderSeq;
    let tracks=[];try{tracks=await api.getTypeCandidates(artist,false)||[]}catch(_){return}
    if(seq!==renderSeq||!tracks.length)return;
    const favs=readFavs();
    const favCount=tracks.filter(t=>favs[t.videoId]).length;
    ensureFilter(d,tracks.length,favCount);
    const shown=favOnly?tracks.filter(t=>favs[t.videoId]):tracks;
    const sig=[artist,favOnly,tracks.map(t=>t.videoId).join(','),Object.keys(favs).sort().join(',')].join('|');
    if(sig===lastSignature&&slot.querySelector('.v3Candidate'))return;
    lastSignature=sig;
    if(!shown.length){slot.innerHTML='<div class="v3EmptyFav">★ まだお気に入りなし<br>Beat右端の☆で保存できる。</div>';return}
    slot.innerHTML=shown.map(t=>{
      const id=esc(t.videoId),fav=!!favs[t.videoId],views=Number(t.views)||0;
      const meta=[
        '<i class="v3Chip v3Channel">'+esc(t.channel||'Unknown')+'</i>',
        t.durationSec?'<i class="v3Chip v3Duration">◷ '+esc(fmtDur(t.durationSec))+'</i>':'',
        '<i class="v3Chip v3Views" data-tier="'+viewTier(views)+'">▶ '+esc(fmtViews(views))+'</i>'
      ].join('');
      return '<button class="candidateCard v3Candidate'+(fav?' isFav':'')+'" data-candidate="'+id+'">'+
        '<img class="candidateThumb" src="https://i.ytimg.com/vi/'+id+'/mqdefault.jpg" alt="">'+
        '<span class="candidateInfo"><b>'+esc(t.title||'Untitled Beat')+'</b><span class="v3Meta">'+meta+'</span></span>'+
        '<span class="v3Fav'+(fav?' on':'')+'" data-v3-fav="'+id+'" role="button" aria-label="お気に入り">'+(fav?'★':'☆')+'</span></button>';
    }).join('');
    if(!slot.dataset.v3FavHandler){
      slot.dataset.v3FavHandler='1';
      slot.addEventListener('click',e=>{
        const star=e.target.closest('[data-v3-fav]');if(!star)return;
        e.preventDefault();e.stopPropagation();
        const id=star.dataset.v3Fav;const all=readFavs();
        if(all[id])delete all[id];else{
          const t=tracks.find(x=>x.videoId===id);if(t)all[id]={videoId:id,title:t.title||'',channel:t.channel||'',views:Number(t.views)||0,durationSec:Number(t.durationSec)||0,sourceArtist:artist,savedAt:Date.now()};
        }
        writeFavs(all);lastSignature='';schedule();
      },true);
    }
  }

  let timer=0;
  function schedule(){clearTimeout(timer);timer=setTimeout(render,90)}
  stage.addEventListener('load',()=>{lastSignature='';setTimeout(render,500)});
  setInterval(()=>{
    const {d}=ctx();
    if(!d)return;
    const slot=d.querySelector('[data-candidate-slot]');
    if(slot&&!slot.querySelector('.v3Candidate')&&!slot.querySelector('.v3EmptyFav'))lastSignature='';
    schedule();
  },650);
  setTimeout(render,700);
})();
