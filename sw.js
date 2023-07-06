// Service Worker Version 0.1
const CACHE_NAME = "VERSION 1.1.0";

const assets = [
    "./",
    "./index.html",
    "./manifest.json",
    "./style.css",
    "./script.js",
    "./assests/model/model.json",
    "./assests/model/group1-shard1of1.bin",
    "./assests/icons/Bounding Box.png",
    "./assests/icons/close down.svg",
    "./assests/icons/images.svg",
    "./assests/icons/info_outline.svg",
    "./assests/icons/more.svg",
    "./assests/icons/search.svg",
    "./assests/favicons/512x512bb.jpg",
    "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@2.0.0/dist/tf.min.js"
]

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                cache.addAll(assets);
            })
    )
})

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys
                .filter(key => key !== CACHE_NAME)
                .map(key => caches.delete(key))
            );
        })
    )
})

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(res => res || fetch(event.request))
    )
})
