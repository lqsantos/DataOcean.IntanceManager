import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ContractPreview } from './ContractPreview';
import type { DefaultValuesContract, TemplateDefaultValues } from './types';
import { ValueSourceType } from './types';

// Mock translations
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock contract data for testing
const createMockContract = (): DefaultValuesContract => {
  // Create a template with exposed and non-exposed fields
  const templateValues: TemplateDefaultValues[] = [
    {
      templateId: 'api-template',
      templateName: 'API Service',
      templateVersion: '1.0.0',
      fields: [
        {
          key: 'replicaCount',
          displayName: 'Replica Count',
          value: 3,
          source: ValueSourceType.BLUEPRINT,
          exposed: true,
          overridable: true,
          type: 'number',
          required: false,
          path: ['replicaCount'],
        },
        {
          key: 'image.tag',
          displayName: 'Image Tag',
          value: 'latest',
          source: ValueSourceType.TEMPLATE,
          exposed: false,
          overridable: false,
          type: 'string',
          required: true,
          path: ['image', 'tag'],
        },
        {
          key: 'service.port',
          displayName: 'Service Port',
          value: 8080,
          source: ValueSourceType.BLUEPRINT,
          exposed: true,
          overridable: false,
          type: 'number',
          required: true,
          path: ['service', 'port'],
        },
      ],
      rawYaml: `replicaCount: 3
image:
  tag: latest
service:
  port: 8080`,
    },
  ];

  return {
    templateValues,
    initialized: true,
  };
};

describe('ContractPreview', () => {
  it('renders the preview with correct contract data', () => {
    const mockContract = createMockContract();

    render(<ContractPreview contract={mockContract} />);

    // Check that the title is rendered
    expect(screen.getByText('blueprints:defaultValues.contractPreview.title')).toBeInTheDocument();

    // Check for summary information
    expect(screen.getByText('API Service')).toBeInTheDocument();
  });

  it('does not render when contract is not initialized', () => {
    const emptyContract: DefaultValuesContract = {
      templateValues: [],
      initialized: false,
    };

    const { container } = render(<ContractPreview contract={emptyContract} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('opens dialog when "View Contract" button is clicked', () => {
    const mockContract = createMockContract();

    render(<ContractPreview contract={mockContract} />);

    // Click the view contract button
    fireEvent.click(screen.getByText('blueprints:defaultValues.contractPreview.viewContract'));

    // Check if dialog is open (dialog title is visible)
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
