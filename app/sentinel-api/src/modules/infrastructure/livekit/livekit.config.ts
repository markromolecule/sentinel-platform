import { z } from 'zod';
import {
    LIVEKIT_GLOBAL_ACTIVE_INSPECTION_LIMIT,
    LIVEKIT_INSTITUTION_ACTIVE_INSPECTION_LIMIT,
    LIVEKIT_MAX_INSPECTION_DURATION_SECONDS,
    LIVEKIT_REQUEST_TIMEOUT_MS,
    LIVEKIT_ROOM_DEPARTURE_TIMEOUT_SECONDS,
    LIVEKIT_ROOM_EMPTY_TIMEOUT_SECONDS,
    LIVEKIT_TOKEN_TTL_SECONDS,
    LIVEKIT_VIEWER_JOIN_TIMEOUT_MS,
} from './livekit.constants';

const UUID_SCHEMA = z.string().uuid();

export class LiveKitConfigError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'LiveKitConfigError';
    }
}

export type LiveKitConfig = {
    enabled: boolean;
    allowedInstitutionIds: string[];
    liveKitUrl: string | null;
    apiKey: string | null;
    apiSecret: string | null;
    requestTimeoutMs: number;
    viewerJoinTimeoutMs: number;
    maxInspectionDurationSeconds: number;
    tokenTtlSeconds: number;
    roomEmptyTimeoutSeconds: number;
    roomDepartureTimeoutSeconds: number;
    globalActiveInspectionLimit: number;
    institutionActiveInspectionLimit: number;
};

const booleanSchema = z
    .enum(['true', 'false', '1', '0'])
    .optional()
    .transform((value) => value === 'true' || value === '1');

const positiveIntegerSchema = z.coerce.number().int().positive();

const rawLiveKitEnvSchema = z.object({
    LIVE_INSPECTION_ENABLED: booleanSchema,
    LIVE_INSPECTION_INSTITUTION_ALLOWLIST: z.string().optional(),
    LIVEKIT_URL: z.string().trim().optional(),
    LIVEKIT_API_KEY: z.string().trim().optional(),
    LIVEKIT_API_SECRET: z.string().trim().optional(),
    LIVEKIT_REQUEST_TIMEOUT_MS: positiveIntegerSchema.default(LIVEKIT_REQUEST_TIMEOUT_MS),
    LIVEKIT_VIEWER_JOIN_TIMEOUT_MS: positiveIntegerSchema.default(LIVEKIT_VIEWER_JOIN_TIMEOUT_MS),
    LIVEKIT_MAX_INSPECTION_DURATION_SECONDS: positiveIntegerSchema.default(
        LIVEKIT_MAX_INSPECTION_DURATION_SECONDS,
    ),
    LIVEKIT_TOKEN_TTL_SECONDS: positiveIntegerSchema.default(LIVEKIT_TOKEN_TTL_SECONDS),
    LIVEKIT_ROOM_EMPTY_TIMEOUT_SECONDS: positiveIntegerSchema.default(
        LIVEKIT_ROOM_EMPTY_TIMEOUT_SECONDS,
    ),
    LIVEKIT_ROOM_DEPARTURE_TIMEOUT_SECONDS: positiveIntegerSchema.default(
        LIVEKIT_ROOM_DEPARTURE_TIMEOUT_SECONDS,
    ),
    LIVEKIT_GLOBAL_ACTIVE_INSPECTION_LIMIT: positiveIntegerSchema.default(
        LIVEKIT_GLOBAL_ACTIVE_INSPECTION_LIMIT,
    ),
    LIVEKIT_INSTITUTION_ACTIVE_INSPECTION_LIMIT: positiveIntegerSchema.default(
        LIVEKIT_INSTITUTION_ACTIVE_INSPECTION_LIMIT,
    ),
});

let cachedConfig: LiveKitConfig | null = null;

/**
 * Reads Sentinel's server-only LiveKit configuration lazily.
 *
 * Disabled mode is the default and never requires provider credentials. Enabled
 * mode fails closed when credentials, the managed `wss` URL, allowlist, or
 * timeout/cap values are unsafe.
 */
