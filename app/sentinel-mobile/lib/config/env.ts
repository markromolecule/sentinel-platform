import { z } from 'zod';

export const mobileEnvSchema = z.object({
    EXPO_PUBLIC_SUPABASE_URL: z
        .string({
            message: 'EXPO_PUBLIC_SUPABASE_URL is required',
        })
        .url('EXPO_PUBLIC_SUPABASE_URL must be a valid URL'),
    EXPO_PUBLIC_SUPABASE_ANON_KEY: z
        .string({
            message: 'EXPO_PUBLIC_SUPABASE_ANON_KEY is required',
        })
        .min(20, 'EXPO_PUBLIC_SUPABASE_ANON_KEY must be a valid key with at least 20 characters'),
    EXPO_PUBLIC_API_URL: z
        .string()
        .url('EXPO_PUBLIC_API_URL must be a valid URL')
        .default('https://api.sentinelph.tech'),
    EXPO_PUBLIC_WEB_URL: z
        .string()
        .url('EXPO_PUBLIC_WEB_URL must be a valid URL')
        .default('https://app.sentinelph.tech'),
    EXPO_PUBLIC_MOBILE_AUTH_CALLBACK_PATH: z
        .string()
        .default('auth/callback'),
    EXPO_PUBLIC_EXPO_AUTH_PROXY_URL: z
        .string()
        .url('EXPO_PUBLIC_EXPO_AUTH_PROXY_URL must be a valid URL')
        .optional()
        .or(z.literal(''))
        .transform((val) => (val && val.length > 0 ? val : undefined)),
});

export type MobileEnv = z.infer<typeof mobileEnvSchema>;

/**
 * Extracts raw environment variables using static member property access
 * to ensure Expo Metro bundler correctly inlines EXPO_PUBLIC_* variables.
 */
export function getRawMobileEnv(): Record<string, unknown> {
    return {
        EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
        EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
        EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL || undefined,
        EXPO_PUBLIC_WEB_URL: process.env.EXPO_PUBLIC_WEB_URL || undefined,
        EXPO_PUBLIC_MOBILE_AUTH_CALLBACK_PATH: process.env.EXPO_PUBLIC_MOBILE_AUTH_CALLBACK_PATH || undefined,
        EXPO_PUBLIC_EXPO_AUTH_PROXY_URL: process.env.EXPO_PUBLIC_EXPO_AUTH_PROXY_URL || undefined,
    };
}

/**
 * Parses and validates environment variables against the schema.
 * Throws a formatted error with all validation failures if invalid.
 */
export function parseMobileEnv(input: Record<string, unknown> = getRawMobileEnv()): MobileEnv {
    const result = mobileEnvSchema.safeParse(input);
    if (!result.success) {
        const issues = result.error.issues
            .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
            .join('\n');
        const message = `[Sentinel Mobile Env] Validation failed for environment variables:\n${issues}\nPlease verify your local .env or remote EAS build environment variables.`;
        throw new Error(message);
    }
    return result.data;
}

let cachedEnv: MobileEnv | null = null;

/**
 * Returns the cached validated mobile environment configuration.
 */
export function getMobileEnv(): MobileEnv {
    if (!cachedEnv) {
        cachedEnv = parseMobileEnv(getRawMobileEnv());
    }
    return cachedEnv;
}

/**
 * Resets the cached environment (used in testing or reconfiguration).
 */
export function resetMobileEnvCache(): void {
    cachedEnv = null;
}
