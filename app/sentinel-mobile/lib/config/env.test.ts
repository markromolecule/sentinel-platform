import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
    parseMobileEnv,
    getMobileEnv,
    resetMobileEnvCache,
    mobileEnvSchema,
} from './env';

describe('mobileEnvSchema', () => {
    const validConfig = {
        EXPO_PUBLIC_SUPABASE_URL: 'https://sample.supabase.co',
        EXPO_PUBLIC_SUPABASE_ANON_KEY: 'sample-anon-key-that-meets-length-req',
        EXPO_PUBLIC_API_URL: 'https://api.sentinelph.tech',
        EXPO_PUBLIC_WEB_URL: 'https://app.sentinelph.tech',
        EXPO_PUBLIC_MOBILE_AUTH_CALLBACK_PATH: 'auth/callback',
        EXPO_PUBLIC_EXPO_AUTH_PROXY_URL: 'https://auth.expo.io/@livadomc/sentinel-mobile',
    };

    it('successfully parses a complete valid configuration', () => {
        const parsed = parseMobileEnv(validConfig);
        expect(parsed.EXPO_PUBLIC_SUPABASE_URL).toBe('https://sample.supabase.co');
        expect(parsed.EXPO_PUBLIC_SUPABASE_ANON_KEY).toBe('sample-anon-key-that-meets-length-req');
        expect(parsed.EXPO_PUBLIC_API_URL).toBe('https://api.sentinelph.tech');
        expect(parsed.EXPO_PUBLIC_WEB_URL).toBe('https://app.sentinelph.tech');
        expect(parsed.EXPO_PUBLIC_MOBILE_AUTH_CALLBACK_PATH).toBe('auth/callback');
        expect(parsed.EXPO_PUBLIC_EXPO_AUTH_PROXY_URL).toBe('https://auth.expo.io/@livadomc/sentinel-mobile');
    });

    it('applies sensible defaults for API URL, Web URL and callback path when omitted', () => {
        const minimalConfig = {
            EXPO_PUBLIC_SUPABASE_URL: 'https://sample.supabase.co',
            EXPO_PUBLIC_SUPABASE_ANON_KEY: 'sample-anon-key-that-meets-length-req',
        };
        const parsed = parseMobileEnv(minimalConfig);
        expect(parsed.EXPO_PUBLIC_API_URL).toBe('https://api.sentinelph.tech');
        expect(parsed.EXPO_PUBLIC_WEB_URL).toBe('https://app.sentinelph.tech');
        expect(parsed.EXPO_PUBLIC_MOBILE_AUTH_CALLBACK_PATH).toBe('auth/callback');
        expect(parsed.EXPO_PUBLIC_EXPO_AUTH_PROXY_URL).toBeUndefined();
    });

    it('transforms empty string EXPO_PUBLIC_EXPO_AUTH_PROXY_URL to undefined', () => {
        const configWithEmptyProxy = {
            ...validConfig,
            EXPO_PUBLIC_EXPO_AUTH_PROXY_URL: '',
        };
        const parsed = parseMobileEnv(configWithEmptyProxy);
        expect(parsed.EXPO_PUBLIC_EXPO_AUTH_PROXY_URL).toBeUndefined();
    });

    it('throws when EXPO_PUBLIC_SUPABASE_URL is missing', () => {
        const invalidConfig = {
            EXPO_PUBLIC_SUPABASE_ANON_KEY: 'sample-anon-key-that-meets-length-req',
        };
        expect(() => parseMobileEnv(invalidConfig)).toThrow(
            /EXPO_PUBLIC_SUPABASE_URL is required/
        );
    });

    it('throws when EXPO_PUBLIC_SUPABASE_URL is malformed', () => {
        const invalidConfig = {
            EXPO_PUBLIC_SUPABASE_URL: 'not-a-valid-url',
            EXPO_PUBLIC_SUPABASE_ANON_KEY: 'sample-anon-key-that-meets-length-req',
        };
        expect(() => parseMobileEnv(invalidConfig)).toThrow(
            /EXPO_PUBLIC_SUPABASE_URL must be a valid URL/
        );
    });

    it('throws when EXPO_PUBLIC_SUPABASE_ANON_KEY is too short', () => {
        const invalidConfig = {
            EXPO_PUBLIC_SUPABASE_URL: 'https://sample.supabase.co',
            EXPO_PUBLIC_SUPABASE_ANON_KEY: 'too-short',
        };
        expect(() => parseMobileEnv(invalidConfig)).toThrow(
            /EXPO_PUBLIC_SUPABASE_ANON_KEY must be a valid key with at least 20 characters/
        );
    });

    it('throws when EXPO_PUBLIC_API_URL is an invalid URL', () => {
        const invalidConfig = {
            ...validConfig,
            EXPO_PUBLIC_API_URL: 'invalid-url-format',
        };
        expect(() => parseMobileEnv(invalidConfig)).toThrow(
            /EXPO_PUBLIC_API_URL must be a valid URL/
        );
    });
});

describe('getMobileEnv and cache lifecycle', () => {
    const originalEnv = { ...process.env };

    beforeEach(() => {
        resetMobileEnvCache();
        process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://test-cached.supabase.co';
        process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-cached-anon-key-with-twenty-characters';
    });

    afterEach(() => {
        process.env = { ...originalEnv };
        resetMobileEnvCache();
    });

    it('retrieves and caches environment configuration', () => {
        const env1 = getMobileEnv();
        const env2 = getMobileEnv();
        expect(env1).toBe(env2);
        expect(env1.EXPO_PUBLIC_SUPABASE_URL).toBe('https://test-cached.supabase.co');
    });

    it('re-evaluates after cache reset', () => {
        const env1 = getMobileEnv();
        process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://updated-test.supabase.co';
        resetMobileEnvCache();
        const env2 = getMobileEnv();
        expect(env2.EXPO_PUBLIC_SUPABASE_URL).toBe('https://updated-test.supabase.co');
    });
});