export function getLiveKitConfig(): LiveKitConfig {
    if (cachedConfig) {
        return cachedConfig;
    }

    const parsedEnv = parseRawLiveKitEnv(process.env);
    const enabled = parsedEnv.LIVE_INSPECTION_ENABLED === true;
    const allowedInstitutionIds = parseInstitutionAllowlist(
        parsedEnv.LIVE_INSPECTION_INSTITUTION_ALLOWLIST,
    );

    if (
        parsedEnv.LIVEKIT_INSTITUTION_ACTIVE_INSPECTION_LIMIT >
        parsedEnv.LIVEKIT_GLOBAL_ACTIVE_INSPECTION_LIMIT
    ) {
        throw new LiveKitConfigError(
            'LIVEKIT_INSTITUTION_ACTIVE_INSPECTION_LIMIT must be less than or equal to LIVEKIT_GLOBAL_ACTIVE_INSPECTION_LIMIT.',
        );
    }

    if (enabled) {
        validateEnabledLiveKitConfig(parsedEnv);
    }

    cachedConfig = {
        enabled,
        allowedInstitutionIds,
        liveKitUrl: parsedEnv.LIVEKIT_URL || null,
        apiKey: parsedEnv.LIVEKIT_API_KEY || null,
        apiSecret: parsedEnv.LIVEKIT_API_SECRET || null,
        requestTimeoutMs: parsedEnv.LIVEKIT_REQUEST_TIMEOUT_MS,
        viewerJoinTimeoutMs: parsedEnv.LIVEKIT_VIEWER_JOIN_TIMEOUT_MS,
        maxInspectionDurationSeconds: parsedEnv.LIVEKIT_MAX_INSPECTION_DURATION_SECONDS,
        tokenTtlSeconds: parsedEnv.LIVEKIT_TOKEN_TTL_SECONDS,
        roomEmptyTimeoutSeconds: parsedEnv.LIVEKIT_ROOM_EMPTY_TIMEOUT_SECONDS,
        roomDepartureTimeoutSeconds: parsedEnv.LIVEKIT_ROOM_DEPARTURE_TIMEOUT_SECONDS,
        globalActiveInspectionLimit: parsedEnv.LIVEKIT_GLOBAL_ACTIVE_INSPECTION_LIMIT,
        institutionActiveInspectionLimit: parsedEnv.LIVEKIT_INSTITUTION_ACTIVE_INSPECTION_LIMIT,
    };

    return cachedConfig;
}

/**
 * Clears the cached LiveKit configuration so tests can safely mutate env input.
 */
export function resetLiveKitConfigForTests() {
    cachedConfig = null;
}

function parseRawLiveKitEnv(env: NodeJS.ProcessEnv) {
    const result = rawLiveKitEnvSchema.safeParse(env);

    if (!result.success) {
        throw new LiveKitConfigError(`Invalid LiveKit configuration: ${result.error.message}`);
    }

    return result.data;
}

function parseInstitutionAllowlist(value: string | undefined) {
    if (!value) {
        return [];
    }

    return value
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean)
        .map((entry) => {
            const parsedEntry = UUID_SCHEMA.safeParse(entry);

            if (!parsedEntry.success) {
                throw new LiveKitConfigError(
                    'LIVE_INSPECTION_INSTITUTION_ALLOWLIST must contain only UUID values.',
                );
            }

            return parsedEntry.data;
        });
}

function validateEnabledLiveKitConfig(env: z.infer<typeof rawLiveKitEnvSchema>) {
    if (!env.LIVEKIT_URL || !env.LIVEKIT_API_KEY || !env.LIVEKIT_API_SECRET) {
        throw new LiveKitConfigError(
            'LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET are required when live inspection is enabled.',
        );
    }

    let liveKitUrl: URL;

    try {
        liveKitUrl = new URL(env.LIVEKIT_URL);
    } catch {
        throw new LiveKitConfigError('LIVEKIT_URL must be a valid managed LiveKit URL.');
    }

    if (liveKitUrl.protocol !== 'wss:') {
        throw new LiveKitConfigError('LIVEKIT_URL must use the wss protocol.');
    }
}
