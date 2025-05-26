import { describe, expect, it, vi } from 'vitest';

// Define the redirect mock before importing any modules that use it
const mockRedirect = vi.fn();

// Define the mock for next/navigation BEFORE importing the component
vi.mock('next/navigation', () => ({
  redirect: mockRedirect,
}));

// Import the component AFTER all mocks are set up
import SettingsPage from '../page';

describe('SettingsPage', () => {
  it('redirects to the applications settings page', () => {
    // The component calls redirect immediately on instantiation
    new SettingsPage();

    // Check that the redirect was called with the correct path
    expect(mockRedirect).toHaveBeenCalledWith('/settings/applications');
  });
});
