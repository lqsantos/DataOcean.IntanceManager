// src/mocks/handlers/index.ts
import { environmentHandlers } from './environment-handlers';
import { handlers as locationHandlers } from './locations';

export const handlers = [...environmentHandlers, ...locationHandlers];
