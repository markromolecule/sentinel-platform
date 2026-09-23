import { vi } from 'vitest';

// Provide safe fallback environment variables for unit test runners in CI/test environments
process.env.EXPO_PUBLIC_SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'mock-anon-key-that-is-at-least-twenty-chars';

vi.mock('expo-screen-capture', () => ({
    preventScreenCaptureAsync: vi.fn().mockResolvedValue(undefined),
    allowScreenCaptureAsync: vi.fn().mockResolvedValue(undefined),
    addScreenshotListener: vi.fn(() => ({
        remove: vi.fn(),
    })),
}));

vi.mock('expo-constants', () => ({
    default: {
        appOwnership: null,
        expoConfig: {
            hostUri: 'localhost:8081',
            version: 'test',
        },
        nativeAppVersion: 'test',
    },
}));
