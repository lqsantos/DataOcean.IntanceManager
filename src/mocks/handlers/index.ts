// src/mocks/handlers/index.ts
// Importing all handlers for MSW
import { applicationHandlers } from './application-handlers';
import { blueprintHandlers } from './blueprint-handlers';
import { clusterHandlers } from './clusters';
import { environmentHandlers } from './environment-handlers';
import { gitHandlers } from './git-handlers';
import { gitSourceHandlers } from './git-source-handlers';
import { locationHandlers } from './location-handlers';
import { patHandlers } from './pat';
import { templateHandlers } from './template-handlers';

export const handlers = [
  ...applicationHandlers,
  ...blueprintHandlers,
  ...environmentHandlers,
  ...locationHandlers,
  ...clusterHandlers,
  ...patHandlers,
  ...gitSourceHandlers,
  ...templateHandlers,
  ...gitHandlers,
];
