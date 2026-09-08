const CACHE='appz-v11.1-20260908';
const LOCAL=['./','./index.html','./manifest.json?v=20260908-1','./icon-180.png?v=20260729-1','./icon-192.png?v=20260729-1','./icon-512.png?v=20260729-1'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(LOCAL.map(url=>new Request(url,{cache:'reload'})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('appz-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url),scope=new URL(self.registration.scope);
  if(event.request.method!=='GET'||url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname))return;
  event.respondWith(fetch(event.request,{cache:'reload'}).then(response=>{
    if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(event.request,copy)))}
    return response;
  }).catch(async()=>{
    const cache=await caches.open(CACHE);
    return await cache.match(event.request)||(event.request.mode==='navigate'?await cache.match('./'):null)||Response.error();
  }));
});
