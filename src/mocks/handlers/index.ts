// src/mocks/handlers/index.ts
import { applicationHandlers } from './application-handlers';
import { clusterHandlers } from './clusters';
import { environmentHandlers } from './environment-handlers';
import { locationHandlers } from './location-handlers';

export const handlers = [
  ...applicationHandlers,
  ...environmentHandlers,
  ...locationHandlers,
  ...clusterHandlers,
];
