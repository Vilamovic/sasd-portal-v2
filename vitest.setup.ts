/**
 * Vitest Setup File
 * Runs before all tests
 */
import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Custom matchers (if needed in future)
// expect.extend({
//   toBeValidEmail(received: string) {
//     const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     const pass = regex.test(received);
//     return {
//       pass,
//       message: () => `expected ${received} to be a valid email`,
//     };
//   },
// });
