import fs from 'node:fs';

const FILE = 'barz/index.html';
let src = fs.readFileSync(FILE, 'utf8');

if (src.includes("const DB_VERSION=2,TAKE_STORE='takes',RECOVERY_STORE='recovery',OUTBOX_STORE='outbox'")) {
  console.log('Barz v0.6 Phase 1 storage patch already applied.');
  process.exit(0);
}

function mustReplace(label, pattern, replacement) {
  const before = src;
  src = src.replace(pattern, replacement);
  if (src === before) throw new Error('Patch target not found: ' + label);
  console.log('patched:', label);
}

const storageBlock = String.raw`const DB_VERSION=2,TAKE_STORE='takes',RECOVERY_STORE='recovery',OUTBOX_STORE='outbox';
let activeRecoveryId='',recoverySeq=0;
function ensureIndex(store,name,keyPath,opts){if(!store.indexNames.contains(name))store.createIndex(name,keyPath,opts||{})}
function openDb(){return new Promise((resolve,reject)=>{const req=indexedDB.open(DB_NAME,DB_VERSION);req.onupgradeneeded=()=>{const db=req.result,tx=req.transaction;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE,{keyPath:'id'});let takes=db.objectStoreNames.contains(TAKE_STORE)?tx.objectStore(TAKE_STORE):db.createObjectStore(TAKE_STORE,{keyPath:'id'});ensureIndex(takes,'sessionId','sessionId');ensureIndex(takes,'reviewStatus','reviewStatus');ensureIndex(takes,'createdAt','createdAt');let recovery=db.objectStoreNames.contains(RECOVERY_STORE)?tx.objectStore(RECOVERY_STORE):db.createObjectStore(RECOVERY_STORE,{keyPath:'id'});ensureIndex(recovery,'recoveryId','recoveryId');ensureIndex(recovery,'kind','kind');ensureIndex(recovery,'createdAt','createdAt');let outbox=db.objectStoreNames.contains(OUTBOX_STORE)?tx.objectStore(OUTBOX_STORE):db.createObjectStore(OUTBOX_STORE,{keyPath:'id'});ensureIndex(outbox,'status','status');ensureIndex(outbox,'type','type');ensureIndex(outbox,'nextRetryAt','nextRetryAt')};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);req.onblocked=()=>{if(storageState)storageState.textContent='DB UPDATE WAIT'}})}
function txRequest(storeName,mode,fn){return openDb().then(db=>new Promise((resolve,reject)=>{const tx=db.transaction(storeName,mode),store=tx.objectStore(storeName);let req;try{req=fn(store)}catch(e){db.close();reject(e);return}let result;req&&req.addEventListener&&req.addEventListener('success',()=>{result=req.result});tx.oncomplete=()=>{db.close();resolve(result)};tx.onerror=()=>{const e=tx.error;db.close();reject(e)};tx.onabort=()=>{const e=tx.error||new Error('IDB transaction aborted');db.close();reject(e)}}))}
async function putSession(item){return txRequest(STORE,'readwrite',s=>s.put(item))}
async function getSessions(){const rows=await txRequest(STORE,'readonly',s=>s.getAll());return(rows||[]).sort((a,b)=>b.createdAt-a.createdAt)}
async function deleteSession(id){return txRequest(STORE,'readwrite',s=>s.delete(id))}
async function putTake(item){return txRequest(TAKE_STORE,'readwrite',s=>s.put(item))}
async function getTake(id){return txRequest(TAKE_STORE,'readonly',s=>s.get(id))}
async function getTakes(){const rows=await txRequest(TAKE_STORE,'readonly',s=>s.getAll());return(rows||[]).sort((a,b)=>(b.createdAt||0)-(a.createdAt||0))}
async function deleteTake(id){return txRequest(TAKE_STORE,'readwrite',s=>s.delete(id))}
async function putRecoveryRecord(item){return txRequest(RECOVERY_STORE,'readwrite',s=>s.put(item))}
async function getRecoveryRecord(id){return txRequest(RECOVERY_STORE,'readonly',s=>s.get(id))}
async function getRecoveryRecords(){return(await txRequest(RECOVERY_STORE,'readonly',s=>s.getAll()))||[]}
async function deleteRecoveryGroup(recoveryId){const db=await openDb();return new Promise((resolve,reject)=>{const tx=db.transaction(RECOVERY_STORE,'readwrite'),store=tx.objectStore(RECOVERY_STORE),idx=store.index('recoveryId'),req=idx.openCursor(IDBKeyRange.only(recoveryId));req.onsuccess=()=>{const c=req.result;if(c){c.delete();c.continue()}};tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>{const e=tx.error;db.close();reject(e)}})}
function recoverySnapshot(){return{updatedAt:Date.now(),beatUrl:beatUrl.value.trim(),beatStartAt:Number(beatStartAt)||0,markers:markers.map(x=>({...x})),transportTimeline:transportTimeline.map(x=>({...x})),promptTimeline:promptTimeline.map(x=>({...x,related:(x.related||[]).slice()})),lyrics:lyricsEl.value}}
async function patchRecoveryMeta(){if(!activeRecoveryId)return;const id='meta:'+activeRecoveryId,old=await getRecoveryRecord(id);if(!old)return;await putRecoveryRecord(Object.assign({},old,recoverySnapshot()))}
async function beginRecoveryDraft(seed){activeRecoveryId='r'+Date.now().toString(36)+Math.random().toString(36).slice(2,8);recoverySeq=0;const now=Date.now();await putRecoveryRecord({id:'meta:'+activeRecoveryId,kind:'meta',recoveryId:activeRecoveryId,createdAt:now,updatedAt:now,mimeType:String(seed&&seed.mimeType||''),beatUrl:String(seed&&seed.beatUrl||''),title:String(seed&&seed.title||''),beatStartAt:readBeatTime(),markers:[],transportTimeline:[],promptTimeline:[],lyrics:''});return activeRecoveryId}
async function stashRecoveryChunk(blob){if(!activeRecoveryId||!blob||!blob.size)return;const seq=++recoverySeq,now=Date.now();await putRecoveryRecord({id:'chunk:'+activeRecoveryId+':'+String(seq).padStart(6,'0'),kind:'chunk',recoveryId:activeRecoveryId,seq,createdAt:now,blob});await patchRecoveryMeta().catch(()=>{})}
async function clearActiveRecovery(){const id=activeRecoveryId;activeRecoveryId='';recoverySeq=0;if(id)await deleteRecoveryGroup(id)}
async function recoverPendingTakes(){const rows=await getRecoveryRecords(),groups=new Map();rows.forEach(r=>{if(!r||!r.recoveryId)return;if(!groups.has(r.recoveryId))groups.set(r.recoveryId,[]);groups.get(r.recoveryId).push(r)});let recovered=0;for(const [rid,items] of groups){const meta=items.find(x=>x.kind==='meta')||{},cs=items.filter(x=>x.kind==='chunk'&&x.blob&&x.blob.size).sort((a,b)=>(a.seq||0)-(b.seq||0));if(!cs.length){await deleteRecoveryGroup(rid).catch(()=>{});continue}const type=meta.mimeType||cs[0].blob.type||'audio/webm',audio=new Blob(cs.map(x=>x.blob),{type}),id='take-recovered-'+rid;if(!(await getTake(id))){const last=cs[cs.length-1],duration=Math.max(0,((last.createdAt||Date.now())-(meta.createdAt||last.createdAt||Date.now()))/1000);await putTake({id,sessionId:'recovered-'+rid,seq:1,createdAt:meta.createdAt||Date.now(),updatedAt:Date.now(),audio,mimeType:type,duration,beatUrl:meta.beatUrl||'',beatStartAt:Number(meta.beatStartAt)||0,beatInfo:{videoId:parseYouTubeId(meta.beatUrl||''),url:meta.beatUrl||'',title:'',channel:'',genre:typeof genre==='string'?genre:'',mode:radio&&radio.mode||''},markers:Array.isArray(meta.markers)?meta.markers:[],transportTimeline:Array.isArray(meta.transportTimeline)?meta.transportTimeline:[],promptTimeline:Array.isArray(meta.promptTimeline)?meta.promptTimeline:[],rawTranscript:meta.lyrics||'',transcriptSegments:[],editedLyrics:meta.lyrics||'',reviewStatus:'UNREVIEWED',recovered:true})}await deleteRecoveryGroup(rid).catch(()=>{});recovered++}return recovered}
async function enqueueOutbox(type,entityId,payload){const id=String(type)+':'+String(entityId),old=await txRequest(OUTBOX_STORE,'readonly',s=>s.get(id));const now=Date.now();return txRequest(OUTBOX_STORE,'readwrite',s=>s.put(Object.assign({id,type:String(type),entityId:String(entityId),status:'PENDING',attempt:0,nextRetryAt:now,payload:payload||{},createdAt:now,updatedAt:now},old||{},{status:'PENDING',nextRetryAt:now,payload:payload||old?.payload||{},updatedAt:now})))}
async function getOutbox(){return(await txRequest(OUTBOX_STORE,'readonly',s=>s.getAll()))||[]}
async function markTakeDropPending(id){const t=await getTake(id);if(!t)return false;t.reviewStatus='DROP_PENDING';t.dropAfter=Date.now()+5000;t.updatedAt=Date.now();await putTake(t);setTimeout(()=>finalizeExpiredDrops().catch(()=>{}),5100);return true}
async function undoTakeDrop(id){const t=await getTake(id);if(!t||t.reviewStatus!=='DROP_PENDING')return false;t.reviewStatus='UNREVIEWED';delete t.dropAfter;t.updatedAt=Date.now();await putTake(t);return true}
async function finalizeExpiredDrops(){const now=Date.now(),rows=await getTakes();for(const t of rows){if(t.reviewStatus==='DROP_PENDING'&&Number(t.dropAfter||0)<=now)await deleteTake(t.id)}return true}
async function checkStoragePressure(){if(!(navigator.storage&&navigator.storage.estimate))return null;const e=await navigator.storage.estimate(),usage=Number(e.usage)||0,quota=Number(e.quota)||0,ratio=quota?usage/quota:0;if(ratio>=.85&&storageState)storageState.textContent='STORAGE LOW · '+Math.round(ratio*100)+'%';return{usage,quota,ratio}}
window.BarzStorageV2={openDb,putTake,getTake,getTakes,deleteTake,recoverPendingTakes,enqueueOutbox,getOutbox,markTakeDropPending,undoTakeDrop,finalizeExpiredDrops,checkStoragePressure};`;

