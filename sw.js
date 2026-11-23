const CACHE='quaderno-882cb21a';
const CORE=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE&&k!=='quaderno-state').map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.mode==='navigate'||u.pathname.endsWith('index.html')){
    // network first, so new words arrive; fall back to cache offline
    e.respondWith(fetch(e.request,{cache:'no-store'}).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c));return r;}).catch(()=>caches.match(e.request).then(r=>r||caches.match('index.html'))));
    return;
  }
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{ if(res.ok&&(u.origin===location.origin||u.host.includes('fonts.g'))){const c=res.clone();caches.open(CACHE).then(x=>x.put(e.request,c));} return res;})));
});
function dayNum(){ const d=new Date(); return Math.floor((d - d.getTimezoneOffset()*60000)/86400000); }
function dniv(n){ return n%10===1&&n%100!==11?'день':n%10>=2&&n%10<=4&&(n%100<12||n%100>14)?'дні':'днів'; }
self.addEventListener('push',e=>{
  e.waitUntil((async()=>{
    let days=[]; try{ const c=await caches.open('quaderno-state'); const r=await c.match('./state.json'); if(r) days=(await r.json()).days||[]; }catch(err){}
    const set=new Set(days), t=dayNum(), done=set.has(t);
    let d=done?t:t-1, n=0; while(set.has(d)){ n++; d--; }
    let title, body;
    if(done){ title='✅ Сьогодні вже зроблено'; body=`Серія ${n} ${dniv(n)} поспіль. Brava! Завтра продовжимо.`; }
    else if(n>0){ title=`🔥 Серія ${n} ${dniv(n)}: не загуби її`; body='5 хвилин італійської, і день зараховано.'; }
    else { title='🇮🇹 5 хвилин італійської?'; body='Кілька карток, і нова серія почалась.'; }
    await self.registration.showNotification(title,{body, icon:'icon-192.png', badge:'icon-192.png', tag:'quaderno-daily', silent:done});
  })());
});
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{ for(const c of cs){ if('focus' in c) return c.focus(); } return self.clients.openWindow('./'); }));
});
