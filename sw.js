/* Mis Finanzas: funciona sin conexión. La app se guarda en el teléfono y se actualiza sola cuando hay internet.
   Tus datos NO pasan por aquí: viven en el almacenamiento del teléfono. */
const V='mf-v11';
const BASE=['./','index.html','manifest.webmanifest','icon-180.png','icon-192.png','icon-512.png','assets/fuentes.css','assets/chart.umd.min.js'];
const CDN=[];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(BASE).then(()=>Promise.all(CDN.map(u=>fetch(u,{mode:'no-cors'}).then(r=>c.put(u,r)).catch(()=>{}))))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.origin===location.origin&&u.pathname.endsWith('/tasa.json')){ /* la tasa del BCV: siempre primero internet; nunca se guarda un error */
    e.respondWith(fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(V).then(c=>c.put('tasa.json',cp));return res}return caches.match('tasa.json').then(m=>m||res)}).catch(()=>caches.match('tasa.json').then(m=>m||new Response('{}',{status:504}))));return;
  }
  if(r.mode==='navigate'){ /* la app: primero internet; sin señal o si tarda más de 5 s, la guardada */
    e.respondWith(new Promise(ok=>{let listo=false;const da=x=>{if(!listo){listo=true;ok(x)}};const g=()=>caches.match('index.html');
      const t=setTimeout(()=>g().then(m=>{if(m)da(m)}),5000);
      fetch(r).then(res=>{clearTimeout(t);if(res.ok){const cp=res.clone();caches.open(V).then(c=>c.put('index.html',cp));da(res)}else g().then(m=>da(m||res))})
        .catch(()=>{clearTimeout(t);g().then(m=>da(m||new Response('Sin conexión',{status:504})))})}));
    return;
  }
  if(u.origin===location.origin||/fonts\.(googleapis|gstatic)\.com$|cdnjs\.cloudflare\.com$/.test(u.hostname)){
    e.respondWith(caches.match(r).then(m=>{
      const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}return res}).catch(()=>m);
      return m||net;
    }));
  }
});
