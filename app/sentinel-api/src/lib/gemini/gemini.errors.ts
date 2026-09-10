import { HTTPException } from 'hono/http-exception';
import {
    DEFAULT_QUOTA_RETRY_DELAY_MS,
    MAX_QUOTA_RETRY_DELAY_MS,
} from './gemini.config';

export type UpstreamHttpStatus =
    | 400
    | 401
    | 403
    | 404
    | 409
    | 413
    | 415
    | 422
    | 429
    | 502;

export function mapUpstreamStatus(status: number): UpstreamHttpStatus {
    switch (status) {
        case 400:
        case 401:
        case 403:
        case 404:
        case 409:
        case 413:
        case 415:
        case 422:
        case 429:
            return status;
        default:
            return 502;
    }
}

export function extractErrorStatus(error: unknown): number {
    if (!error || typeof error !== 'object') return 0;
    const err = error as Record<string, unknown>;
    if (typeof err.status === 'number') return err.status;
    if (typeof err.statusCode === 'number') return err.statusCode;
    if (typeof err.code === 'number') return err.code;
    return 0;
}

export function extractResponseText(payload: any): string | undefined {
    const parts = payload?.candidates?.flatMap(
        (candidate: any) => candidate?.content?.parts ?? [],
    );
    const textPart = parts?.find((part: any) => typeof part?.text === 'string');
    return textPart?.text as string | undefined;
}

export function createTimeoutSignal(timeoutMs: number): AbortSignal | undefined {
    const abortSignal = globalThis.AbortSignal;

    if (typeof abortSignal?.timeout === 'function') {
        return abortSignal.timeout(timeoutMs);
    }

    const AbortControllerCtor = globalThis.AbortController;

    if (typeof AbortControllerCtor !== 'function') {
        return undefined;
    }

    const controller = new AbortControllerCtor();
    setTimeout(() => controller.abort(), timeoutMs);
    return controller.signal;
}

export function isTransientNetworkError(error: unknown, signal?: AbortSignal): boolean {
    if (signal?.aborted) {
        return false;
    }

    if (error instanceof TypeError) {
        return true;
    }

    if (typeof error === 'object' && error !== null) {
        const err = error as Record<string, unknown>;
        const cause = err.cause as Record<string, unknown> | undefined;
        const code = String(err.code || cause?.code || '');
        if (
            [
                'ECONNRESET',
                'ECONNREFUSED',
                'EPIPE',
                'ETIMEDOUT',
                'UND_ERR_SOCKET',
                'UND_ERR_CONNECT_TIMEOUT',
                'UND_ERR_HEADERS_TIMEOUT',
            ].includes(code)
        ) {
            return true;
        }
    }

    return false;
}

export function isTimeoutOrNetworkFailure(error: unknown): boolean {
    if (!error) return false;

    const candidate =
        typeof error === 'object' && error !== null && 'cause' in error
            ? (error as { cause?: unknown }).cause || error
            : error;

    if (
        candidate instanceof DOMException &&
        (candidate.name === 'AbortError' || candidate.name === 'TimeoutError')
    ) {
        return true;
    }

    if (candidate instanceof TypeError) {
        return true;
    }

    return (
        typeof candidate === 'object' &&
        candidate !== null &&
        'name' in candidate &&
        ((candidate as { name?: unknown }).name === 'AbortError' ||
            (candidate as { name?: unknown }).name === 'TimeoutError')
    );
}

export async function resolveQuotaRetryDelayMs(response: Response): Promise<number> {
    const retryAfter = response.headers.get('retry-after');

    if (retryAfter) {
        const seconds = Number(retryAfter);
        if (Number.isFinite(seconds) && seconds >= 0) {
            return Math.min(MAX_QUOTA_RETRY_DELAY_MS, Math.ceil(seconds * 1000));
        }

        const retryAt = Date.parse(retryAfter);
        if (Number.isFinite(retryAt)) {
            return Math.min(MAX_QUOTA_RETRY_DELAY_MS, Math.max(0, retryAt - Date.now()));
        }
    }

    const responseText = await response.clone().text();
    const retryDelayMatch =
        responseText.match(/"retryDelay"\s*:\s*"([\d.]+)s"/i) ??
        responseText.match(/retry in ([\d.]+)s/i);
    const retryDelaySeconds = Number(retryDelayMatch?.[1]);

    if (Number.isFinite(retryDelaySeconds) && retryDelaySeconds >= 0) {
        return Math.min(MAX_QUOTA_RETRY_DELAY_MS, Math.ceil(retryDelaySeconds * 1000));
    }

    return DEFAULT_QUOTA_RETRY_DELAY_MS;
}

export async function createUpstreamException(
    response: Response,
    fallbackMessage: string,
): Promise<never> {
    const responseText = await response.text();
    let message = fallbackMessage;
    let errorDetails: unknown = undefined;

    if (responseText) {
        try {
            const payload = JSON.parse(responseText);
            message = payload?.error?.message || payload?.message || fallbackMessage;
            errorDetails = payload;
        } catch {
            message = responseText;
            errorDetails = responseText;
        }
    }

    const status = mapUpstreamStatus(response.status);
    console.error(
        `[GeminiProvider] Upstream API error (${response.status} -> HTTP ${status}): ${message}`,
        errorDetails,
    );

    throw new HTTPException(status, {
        message,
        cause: errorDetails ?? new Error(message),
    });
}
