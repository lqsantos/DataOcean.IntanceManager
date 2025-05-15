import { environmentsHandlers } from './environments';
import { locationsHandlers } from './locations';
// Import other handlers here

// Combine all handlers into a single array
export const handlers = [
  ...environmentsHandlers,
  ...locationsHandlers,
  // Add other handlers here
];
