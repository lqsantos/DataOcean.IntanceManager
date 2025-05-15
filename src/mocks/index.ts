// This file serves as the entry point for mocks
// It will be conditionally imported in the application layout

async function initMocks() {
  if (typeof window === 'undefined') {
    // For server (Node.js)
    const { server } = await import('./server');
    server.listen();
  } else {
    // For browser
    const { worker } = await import('./browser');
    await worker.start({
      onUnhandledRequest: 'bypass', // Don't show warnings for unhandled requests
    });
  }

  console.log('[MSW] Mock Service Worker initialized');
}

export default initMocks;
