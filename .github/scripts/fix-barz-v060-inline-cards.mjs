import fs from 'node:fs';

const file='barz/phase2-desktop-v2.html';
let html=fs.readFileSync(file,'utf8');

const start="      }else if(beatMode==='type'){\n";
const end="      }else{\n        pick.textContent='🎨 GENRE'";
const a=html.indexOf(start);
const b=a<0?-1:html.indexOf(end,a+start.length);
if(a<0||b<0) throw new Error('TYPE BEAT branch not found');

const branch=`      }else if(beatMode==='type'){\n        pick.textContent='👤 '+selectedArtist;beatBody.innerHTML=\`<div class="lead"><small>TYPE BEAT</small><b>\${selectedArtist}</b><span>\${selectedArtist} type beat 2026</span></div><div class="artistGrid">\${ARTISTS.map(([n,e])=>\`<button class="artistBtn\${n===selectedArtist?' on':''}" data-artist="\${n}">\${e} \${n}</button>\`).join('')}</div><div class="candidateHead"><span>▶ IN BARZ</span><b data-candidate-count>—</b></div><div class="candidateList" data-candidate-slot></div><div class="toolRow candidateFallback compact" data-fallback><button class="toolBtn primary" data-action="search">↗ 他も探す</button><button class="toolBtn" data-action="clip">📋 URL読込</button></div>\`;if(findBeat)findBeat.href=yt(\`\${selectedArtist} type beat 2026\`);setTimeout(loadTypeCandidates,0);\n`;

html=html.slice(0,a)+branch+html.slice(b);

if(!html.includes('<div class="candidateList" data-candidate-slot></div>')) throw new Error('candidate slot not inserted');
if(!html.includes('setTimeout(loadTypeCandidates,0)')) throw new Error('candidate loader not wired');
fs.writeFileSync(file,html);
console.log('Fixed Barz TYPE BEAT candidate cards');
