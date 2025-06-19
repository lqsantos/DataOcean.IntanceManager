/**
 * Utility functions for ID generation
 */

/**
 * Creates a random ID string
 * @returns string A random ID in the format 'xxxx-xxxx-xxxx' where x is an alphanumeric character
 */
export function createRandomId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 6);
  const secondRandomStr = Math.random().toString(36).substring(2, 6);

  return `${timestamp.slice(-4)}-${randomStr}-${secondRandomStr}`;
}
