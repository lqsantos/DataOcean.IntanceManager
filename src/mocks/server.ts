import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// Cria o mock server para rodar em ambiente de teste
export const server = setupServer(...handlers)
