/* Offline-first service worker */
const CACHE_NAME = "friendsy-data-words-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./app.js",
  "./styles.css",
  "./assets/icons/icon-64.png",
  "./assets/icons/icon-128.png",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-256.png",
  "./assets/icons/icon-384.png",
  "./assets/icons/icon-512.png"
];

self.addEventListener("install", e=>{
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)));
});

self.addEventListener("activate", e=>{
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE_NAME ? caches.delete(k) : null)))
  );
});

self.addEventListener("fetch", e=>{
  const url = new URL(e.request.url);
  if (url.origin === location.origin) {
    e.respondWith(
      caches.match(e.request).then(res => res || fetch(e.request).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, copy));
        return resp;
      }).catch(()=>caches.match("./index.html")))
    );
  } else {
    e.respondWith(fetch(e.request));
  }
});
