/**
 * @vitest-environment jsdom
 */

// First, we set up the mock before any imports
import { describe, expect, it, vi } from 'vitest';

// Mock next/navigation before importing the component
vi.mock('next/navigation', () => ({
  redirect: vi.fn()
}));

// Import the redirect function after the mock is set up
import { redirect } from 'next/navigation';

// Import the component after all mocks
import SettingsPage from '../page';

describe('SettingsPage', () => {
  it('redirects to the applications settings page', () => {
    // Clear mock before test
    vi.clearAllMocks();
    
    // Render the component (it will trigger the redirect)
    try {
      SettingsPage();
    } catch (e) {
      // The component might throw after redirect, which is fine for our test
    }
    
    // Check that redirect was called with the correct path
    expect(redirect).toHaveBeenCalledWith('/settings/applications');
  });
});
