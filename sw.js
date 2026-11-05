const CACHE_NAME = 'liga-bank-v1';

// Список файлов, которые кэшируются при первой загрузке
const ASSETS = [
    '/',
    '/index.html',
    '/profile.html',
    '/lib/style/reset.css',
    '/lib/style/style.css',
    '/lib/style/core/firebase-config.js',
    '/lib/style/core/app.js',
    '/lib/style/core/calc.js',
    '/lib/style/core/map.js',
    '/lib/style/core/signature.js',
    '/lib/style/core/offline.js'
    // Сюда можно добавить пути к картинкам и шрифтам, если нужно
];

// Установка Service Worker и кэширование файлов
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Кэширование файлов...');
            return cache.addAll(ASSETS);
        })
    );
});

// Активация и удаление старого кэша
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
});

// Перехват запросов
self.addEventListener('fetch', (e) => {
    // Не кэшируем запросы к Firebase API
    if (e.request.url.includes('firestore.googleapis.com') || e.request.url.includes('identitytoolkit')) {
        return;
    }

    e.respondWith(
        caches.match(e.request).then((cachedResponse) => {
            // Если файл есть в кэше — отдаём его, иначе грузим из сети
            return cachedResponse || fetch(e.request);
        })
    );
});