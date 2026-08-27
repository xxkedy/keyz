import fs from 'node:fs';
import vm from 'node:vm';
import { indexedDB, IDBKeyRange } from 'fake-indexeddb';

const html=fs.readFileSync('barz/index.html','utf8');
const marker="const DB_VERSION=2,TAKE_STORE='takes',RECOVERY_STORE='recovery',OUTBOX_STORE='outbox';";
const start=html.indexOf(marker),end=html.indexOf('function chooseMime',start);
if(start<0||end<0)throw new Error('Storage v2 block not found');
const code=html.slice(start,end);

function idbOpen(name,version,onUpgrade){return new Promise((resolve,reject)=>{const req=indexedDB.open(name,version);req.onupgradeneeded=()=>onUpgrade&&onUpgrade(req.result,req.transaction);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
function txDone(tx){return new Promise((resolve,reject)=>{tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('tx abort'))})}

const legacyDb=await idbOpen('barz_db_v1',1,(db)=>db.createObjectStore('sessions',{keyPath:'id'}));
{
  const tx=legacyDb.transaction('sessions','readwrite');
  tx.objectStore('sessions').put({id:101,createdAt:101,title:'legacy take',duration:3,beatUrl:'',audio:new Blob(['legacy-audio'],{type:'audio/webm'}),mimeType:'audio/webm'});
  await txDone(tx);
}
legacyDb.close();

const context={
  indexedDB,IDBKeyRange,Blob,Map,Promise,Date,Math,setTimeout,clearTimeout,console,
  DB_NAME:'barz_db_v1',STORE:'sessions',storageState:{textContent:''},
  beatUrl:{value:''},beatStartAt:0,markers:[],transportTimeline:[],promptTimeline:[],lyricsEl:{value:''},
  readBeatTime:()=>0,parseYouTubeId:()=>'',genre:'TRAP',radio:{mode:'HOT'},
  navigator:{storage:{estimate:async()=>({usage:100,quota:1000})}},window:{}
};
vm.createContext(context);
new vm.Script(code,{filename:'barz-storage-v2.js'}).runInContext(context);
const storage=context.window.BarzStorageV2;
if(!storage)throw new Error('BarzStorageV2 API missing');

const db2=await storage.openDb();
const stores=[...db2.objectStoreNames];
for(const name of ['sessions','takes','recovery','outbox'])if(!stores.includes(name))throw new Error('Missing store: '+name);
db2.close();

const legacy=await context.getSessions();
if(legacy.length!==1||legacy[0].id!==101||legacy[0].title!=='legacy take')throw new Error('Legacy session lost during v2 upgrade');

await storage.putTake({id:'take-normal',sessionId:'s1',seq:1,createdAt:200,reviewStatus:'UNREVIEWED',audio:new Blob(['new'],{type:'audio/webm'})});
if(!(await storage.getTake('take-normal')))throw new Error('takes store write/read failed');

await storage.enqueueOutbox('BUILD_UPLOAD','take-normal',{buildId:'b1'});
const outbox=await storage.getOutbox();
if(outbox.length!==1||outbox[0].entityId!=='take-normal'||outbox[0].status!=='PENDING')throw new Error('outbox queue failed');

const dbRecovery=await storage.openDb();
{
  const tx=dbRecovery.transaction('recovery','readwrite'),s=tx.objectStore('recovery');
  s.put({id:'meta:rtest',kind:'meta',recoveryId:'rtest',createdAt:1000,updatedAt:1000,mimeType:'audio/webm',beatUrl:'',title:'crashed',beatStartAt:0,markers:[{id:1,at:1}],transportTimeline:[],promptTimeline:[],lyrics:'recovered words'});
  s.put({id:'chunk:rtest:000001',kind:'chunk',recoveryId:'rtest',seq:1,createdAt:2000,blob:new Blob(['chunk-a'],{type:'audio/webm'})});
  s.put({id:'chunk:rtest:000002',kind:'chunk',recoveryId:'rtest',seq:2,createdAt:3000,blob:new Blob(['chunk-b'],{type:'audio/webm'})});
  await txDone(tx);
}
dbRecovery.close();

const recoveredCount=await storage.recoverPendingTakes();
if(recoveredCount!==1)throw new Error('Expected one recovered take');
const recovered=await storage.getTake('take-recovered-rtest');
if(!recovered||!recovered.recovered||recovered.reviewStatus!=='UNREVIEWED'||recovered.editedLyrics!=='recovered words')throw new Error('Recovered take data invalid');

if(!(await storage.markTakeDropPending('take-normal')))throw new Error('DROP pending failed');
let dropped=await storage.getTake('take-normal');
if(dropped.reviewStatus!=='DROP_PENDING')throw new Error('DROP pending status missing');
if(!(await storage.undoTakeDrop('take-normal')))throw new Error('DROP undo failed');
dropped=await storage.getTake('take-normal');
if(dropped.reviewStatus!=='UNREVIEWED')throw new Error('DROP undo did not restore take');

const pressure=await storage.checkStoragePressure();
if(!pressure||pressure.ratio!==0.1)throw new Error('Storage estimate failed');

console.log('PASS: legacy v1 preserved, v2 stores coexist, recovery creates RECOVERED TAKE, outbox and DROP undo work.');
