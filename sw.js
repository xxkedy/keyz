const C = 'keyz-v13-deeplink-20260907';
const ASSETS = ['./', './index.html', './manifest.json?v=20260903-1', './icon-192.png?v=20260718-3', './icon-512.png?v=20260718-3'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('keyz-') && k !== C).map(k => caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url=new URL(e.request.url),root=new URL(self.registration.scope);
  if(e.request.method!=='GET'||url.origin!==root.origin)return;
  // Other apps have independent caches and service workers.
  if(!ASSETS.some(path=>new URL(path,root).pathname===url.pathname))return;
  e.respondWith(caches.open(C).then(async cache=>{
    const hit=await cache.match(e.request,{ignoreSearch:e.request.mode==='navigate'});
    return hit||fetch(e.request);
  }));
});
