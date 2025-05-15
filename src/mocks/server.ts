import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// This file configures the mock server for Node.js (SSR)
export const server = setupServer(...handlers);