mustReplace(
  'IndexedDB v2 foundation',
  /function openDb\(\)\{[\s\S]*?async function deleteSession\(id\)\{[\s\S]*?\}\r?\nfunction chooseMime/,
  storageBlock + '\nfunction chooseMime'
);

mustReplace(
  'MediaRecorder chunk recovery hook',
  /mediaRecorder\.ondataavailable=e=>\{if\(e\.data&&e\.data\.size\)chunks\.push\(e\.data\)\};mediaRecorder\.onstop=finalizeSession;/,
  "mediaRecorder.ondataavailable=e=>{if(e.data&&e.data.size){chunks.push(e.data);stashRecoveryChunk(e.data).catch(()=>{if(storageState)storageState.textContent='SAVE RISK'})}};mediaRecorder.onstop=finalizeSession;"
);

mustReplace(
  'Recovery draft start',
  /mediaRecorder\.start\(1000\);startedAt=Date\.now\(\);/,
  "beginRecoveryDraft({mimeType:mime||mediaRecorder.mimeType,beatUrl:beatUrl.value.trim(),title:titleEl.value.trim()||autoTitle()}).catch(()=>{if(storageState)storageState.textContent='SAVE RISK'});mediaRecorder.start(1000);startedAt=Date.now();"
);

mustReplace(
  'Clear recovery after durable legacy save',
  /try\{await putSession\(item\);markPending\(item\.id,false\);/,
  "try{await putSession(item);await clearActiveRecovery().catch(()=>{});checkStoragePressure().catch(()=>{});markPending(item.id,false);"
);

mustReplace(
  'Startup recovery scan and storage checks',
  /restoreDraft\(\);loadSessions\(\);\r?\n\}\)\(\);/,
  "restoreDraft();loadSessions();recoverPendingTakes().then(n=>{if(n&&storageState)storageState.textContent='RECOVERED TAKE · '+n}).catch(()=>{});checkStoragePressure().catch(()=>{});finalizeExpiredDrops().catch(()=>{});\n})();"
);

const required = [
  "indexedDB.open(DB_NAME,DB_VERSION)",
  "TAKE_STORE='takes'",
  "RECOVERY_STORE='recovery'",
  "OUTBOX_STORE='outbox'",
  'stashRecoveryChunk(e.data)',
  'recoverPendingTakes()',
  'markTakeDropPending',
  'checkStoragePressure'
];
for (const token of required) {
  if (!src.includes(token)) throw new Error('Static verification failed: ' + token);
}
if (src.includes('indexedDB.open(DB_NAME,1)')) throw new Error('Old DB version 1 opener still present');

const inlineScripts = [...src.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]).filter(x=>x.trim());
for (const js of inlineScripts) new Function(js);

fs.writeFileSync(FILE, src, 'utf8');
console.log('Barz v0.6 Phase 1 storage foundation patched and syntax-checked.');
