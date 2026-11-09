/* Mis Finanzas: funciona sin conexión. La app se guarda en el teléfono y se actualiza sola cuando hay internet.
   Tus datos NO pasan por aquí: viven en el almacenamiento del teléfono. */
const V='mf-v1';
const BASE=['./','index.html','manifest.webmanifest','icon-180.png','icon-192.png','icon-512.png'];
const CDN=['https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(BASE).then(()=>Promise.all(CDN.map(u=>fetch(u,{mode:'no-cors'}).then(r=>c.put(u,r)).catch(()=>{}))))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(r.mode==='navigate'){
    e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(V).then(c=>c.put('index.html',cp));return res}).catch(()=>caches.match('index.html')));
    return;
  }
  if(u.origin===location.origin||/fonts\.(googleapis|gstatic)\.com$|cdnjs\.cloudflare\.com$/.test(u.hostname)){
    e.respondWith(caches.match(r).then(m=>{
      const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}return res}).catch(()=>m);
      return m||net;
    }));
  }
});
