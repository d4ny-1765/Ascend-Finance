// Using local storage instead of Base44 SDK to avoid authentication issues
import { mockClient } from './mockStorage';

// Export mock client that uses localStorage
export const base44 = mockClient;
