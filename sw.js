importScripts('./cache-files.js?v=wh-calendar-89fa9da8ae8b5511');
const CACHE=self.HAPPENING_VERSION;
const ROOT=new URL('./',self.location.href);
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(self.HAPPENING_FILES.map(file=>new Request(file,{cache:'reload'})))).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>(key.startsWith('wh-calendar-')||key.startsWith('wh-december-'))&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||new URL(event.request.url).origin!==ROOT.origin)return;
  event.respondWith(fetch(new Request(event.request,{cache:'reload'})).then(response=>{if(response.ok){const clone=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(event.request,clone)));}return response;}).catch(async()=>await caches.match(event.request)||new Response('Open this page once while online to make it available offline.',{status:503})));
});
self.addEventListener('notificationclick',event=>{
  event.notification.close();const id=event.notification.data?.id;
  if(typeof id!=='string'||!/^2026-(11|12)-\d{2}(:[a-z0-9-]+)?$/.test(id))return;
  event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(async clients=>{
    const client=clients.find(item=>item.url.startsWith(ROOT.href));
    if(client){await client.focus();client.postMessage({type:'OPEN_DAY',id});}
    else await self.clients.openWindow(new URL(`./?day=${encodeURIComponent(id)}`,ROOT).href);
  }));
});
