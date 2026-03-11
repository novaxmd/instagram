const CACHE_NAME = "instagram-downloader-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/style.css",
  "/manifest.json",
  "/pages/script.js",
  "/pages/logo.png",
  "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css",
  "https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css",
  "https://cdn.jsdelivr.net/npm/sweetalert2@11",
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
];

/* ===============================
   INSTALL – CACHE FILES
   =============================== */
self.addEventListener("install", event => {
  console.log("Service Worker: Installing...");
  self.skipWaiting(); // Force update immediately
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log("Service Worker: Caching files...");
        return cache.addAll(ASSETS);
      })
      .then(() => {
        console.log("Service Worker: All files cached successfully");
      })
      .catch(error => {
        console.error("Service Worker: Cache failed", error);
      })
  );
});

/* ===============================
   ACTIVATE – CLEAR OLD CACHE
   =============================== */
self.addEventListener("activate", event => {
  console.log("Service Worker: Activating...");
  
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log("Service Worker: Deleting old cache", key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      console.log("Service Worker: Ready to handle fetches");
      return self.clients.claim(); // Take control immediately
    })
  );
});

/* ===============================
   FETCH – NETWORK FIRST, CACHE FALLBACK
   =============================== */
self.addEventListener("fetch", event => {
  // Skip cross-origin requests for API
  if (event.request.url.includes('/api/')) {
    // Don't cache API requests
    return;
  }

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension requests
  if (event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Check if we received a valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        // Update cache with new response (background)
        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseToCache);
          })
          .catch(err => console.log("Cache put error:", err));

        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // If not in cache, return offline page or fallback
            if (event.request.url.includes('.html')) {
              return caches.match('/index.html');
            }
            return new Response('Offline', { status: 503 });
          });
      })
  );
});

/* ===============================
   MESSAGE HANDLING
   =============================== */
self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

/* ===============================
   BACKGROUND SYNC (Optional)
   =============================== */
self.addEventListener("sync", event => {
  if (event.tag === "sync-downloads") {
    console.log("Service Worker: Background sync triggered");
    // Handle background sync if needed
  }
});

/* ===============================
   PUSH NOTIFICATIONS (Optional)
   =============================== */
self.addEventListener("push", event => {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: "/pages/logo.png",
    badge: "/pages/logo.png",
    vibrate: [200, 100, 200],
    data: {
      url: data.url
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});
