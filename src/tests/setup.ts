import { server } from '@/mocks/server';

import '@testing-library/jest-dom';
import { vi } from 'vitest';

import reactI18nextMock from './mocks/i18next';

// Use our centralized react-i18next mock
vi.mock('react-i18next', () => reactI18nextMock);

// Add a global mock for @radix-ui/react-slot
vi.mock('@radix-ui/react-slot', () => ({
  Slot: ({ children }) => children,
  createSlot: () => {
    return ({ children }) => children;
  },
}));

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
