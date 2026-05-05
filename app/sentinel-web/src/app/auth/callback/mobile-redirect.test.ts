import { describe, expect, it, vi } from 'vitest';
import { createMobileRedirectUrl, isValidMobileRedirectUrl } from './mobile-redirect';

describe('mobile auth redirect helpers', () => {
    it('allows the sentinel mobile app callback scheme', () => {
        expect(isValidMobileRedirectUrl('sentinel-mobile://auth/callback')).toBe(true);
        expect(isValidMobileRedirectUrl('sentinel-mobile:///auth/callback')).toBe(true);
    });

    it('allows Expo Go callback URLs', () => {
        expect(isValidMobileRedirectUrl('exp://192.168.1.102:8081/--/auth/callback')).toBe(true);
        expect(isValidMobileRedirectUrl('exps://example.ngrok.app/--/auth/callback')).toBe(true);
    });

    it('rejects missing and unknown external URLs', () => {
        expect(isValidMobileRedirectUrl(null)).toBe(false);
        expect(isValidMobileRedirectUrl('https://evil.example/auth/callback')).toBe(false);
        expect(isValidMobileRedirectUrl('sentinel-mobile://auth/other')).toBe(false);
    });

    it('allows configured redirect prefixes', () => {
        vi.stubEnv('MOBILE_AUTH_REDIRECT_PREFIXES', 'https://preview.example/auth/callback');

        expect(isValidMobileRedirectUrl('https://preview.example/auth/callback')).toBe(true);
        expect(isValidMobileRedirectUrl('https://other.example/auth/callback')).toBe(false);

        vi.unstubAllEnvs();
    });

    it('builds mobile callback redirects with hash params', () => {
        expect(
            createMobileRedirectUrl('sentinel-mobile://auth/callback', {
                access_token: 'access-token',
                refresh_token: 'refresh-token',
            }),
        ).toBe(
            'sentinel-mobile://auth/callback#access_token=access-token&refresh_token=refresh-token',
        );
    });
});
