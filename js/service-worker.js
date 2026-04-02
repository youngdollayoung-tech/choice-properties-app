/**
 * Choice Properties - Service Worker
 * Purpose: Offline support, caching strategy, background sync
 * Version: 1.0.0
 */

const CACHE_NAME = 'choice-properties-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/script.js',
  '/js/security.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'
];

/**
 * Install event - cache essential assets
 */
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching core assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

/**
 * Fetch event - serve from cache, fallback to network
 * Strategy: Cache First for assets, Network First for API calls
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Network First for API calls (forms submission, etc)
  if (url.pathname.includes('/macros/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Cache First for static assets
  event.respondWith(cacheFirst(request));
});

/**
 * Cache First Strategy: Try cache first, fallback to network
 */
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  if (cached) {
    console.log('[Service Worker] Serving from cache:', request.url);
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('[Service Worker] Fetch failed:', request.url, error);
    // Return offline page for HTML requests
    if (request.destination === 'document') {
      return caches.match('/index.html');
    }
    // Return generic error response
    return new Response('Offline - Resource not available', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

/**
 * Network First Strategy: Try network first, fallback to cache
 */
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('[Service Worker] Network unavailable, checking cache:', request.url);
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    // Return offline error response
    return new Response(
      JSON.stringify({
        success: false,
        error: 'You are offline. Please check your connection and try again.',
        offline: true
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Background Sync - retry form submissions when back online
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-form-submission') {
    console.log('[Service Worker] Background sync - form submission');
    event.waitUntil(retrySubmission());
  }
});

async function retrySubmission() {
  try {
    // Get queued submission from IndexedDB or localStorage
    const queued = localStorage.getItem('queued_submission');
    if (!queued) return;

    const submission = JSON.parse(queued);
    const response = await fetch(submission.url, {
      method: 'POST',
      body: submission.data
    });

    if (response.ok) {
      localStorage.removeItem('queued_submission');
      // Notify clients of successful submission
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'SUBMISSION_SYNCED',
          data: await response.json()
        });
      });
    }
  } catch (error) {
    console.error('[Service Worker] Background sync failed:', error);
  }
}

/**
 * Handle push notifications for application status updates
 */
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {
    title: 'Choice Properties Update',
    body: 'Your application status has been updated'
  };

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'app-notification',
      requireInteraction: false
    })
  );
});

/**
 * Handle notification clicks
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (let i = 0; i < clientList.length; i++) {
        if (clientList[i].url === '/' && 'focus' in clientList[i]) {
          return clientList[i].focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
