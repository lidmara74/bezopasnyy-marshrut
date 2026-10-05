(() => {
  'use strict';
  // The hosted game works in a browser; the service worker is only an optional cache.
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    navigator.serviceWorker.register('./sw.js').catch(error => {
      console.warn('Offline cache unavailable:', error);
    });
  }
})();
