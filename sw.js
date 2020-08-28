var CACHE_NAME = 'pwa-offline-v1';
var filesToCache = [
    '/',
    '/favicon.png',
    '/css/app.css',
    '/images/icons/192icon.png',
    '/images/icons/512icon.png'
];

/************************************************
 * 서비스 워커 설치
 * -> 서비스 워커가 브라우저에 등록된 후, 캐싱을 설치하는 것
 * -> CACHE_NAME : 캐싱 스토리지에 저장될 파일 이름
 * -> filesToCache : 캐싱할 웹 자원(css, 이미지등등)의 목록
 * -> self === window객체
 ************************************************/
self.addEventListener('install', function(event){
    // 캐시등록 또는 기타 로직 수행
    console.log('[Service Worker] Install');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache){
                // cache === 캐시가 열린 후 접근할 수 있는 변수 === 캐시파일
                // pwa 파일에 다 집어 넣어라
                return cache.addAll(filesToCache);
            })
            .catch(function(error){
                return console.error(error);
            })
    );
});

/************************************************
 * 서비스 워커 패치
 * -> 서비스워커 설치 후 캐시된 자원에 대한 네트워크 요청이 있을 때는 캐쉬로 돌려준다.
 * -> respondWith() : fetch 이벤트의 응답을 반환
 * -> match() : 해당 request에 상응하는 캐시가 있으면 찾아서 돌려주고 아니면 fetch()로 자원 획득
 ************************************************/
self.addEventListener('fetch', function(event){
    console.log('[Service Worker] Fetch');
    event.respondWith(
        // 해당 request와 맞는 cache가 있는지 판단
        caches.match(event.request)
            .then(function(response){
                return response || fetch(event.request);
            })
            .catch(function(error){
                return console.error(error);
            })
    );
});

/************************************************
 * 서비스 워커 활성화 및 업데이트
 * -> 새로운 서비스워커가 설치되면 활성화 단계로 넘어온다.
 * -> 이전에 사용하던 서비스워커와 캐시를 비운다
 * -> caches.keys() : 기존에 사용하던 캐시 목록 확인
 ************************************************/
self.addEventListener('activate', function(event){
    console.log('[Service Worker] Activate');
    var newCacheList = ['pwa-offline-v2'];
    event.waitUntil(
        caches.keys().then(function(cacheList){
            return Promise.all(
                cacheList.map(function(cacheName){
                    if (newCacheList.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).catch(function(error){
            return console.error(error);
        })
    );
});

/************************************************
 * 서비스 워커 라이프 사이클
 * -> 서비스워커는 웹페이지와 별개의 생명주기를 갖는다  
 ************************************************/

/************************************************
 * 서비스 워커 push 이벤트 리스너
 ************************************************/
self.addEventListener('push', function(event){
    console.log(1);
    const title = 'Push event';
    const options = {
        body: event.data ? event.data.text() : 'no payload',
        icon: 'images/icons/192icon.png'
    }
    event.waitUntil(
        setTimeout(function(){
            self.registration.showNotification(title, options)
        }, 3000)
        // self.registration.showNotification(title, options)
    );
})