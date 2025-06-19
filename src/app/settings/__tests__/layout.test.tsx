/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest';

import { render, screen } from '@/tests/test-utils';

// Import the SettingsLayout component
import SettingsLayout from '../layout';

describe('SettingsLayout', () => {
  it('renders the children content within a wrapper div', () => {
    render(
      <SettingsLayout>
        <div data-testid="test-content">Content</div>
      </SettingsLayout>
    );

    // Check if the wrapper div exists
    const wrapper = screen.getByTestId('test-content').parentElement;

    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveClass('w-full');

    // Check if the content is rendered
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});
