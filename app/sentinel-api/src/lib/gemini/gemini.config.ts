export const DEFAULT_FLASH_MODEL = 'gemini-2.5-flash';
export const DEFAULT_FALLBACK_MODEL = 'gemini-2.5-flash-lite';
export const MAX_UPSTREAM_RETRIES = 2;
export const MAX_QUOTA_RETRIES = 1;
export const DEFAULT_QUOTA_RETRY_DELAY_MS = 2_000;
export const MAX_QUOTA_RETRY_DELAY_MS = 3_000;
export const MAX_NETWORK_RETRIES = 2;
export const NETWORK_RETRY_BASE_DELAY_MS = 1_000;
export const DEFAULT_GEMINI_GENERATION_TIMEOUT_MS = 180_000;
export const DEFAULT_PER_ATTEMPT_GENERATION_TIMEOUT_MS = 28_000;

export const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com';
export const GEMINI_REQUEST_FAILURE_MESSAGE = 'Gemini request timed out or failed to connect.';

export function resolveFlashModel(model?: string): string {
    return (
        model?.trim() ||
        process.env.GEMINI_FLASH_MODEL?.trim() ||
        process.env.GEMINI_MODEL?.trim() ||
        DEFAULT_FLASH_MODEL
    );
}

export function resolveFallbackModel(currentModel?: string): string {
    const envFallback = process.env.AI_GEMINI_FALLBACK_MODEL?.trim();
    if (envFallback) {
        return envFallback;
    }

    if (currentModel === DEFAULT_FALLBACK_MODEL) {
        return DEFAULT_FALLBACK_MODEL;
    }

    return DEFAULT_FALLBACK_MODEL;
}

export function resolveThinkingBudget(model: string): number | undefined {
    const rawBudget = process.env.AI_GEMINI_THINKING_BUDGET?.trim();
    if (rawBudget !== undefined && rawBudget !== '') {
        const parsed = Number(rawBudget);
        if (Number.isFinite(parsed)) {
            return parsed >= 0 ? Math.round(parsed) : undefined;
        }
    }

    if (model.toLowerCase().includes('flash')) {
        return 0;
    }

    return undefined;
}

export function getPerAttemptGenerationTimeoutMs(): number {
    const candidateKeys = [
        'AI_GEMINI_PER_ATTEMPT_TIMEOUT_MS',
        'AI_GEMINI_PER_ATTEMPT_TIMEOUT',
    ];

    for (const key of candidateKeys) {
        const rawValue = process.env[key]?.trim();
        if (!rawValue) continue;

        const parsed = Number(rawValue);
        if (Number.isFinite(parsed) && parsed > 0) {
            return parsed <= 1000 ? Math.round(parsed * 1000) : Math.round(parsed);
        }
    }

    return DEFAULT_PER_ATTEMPT_GENERATION_TIMEOUT_MS;
}

export function getGeminiTimeoutMs(): number {
    const candidateKeys = [
        'AI_GEMINI_TIMEOUT_MS',
        'AI_GEMINI_TIMEOUT',
        'GEMINI_TIMEOUT_MS',
        'GEMINI_TIMEOUT',
    ];

    for (const key of candidateKeys) {
        const rawValue = process.env[key]?.trim();
        if (!rawValue) continue;

        const parsed = Number(rawValue);
        if (Number.isFinite(parsed) && parsed > 0) {
            return parsed <= 1000 ? Math.round(parsed * 1000) : Math.round(parsed);
        }
    }

    return DEFAULT_GEMINI_GENERATION_TIMEOUT_MS;
}
