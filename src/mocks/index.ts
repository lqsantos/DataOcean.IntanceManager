async function initMocks() {
  if (process.env.NODE_ENV === 'development') {
    if (typeof window === 'undefined') {
      const { server } = await import('./server');
      server.listen();
    } else {
      const { worker } = await import('./browser');
      await worker.start({
        serviceWorker: {
          url: '/mockServiceWorker.js',
        },
        onUnhandledRequest: 'bypass',
      });
      console.log('🔶 Mock Service Worker inicializado');
    }
  }
}

export default initMocks;
