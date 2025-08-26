// Service Worker for Daily Planner PWA
const CACHE_NAME = 'daily-planner-v1.0.0';
const STATIC_CACHE = 'daily-planner-static-v1';
const DYNAMIC_CACHE = 'daily-planner-dynamic-v1';

// Files to cache for offline functionality
const STATIC_FILES = [
    './',
    './index.html',
    './styles/main.css',
    './js/app.js',
    './js/storage.js',
    './js/quotes.js',
    './js/game.js',
    './js/notes.js',
    './js/alarms.js',
    './js/wishes.js',
    './manifest.json'
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
    console.log('[SW] Installing service worker...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            console.log('[SW] Caching static files');
            return cache.addAll(STATIC_FILES.map(url => new Request(url, { cache: 'reload' })));
        }).catch((error) => {
            console.error('[SW] Failed to cache static files:', error);
        })
    );
    
    // Skip waiting to activate immediately
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating service worker...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[SW] Service worker activated');
            return self.clients.claim();
        })
    );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
    const { request } = event;
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip requests to other origins
    if (!request.url.startsWith(self.location.origin)) {
        return;
    }
    
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
                console.log('[SW] Serving from cache:', request.url);
                return cachedResponse;
            }
            
            // If not in cache, fetch from network
            return fetch(request).then((response) => {
                // Don't cache non-successful responses
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }
                
                // Clone the response as it can only be read once
                const responseToCache = response.clone();
                
                // Cache dynamic resources
                caches.open(DYNAMIC_CACHE).then((cache) => {
                    cache.put(request, responseToCache);
                });
                
                return response;
            }).catch((error) => {
                console.log('[SW] Fetch failed, serving offline fallback:', error);
                
                // Return a custom offline page for navigation requests
                if (request.destination === 'document') {
                    return caches.match('./index.html');
                }
                
                throw error;
            });
        })
    );
});

// Background sync for notifications
self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync triggered:', event.tag);
    
    if (event.tag === 'check-alarms') {
        event.waitUntil(checkAlarmsInBackground());
    }
    
    if (event.tag === 'backup-data') {
        event.waitUntil(backupDataInBackground());
    }
});

// Push notification event
self.addEventListener('push', (event) => {
    console.log('[SW] Push notification received');
    
    let notificationData = {
        title: 'Daily Planner',
        body: 'You have a reminder!',
        icon: './assets/icon-192.png',
        badge: './assets/icon-96.png',
        tag: 'daily-reminder',
        requireInteraction: true,
        actions: [
            {
                action: 'view',
                title: 'View',
                icon: './assets/action-view.png'
            },
            {
                action: 'dismiss',
                title: 'Dismiss',
                icon: './assets/action-dismiss.png'
            }
        ]
    };
    
    if (event.data) {
        try {
            const pushData = event.data.json();
            notificationData = { ...notificationData, ...pushData };
        } catch (error) {
            console.error('[SW] Error parsing push data:', error);
        }
    }
    
    event.waitUntil(
        self.registration.showNotification(notificationData.title, notificationData)
    );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification clicked:', event.action);
    
    event.notification.close();
    
    if (event.action === 'view') {
        event.waitUntil(
            clients.openWindow('./')
        );
    } else if (event.action === 'dismiss') {
        // Just close the notification
        return;
    } else {
        // Default action - open the app
        event.waitUntil(
            clients.matchAll({ type: 'window' }).then((clients) => {
                if (clients.length > 0) {
                    return clients[0].focus();
                } else {
                    return clients.openWindow('./');
                }
            })
        );
    }
});

// Message event - communication with main app
self.addEventListener('message', (event) => {
    console.log('[SW] Message received:', event.data);
    
    if (event.data && event.data.type) {
        switch (event.data.type) {
            case 'SKIP_WAITING':
                self.skipWaiting();
                break;
                
            case 'GET_VERSION':
                event.ports[0].postMessage({ version: CACHE_NAME });
                break;
                
            case 'CLEAR_CACHE':
                clearAllCaches().then(() => {
                    event.ports[0].postMessage({ success: true });
                });
                break;
                
            case 'SCHEDULE_ALARM':
                scheduleAlarmNotification(event.data.alarm);
                break;
                
            default:
                console.log('[SW] Unknown message type:', event.data.type);
        }
    }
});

