import { server } from '@/mocks/server';

import '@testing-library/jest-dom';
import { vi } from 'vitest';

import reactI18nextMock from './mocks/i18next';

// Use our centralized react-i18next mock
vi.mock('react-i18next', () => reactI18nextMock);

// Add a global mock for @radix-ui/react-slot with improved createSlot implementation
vi.mock('@radix-ui/react-slot', () => {
  const createSlot = vi.fn().mockImplementation(() => {
    return ({ children }) => children;
  });

  return {
    Slot: ({ children }) => children,
    createSlot,
  };
});

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
