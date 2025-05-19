// src/mocks/handlers/index.ts
import { applicationHandlers } from './application-handlers';
import { clusterHandlers } from './clusters';
import { environmentHandlers } from './environment-handlers';
import { locationHandlers } from './location-handlers';
import { patHandlers } from './pat';

export const handlers = [
  ...applicationHandlers,
  ...environmentHandlers,
  ...locationHandlers,
  ...clusterHandlers,
  ...patHandlers,
];
