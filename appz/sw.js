const CACHE='appz-v9.4';
const VISUAL='./v94-visual.js?v=9.4.0';
const LOCAL=['./','./index.html','./manifest.json?v=20260806-1','./icon-180.png?v=20260729-1','./icon-192.png?v=20260729-1','./icon-512.png?v=20260729-1',VISUAL];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(LOCAL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('appz-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
async function patched(response){
  if(!response)return response;
  const text=await response.text();
  const tag='<script src="'+VISUAL+'"></script>';
  const body=text.includes('v94-visual.js')?text:text.replace('</body>',tag+'</body>');
  const headers=new Headers(response.headers);headers.set('content-type','text/html; charset=utf-8');
  return new Response(body,{status:response.status,statusText:response.statusText,headers});
}
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);if(url.origin!==location.origin)return;
  if(event.request.mode==='navigate'){
    event.respondWith(fetch(event.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put('./index.html',copy));return patched(r)}).catch(()=>caches.match('./index.html').then(patched)));
    return;
  }
  event.respondWith(fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response}).catch(()=>caches.match(event.request).then(hit=>hit||caches.match('./'))));
});
