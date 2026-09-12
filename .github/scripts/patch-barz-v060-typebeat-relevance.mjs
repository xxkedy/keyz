import fs from 'node:fs';

const file='barz/index.html';
let html=fs.readFileSync(file,'utf8');

function replaceOnce(oldText,newText,label){
  if(!html.includes(oldText)) throw new Error(`Patch target missing: ${label}`);
  html=html.replace(oldText,newText);
}

replaceOnce(
  "function normalizeTypeArtist(artist){return TYPE_BEAT_ARTISTS[artist]?artist:'Bladee'}",
  "function normalizeTypeArtist(artist){return TYPE_BEAT_ARTISTS[artist]?artist:'Bladee'}\nfunction typeBeatTitleMatch(title,artist){const norm=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();const t=norm(title),a=norm(artist);return !!t&&!!a&&t.includes(a)&&/type beat/i.test(String(title||''))}",
  'type beat relevance helper'
);

replaceOnce(
  "async function getTypeBeatCandidates(artist,force){artist=normalizeTypeArtist(artist);await loadBeatCache(!!force);const slot=typeBeatSlot(artist);let cached=smart.candidates[slot]?.tracks||[];if(cached.length&&!force)return cached.slice(0,RADIO_RULES.max);",
  "async function getTypeBeatCandidates(artist,force){artist=normalizeTypeArtist(artist);await loadBeatCache(!!force);const slot=typeBeatSlot(artist);let cached=(smart.candidates[slot]?.tracks||[]).filter(t=>typeBeatTitleMatch(t.title,artist));if(cached.length&&!force)return cached.slice(0,RADIO_RULES.max);if(!cached.length&&smart.candidates[slot]){delete smart.candidates[slot];saveSmart();}",
  'stale type cache purge'
);

replaceOnce(
  "q:TYPE_BEAT_ARTISTS[artist],order:'viewCount',publishedAfter:after,videoEmbeddable:'true'",
  "q:TYPE_BEAT_ARTISTS[artist],order:'relevance',publishedAfter:after,videoEmbeddable:'true',videoCategoryId:'10'",
  'type beat search relevance'
);

replaceOnce(
  ".filter(t=>radioKeep(t,'HOT',(RADIO_RULES.minViews.HOT||[0]).slice(-1)[0])).sort((a,b)=>b.smartScore-a.smartScore).slice(0,RADIO_RULES.max);if(!tracks.length)throw new Error('条件に合うBeatなし');smart.candidates[slot]",
  ".filter(t=>typeBeatTitleMatch(t.title,artist)&&radioKeep(t,'HOT',(RADIO_RULES.minViews.HOT||[0]).slice(-1)[0])).sort((a,b)=>b.smartScore-a.smartScore).slice(0,RADIO_RULES.max);if(!tracks.length)throw new Error(artist+' Type Beat候補なし');smart.candidates[slot]",
  'type beat title filter'
);

fs.writeFileSync(file,html);
console.log('Patched Barz Type Beat relevance: artist title match + relevance order + music category');
