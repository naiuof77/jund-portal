// عامل خدمة بوابة جُنْد — وضع "الشبكة أولاً"
// يجلب دائماً النسخة الأحدث من الإنترنت، ويستخدم المخزّن فقط عند انقطاع الاتصال
var CACHE_NAME = 'jund-portal-v1';

self.addEventListener('install', function(e){
  self.skipWaiting(); // فعّل النسخة الجديدة فوراً بدون انتظار
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){
        if(k !== CACHE_NAME) return caches.delete(k); // نظّف الكاش القديم
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  // نتعامل فقط مع طلبات GET من نفس الموقع — Firebase وطلبات API تمر مباشرة
  if(e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  if(url.origin !== self.location.origin) return;

  e.respondWith(
    fetch(e.request).then(function(res){
      // نجح الاتصال: خزّن نسخة احتياطية وأرجع الأحدث
      var copy = res.clone();
      caches.open(CACHE_NAME).then(function(c){ c.put(e.request, copy); }).catch(function(){});
      return res;
    }).catch(function(){
      // انقطع الاتصال: استخدم النسخة المخزّنة
      return caches.match(e.request);
    })
  );
});
