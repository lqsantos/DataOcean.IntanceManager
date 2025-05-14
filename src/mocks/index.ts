// Importa dinamicamente o MSW no navegador
if (typeof window !== 'undefined') {
  import('./browser').then(({ worker }) => {
    worker.start()
  })
}
