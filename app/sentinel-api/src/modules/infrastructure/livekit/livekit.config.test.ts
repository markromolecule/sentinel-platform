import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { getLiveKitConfig, LiveKitConfigError, resetLiveKitConfigForTests } from './livekit.config';
import {
    LIVEKIT_GLOBAL_ACTIVE_INSPECTION_LIMIT,
    LIVEKIT_INSTITUTION_ACTIVE_INSPECTION_LIMIT,
    LIVEKIT_REQUEST_TIMEOUT_MS,
} from './livekit.constants';

const CONFIG_PATH = join(dirname(fileURLToPath(import.meta.url)), 'livekit.config.ts');

const LIVEKIT_ENV_KEYS = [
    'LIVE_INSPECTION_ENABLED',
    'LIVE_INSPECTION_INSTITUTION_ALLOWLIST',
    'LIVEKIT_URL',
    'LIVEKIT_API_KEY',
    'LIVEKIT_API_SECRET',
    'LIVEKIT_REQUEST_TIMEOUT_MS',
    'LIVEKIT_VIEWER_JOIN_TIMEOUT_MS',
    'LIVEKIT_MAX_INSPECTION_DURATION_SECONDS',
    'LIVEKIT_TOKEN_TTL_SECONDS',
    'LIVEKIT_ROOM_EMPTY_TIMEOUT_SECONDS',
    'LIVEKIT_ROOM_DEPARTURE_TIMEOUT_SECONDS',
    'LIVEKIT_GLOBAL_ACTIVE_INSPECTION_LIMIT',
    'LIVEKIT_INSTITUTION_ACTIVE_INSPECTION_LIMIT',
] as const;

describe('getLiveKitConfig', () => {
    afterEach(() => {
        resetLiveKitConfigForTests();
        vi.restoreAllMocks();

        for (const key of LIVEKIT_ENV_KEYS) {
            delete process.env[key];
        }
    });

    it('returns disabled defaults without provider secrets', () => {
        const config = getLiveKitConfig();

        expect(config).toMatchObject({
            enabled: false,
            allowedInstitutionIds: [],
            liveKitUrl: null,
            apiKey: null,
            apiSecret: null,
            requestTimeoutMs: LIVEKIT_REQUEST_TIMEOUT_MS,
            globalActiveInspectionLimit: LIVEKIT_GLOBAL_ACTIVE_INSPECTION_LIMIT,
            institutionActiveInspectionLimit: LIVEKIT_INSTITUTION_ACTIVE_INSPECTION_LIMIT,
        });
    });

    it('parses a valid enabled managed-service configuration', () => {
        process.env.LIVE_INSPECTION_ENABLED = 'true';
        process.env.LIVE_INSPECTION_INSTITUTION_ALLOWLIST =
            '11111111-1111-4111-8111-111111111111, 22222222-2222-4222-8222-222222222222';
        process.env.LIVEKIT_URL = 'wss://sentinel-test.livekit.cloud';
        process.env.LIVEKIT_API_KEY = 'api-key';
        process.env.LIVEKIT_API_SECRET = 'api-secret';
        process.env.LIVEKIT_REQUEST_TIMEOUT_MS = '1000';
        process.env.LIVEKIT_GLOBAL_ACTIVE_INSPECTION_LIMIT = '5';
        process.env.LIVEKIT_INSTITUTION_ACTIVE_INSPECTION_LIMIT = '3';

        expect(getLiveKitConfig()).toMatchObject({
            enabled: true,
            allowedInstitutionIds: [
                '11111111-1111-4111-8111-111111111111',
                '22222222-2222-4222-8222-222222222222',
            ],
            liveKitUrl: 'wss://sentinel-test.livekit.cloud',
            apiKey: 'api-key',
            apiSecret: 'api-secret',
            requestTimeoutMs: 1000,
            globalActiveInspectionLimit: 5,
            institutionActiveInspectionLimit: 3,
        });
    });

    it('rejects a non-wss LiveKit URL when enabled', () => {
        process.env.LIVE_INSPECTION_ENABLED = 'true';
        process.env.LIVEKIT_URL = 'https://sentinel-test.livekit.cloud';
        process.env.LIVEKIT_API_KEY = 'api-key';
        process.env.LIVEKIT_API_SECRET = 'api-secret';

        expect(() => getLiveKitConfig()).toThrow(LiveKitConfigError);
        expect(() => getLiveKitConfig()).toThrow('wss');
    });

    it('rejects missing enabled secrets', () => {
        process.env.LIVE_INSPECTION_ENABLED = 'true';
        process.env.LIVEKIT_URL = 'wss://sentinel-test.livekit.cloud';
        process.env.LIVEKIT_API_KEY = 'api-key';

        expect(() => getLiveKitConfig()).toThrow(LiveKitConfigError);
        expect(() => getLiveKitConfig()).toThrow('LIVEKIT_API_SECRET');
    });

    it('rejects malformed institution allowlist values', () => {
        process.env.LIVE_INSPECTION_INSTITUTION_ALLOWLIST = 'not-a-uuid';

        expect(() => getLiveKitConfig()).toThrow(LiveKitConfigError);
        expect(() => getLiveKitConfig()).toThrow('ALLOWLIST');
    });

    it('rejects invalid timeout and cap values', () => {
        process.env.LIVEKIT_REQUEST_TIMEOUT_MS = '0';

        expect(() => getLiveKitConfig()).toThrow(LiveKitConfigError);

        resetLiveKitConfigForTests();
        delete process.env.LIVEKIT_REQUEST_TIMEOUT_MS;
        process.env.LIVEKIT_GLOBAL_ACTIVE_INSPECTION_LIMIT = '2';
        process.env.LIVEKIT_INSTITUTION_ACTIVE_INSPECTION_LIMIT = '3';

        expect(() => getLiveKitConfig()).toThrow(LiveKitConfigError);
        expect(() => getLiveKitConfig()).toThrow('less than or equal');
    });

    it('resets cached config for tests', () => {
        expect(getLiveKitConfig().enabled).toBe(false);

        process.env.LIVE_INSPECTION_ENABLED = 'true';
        process.env.LIVEKIT_URL = 'wss://sentinel-test.livekit.cloud';
        process.env.LIVEKIT_API_KEY = 'api-key';
        process.env.LIVEKIT_API_SECRET = 'api-secret';

        expect(getLiveKitConfig().enabled).toBe(false);

        resetLiveKitConfigForTests();

        expect(getLiveKitConfig().enabled).toBe(true);
    });

    it('keeps server config free from public env and browser module imports', () => {
        const source = readFileSync(CONFIG_PATH, 'utf8');

        expect(source).not.toContain('NEXT_PUBLIC_');
        expect(source).not.toContain('livekit-client');
        expect(source).not.toContain('window.');
        expect(source).not.toContain('document.');
    });

    it('does not perform network, room, or token work when disabled config is imported', () => {
        const fetchSpy = vi.spyOn(globalThis, 'fetch');
        const source = readFileSync(CONFIG_PATH, 'utf8');

        expect(getLiveKitConfig().enabled).toBe(false);
        expect(fetchSpy).not.toHaveBeenCalled();
        expect(source).not.toContain('RoomServiceClient');
        expect(source).not.toContain('AccessToken');
    });
});
