// src/mocks/handlers/index.ts
import { environmentHandlers } from './environment-handlers';
import { locationHandlers } from './location-handlers';

export const handlers = [...environmentHandlers, ...locationHandlers];
