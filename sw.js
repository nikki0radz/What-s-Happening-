const CACHE='wh-december-v2';
const ROOT=new URL('./',self.location.href);
const FILES=['./','./index.html','./styles.css','./app.js','./data.js','./reminders.js','./manifest.webmanifest','./assets/icon.svg',...['cocoa','cookies','monkey','tea','mountain','lights','dog','people','plane','chocolate','poinsettia','maple','sweets','bacon','celebration','forest','cupcake','cards'].map(name=>`./assets/${name}.jpg`)];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('wh-december-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||new URL(event.request.url).origin!==ROOT.origin)return;
  event.respondWith(fetch(event.request).then(response=>{if(response.ok){const clone=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(event.request,clone)));}return response;}).catch(()=>caches.match(event.request).then(cached=>cached||new Response('Offline — open this page once while online.',{status:503}))));
});
self.addEventListener('notificationclick',event=>{
  event.notification.close();
  const id=event.notification.data?.id;
  if(!/^2026-12-(0[1-9]|[12]\d|3[01])$/.test(id||''))return;
  event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(async clients=>{
    const client=clients.find(item=>item.url.startsWith(ROOT.href));
    if(client){await client.focus();client.postMessage({type:'OPEN_DAY',id});}
    else await self.clients.openWindow(new URL(`./?day=${id}`,ROOT).href);
  }));
});
