import fs from 'node:fs';

const FILE='barz/index.html';
let src=fs.readFileSync(FILE,'utf8');

function mustReplace(label,from,to){
  if(!src.includes(from)){
    if(src.includes(to)){console.log('already fixed:',label);return}
    throw new Error('Race-fix target not found: '+label)
  }
  src=src.replace(from,to);
  console.log('fixed:',label);
}

/* Earlier revisions could prepend recoveryWriteChain= again when this patch was rerun.
   Normalize that first so repeated CI runs are deterministic. */
src=src.replace(/(?:recoveryWriteChain=){2,}beginRecoveryDraft\(/g,'recoveryWriteChain=beginRecoveryDraft(');

mustReplace(
  'recovery write chain state',
  "let activeRecoveryId='',recoverySeq=0;",
  "let activeRecoveryId='',recoverySeq=0,recoveryWriteChain=Promise.resolve();"
);

mustReplace(
  'clear recovery only after durable delete',
  "async function clearActiveRecovery(){const id=activeRecoveryId;activeRecoveryId='';recoverySeq=0;if(id)await deleteRecoveryGroup(id)}",
  "async function clearActiveRecovery(){const id=activeRecoveryId;if(id)await deleteRecoveryGroup(id);activeRecoveryId='';recoverySeq=0;recoveryWriteChain=Promise.resolve()}"
);

mustReplace(
  'serialize MediaRecorder chunk writes',
  "mediaRecorder.ondataavailable=e=>{if(e.data&&e.data.size){chunks.push(e.data);stashRecoveryChunk(e.data).catch(()=>{if(storageState)storageState.textContent='SAVE RISK'})}};mediaRecorder.onstop=finalizeSession;",
  "mediaRecorder.ondataavailable=e=>{if(e.data&&e.data.size){chunks.push(e.data);recoveryWriteChain=recoveryWriteChain.then(()=>stashRecoveryChunk(e.data)).catch(()=>{if(storageState)storageState.textContent='SAVE RISK'})}};mediaRecorder.onstop=finalizeSession;"
);

const bareMeta="beginRecoveryDraft({mimeType:mime||mediaRecorder.mimeType,beatUrl:beatUrl.value.trim(),title:titleEl.value.trim()||autoTitle()}).catch(()=>{if(storageState)storageState.textContent='SAVE RISK'});mediaRecorder.start(1000);";
const chainedMeta="recoveryWriteChain="+bareMeta;
if(src.includes(chainedMeta))console.log('already fixed: serialize recovery meta before first chunk');
else mustReplace('serialize recovery meta before first chunk','\n'+bareMeta,'\n'+chainedMeta);

mustReplace(
  'wait for final chunk before recovery cleanup',
  "try{await putSession(item);await clearActiveRecovery().catch(()=>{});checkStoragePressure().catch(()=>{});markPending(item.id,false);",
  "try{await putSession(item);await recoveryWriteChain.catch(()=>{});await clearActiveRecovery().catch(()=>{});checkStoragePressure().catch(()=>{});markPending(item.id,false);"
);

const required=[
  'recoveryWriteChain=Promise.resolve()',
  'recoveryWriteChain=recoveryWriteChain.then(()=>stashRecoveryChunk(e.data))',
  'recoveryWriteChain=beginRecoveryDraft(',
  'await recoveryWriteChain.catch(()=>{});await clearActiveRecovery()'
];
for(const token of required)if(!src.includes(token))throw new Error('Race-fix verification failed: '+token);
if(src.includes('recoveryWriteChain=recoveryWriteChain=beginRecoveryDraft('))throw new Error('Duplicate recoveryWriteChain assignment remains');

const inlineScripts=[...src.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]).filter(x=>x.trim());
for(const js of inlineScripts)new Function(js);

fs.writeFileSync(FILE,src,'utf8');
console.log('Barz v0.6 Phase 1 recovery race fixed and syntax-checked.');
