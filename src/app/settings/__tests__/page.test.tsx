import { describe, expect, it, vi } from 'vitest';

// Define the vi.mock before any imports that use it
vi.mock('next/navigation', () => {
  // Define RedirectError inside the mock factory to avoid hoisting issues
  class RedirectError extends Error {
    constructor() {
      super('NEXT_REDIRECT');
      this.name = 'RedirectError';
    }
  }

  // Define mockRedirect inside the factory function
  const mockRedirect = vi.fn().mockImplementation(() => {
    throw new RedirectError();
  });

  return {
    redirect: mockRedirect,
  };
});

// Import the component after mocks are set up
import SettingsPage from '../page';

describe('SettingsPage', () => {
  it('redirects to the applications settings page', () => {
    // The redirect function is called during render, so we need to handle the error
    expect(() => {
      // We're not using render here because it will catch the error
      // Just instantiate the component directly
      new SettingsPage();
    }).toThrow('NEXT_REDIRECT');

    // Access the mocked function through the imported module
    const { redirect } = require('next/navigation');

    expect(redirect).toHaveBeenCalledWith('/settings/applications');
  });
});
