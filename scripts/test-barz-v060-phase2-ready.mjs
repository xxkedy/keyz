import fs from 'node:fs';
import vm from 'node:vm';

const html=fs.readFileSync('barz/index.html','utf8');
const checks=[
  ['one-screen READY shell',/class="readyShell"/],
  ['FOR YOU default copy',/>FOR YOU</],
  ['HOT default copy',/id="readyMode">HOT</],
  ['large GO control',/class="goHero" id="quickRapBtn"/],
  ['compact menu',/id="menuButton"[^>]*>•••</],
  ['four-item secondary menu',/🎙 Sessions[\s\S]*🔥 Builds[\s\S]*🎧 Beats[\s\S]*⚙️ Settings/],
  ['review entry',/id="reviewButton"/],
  ['manual genre pin flag',/GENRE_PIN_KEY='barz_genre_pinned_v1'/],
  ['legacy DB name retained',/DB_NAME='barz_db_v1'/],
  ['IndexedDB v2 retained',/DB_VERSION=2/],
  ['legacy sessions store retained',/STORE='sessions'/],
  ['new v2 stores retained',/TAKE_STORE='takes',RECOVERY_STORE='recovery',OUTBOX_STORE='outbox'/],
];
for(const [name,re] of checks){if(!re.test(html))throw new Error(`FAIL: ${name}`);console.log(`PASS: ${name}`)}
if(/id="time"|class="clock"/.test(html))throw new Error('FAIL: large clock remains in READY markup');
if(!/body\{max-width:none;padding:0;overflow:hidden\}/.test(html))throw new Error('FAIL: READY overflow guard missing');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
const dup=ids.filter((id,i)=>ids.indexOf(id)!==i);
if(dup.length)throw new Error(`FAIL: duplicate ids: ${[...new Set(dup)].join(', ')}`);
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(m=>m[1]).filter(Boolean);
for(const code of scripts)new vm.Script(code,{filename:'barz-inline.js'});
console.log(`PASS: inline JS syntax (${scripts.length} block)`);
console.log(`PASS: unique ids (${ids.length})`);
