// Minimal service worker for installability
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
// App uses localStorage; fetches go straight to network by default.
