import { describe, expect, it, vi } from 'vitest';

import { render } from '@/tests/test-utils';

import SettingsPage from '../page';

// Mock the redirect function from next/navigation
const mockRedirect = vi.fn();

vi.mock('next/navigation', () => ({
  redirect: mockRedirect,
}));

describe('SettingsPage', () => {
  it('redirects to the applications settings page', () => {
    render(<SettingsPage />);

    expect(mockRedirect).toHaveBeenCalledWith('/settings/applications');
  });
});
