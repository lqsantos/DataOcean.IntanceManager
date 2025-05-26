import { redirect } from 'next/navigation';
import { describe, expect, it, vi } from 'vitest';

import { render } from '@/tests/test-utils';

import SettingsPage from '../page';

// Mock the redirect function from next/navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

describe('SettingsPage', () => {
  it('redirects to the applications settings page', () => {
    render(<SettingsPage />);

    expect(redirect).toHaveBeenCalledWith('/settings/applications');
  });
});
