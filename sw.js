/* 回線スピードテスト Service Worker
   - 自サイトのページだけをキャッシュし、オフラインでも画面と履歴(localStorage)を開けるようにする
   - 測定に使う外部CDNへの通信には一切介入しない */
var V="speedtest-v2",CORE=["./","./index.html"];
self.addEventListener("install",function(e){
  e.waitUntil(caches.open(V).then(function(c){
    return Promise.all(CORE.map(function(u){return c.add(u).catch(function(){})}));
  }).then(function(){return self.skipWaiting()}));
});
self.addEventListener("activate",function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){return k!==V}).map(function(k){return caches.delete(k)}));
  }).then(function(){return self.clients.claim()}));
});
self.addEventListener("fetch",function(e){
  var r=e.request;
  if(r.method!=="GET")return;
  if(new URL(r.url).origin!==self.location.origin)return;
  if(r.mode==="navigate"){
    e.respondWith(fetch(r).then(function(res){
      if(res&&res.ok){var cp=res.clone();caches.open(V).then(function(c){c.put("./",cp)})}
      return res;
    }).catch(function(){
      return caches.match("./").then(function(m){return m||caches.match("./index.html")});
    }));
    return;
  }
  e.respondWith(caches.match(r).then(function(m){
    var f=fetch(r).then(function(res){
      if(res&&res.ok){var cp=res.clone();caches.open(V).then(function(c){c.put(r,cp)})}
      return res;
    }).catch(function(){return m});
    return m||f;
  }));
});
self.addEventListener("notificationclick",function(e){
  e.notification.close();
  e.waitUntil(self.clients.matchAll({type:"window"}).then(function(cs){
    return cs.length?cs[0].focus():self.clients.openWindow("./");
  }));
});
