import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// This file configures the service worker for the browser
export const worker = setupWorker(...handlers);
