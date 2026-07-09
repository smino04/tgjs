// Network-first fetching so the home-screen app always shows the latest
// deployed version instead of a cached snapshot from when it was added.
var CACHE_NAME = "teukup-cache-v1";

self.addEventListener("install", function(e){
  self.skipWaiting();
});

self.addEventListener("activate", function(e){
  e.waitUntil((async function(){
    var keys = await caches.keys();
    await Promise.all(keys.filter(function(k){ return k !== CACHE_NAME; }).map(function(k){ return caches.delete(k); }));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", function(e){
  if(e.request.method !== "GET") return;
  e.respondWith((async function(){
    try{
      var fresh = await fetch(e.request, { cache: "no-store" });
      var cache = await caches.open(CACHE_NAME);
      cache.put(e.request, fresh.clone());
      return fresh;
    }catch(err){
      var cached = await caches.match(e.request);
      if(cached) return cached;
      throw err;
    }
  })());
});
