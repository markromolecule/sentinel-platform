import { vi } from 'vitest';

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