// Background alarm checking
async function checkAlarmsInBackground() {
    try {
        // This would typically check with the main app's storage
        // For now, we'll just log that the background sync occurred
        console.log('[SW] Checking alarms in background...');
        
        // In a real implementation, we would:
        // 1. Access the stored alarms
        // 2. Check if any are due
        // 3. Show notifications for due alarms
        
        return Promise.resolve();
    } catch (error) {
        console.error('[SW] Error checking alarms in background:', error);
        throw error;
    }
}

// Background data backup
async function backupDataInBackground() {
    try {
        console.log('[SW] Backing up data in background...');
        
        // In a real implementation, we would:
        // 1. Access the stored data
        // 2. Sync with a cloud service or export locally
        // 3. Update backup timestamp
        
        return Promise.resolve();
    } catch (error) {
        console.error('[SW] Error backing up data:', error);
        throw error;
    }
}

// Schedule alarm notification
function scheduleAlarmNotification(alarm) {
    if (!alarm || !alarm.datetime) return;
    
    const alarmTime = new Date(alarm.datetime).getTime();
    const now = Date.now();
    const timeUntilAlarm = alarmTime - now;
    
    if (timeUntilAlarm > 0) {
        setTimeout(() => {
            self.registration.showNotification(alarm.title || 'Reminder', {
                body: alarm.note || 'Time for your scheduled reminder!',
                icon: './assets/icon-192.png',
                badge: './assets/icon-96.png',
                tag: `alarm-${alarm.id}`,
                requireInteraction: true,
                actions: [
                    { action: 'view', title: 'View' },
                    { action: 'snooze', title: 'Snooze 10 min' }
                ]
            });
        }, timeUntilAlarm);
    }
}

// Clear all caches
async function clearAllCaches() {
    try {
        const cacheNames = await caches.keys();
        await Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log('[SW] All caches cleared');
    } catch (error) {
        console.error('[SW] Error clearing caches:', error);
        throw error;
    }
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
    console.log('[SW] Periodic sync triggered:', event.tag);
    
    if (event.tag === 'check-alarms-periodic') {
        event.waitUntil(checkAlarmsInBackground());
    }
});

// Handle app updates
self.addEventListener('online', () => {
    console.log('[SW] App is online');
    // Could trigger data sync here
});

self.addEventListener('offline', () => {
    console.log('[SW] App is offline');
    // Could show offline indicator here
});

// Utility function to broadcast messages to all clients
function broadcastToClients(message) {
    self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
            client.postMessage(message);
        });
    });
}

// Cache management utilities
const CacheManager = {
    // Add resource to cache
    addToCache: async (cacheName, request, response) => {
        const cache = await caches.open(cacheName);
        return cache.put(request, response);
    },
    
    // Remove resource from cache
    removeFromCache: async (cacheName, request) => {
        const cache = await caches.open(cacheName);
        return cache.delete(request);
    },
    
    // Get cache size
    getCacheSize: async (cacheName) => {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        return keys.length;
    },
    
    // Clean old entries from dynamic cache
    cleanDynamicCache: async (maxEntries = 50) => {
        const cache = await caches.open(DYNAMIC_CACHE);
        const keys = await cache.keys();
        
        if (keys.length > maxEntries) {
            const keysToDelete = keys.slice(0, keys.length - maxEntries);
            await Promise.all(
                keysToDelete.map(key => cache.delete(key))
            );
        }
    }
};

// Periodic cache cleanup
setInterval(() => {
    CacheManager.cleanDynamicCache();
}, 60 * 60 * 1000); // Every hour

console.log('[SW] Service worker script loaded');