import { HTTPException } from 'hono/http-exception';
import { aiRequestThrottler } from '../middleware/gemini-request-throttler';
import {
    GEMINI_API_BASE_URL,
    GEMINI_REQUEST_FAILURE_MESSAGE,
    MAX_NETWORK_RETRIES,
    MAX_UPSTREAM_RETRIES,
    NETWORK_RETRY_BASE_DELAY_MS,
    getGeminiTimeoutMs,
    getPerAttemptGenerationTimeoutMs,
    resolveFallbackModel,
    resolveFlashModel,
    resolveThinkingBudget,
} from '../gemini.config';
import {
    createTimeoutSignal,
    createUpstreamException,
    extractResponseText,
    isTimeoutOrNetworkFailure,
    isTransientNetworkError,
    resolveQuotaRetryDelayMs,
} from '../gemini.errors';
import type { LlmInlineData } from '../services/question-generator/types';

export type AiStudioFile = {
    name: string;
    uri: string;
    mimeType: string;
    sizeBytes?: string;
    displayName?: string;
    inlineData?: LlmInlineData;
};

export class AiStudioProvider {
    static getApiKey(): string {
        const apiKey = process.env.GEMINI_API_KEY?.trim();
        if (!apiKey) {
            throw new HTTPException(500, {
                message: 'Missing GEMINI_API_KEY in the environment.',
            });
        }
        return apiKey;
    }

    static async uploadFile(args: {
        buffer: Buffer;
        mimeType: string;
        displayName: string;
    }): Promise<AiStudioFile> {
        const apiKey = this.getApiKey();
        const startResponse = await this.fetchWithThrottle(
            `${GEMINI_API_BASE_URL}/upload/v1beta/files`,
            {
                method: 'POST',
                headers: {
                    'x-goog-api-key': apiKey,
                    'X-Goog-Upload-Protocol': 'resumable',
                    'X-Goog-Upload-Command': 'start',
                    'X-Goog-Upload-Header-Content-Length': String(args.buffer.byteLength),
                    'X-Goog-Upload-Header-Content-Type': args.mimeType,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    file: {
                        display_name: args.displayName,
                    },
                }),
            },
        );

        if (!startResponse.ok) {
            throw await createUpstreamException(
                startResponse,
                'Failed to initialize Gemini file upload.',
            );
        }

        const uploadUrl = startResponse.headers.get('x-goog-upload-url');

        if (!uploadUrl) {
            throw new HTTPException(502, {
                message: 'Gemini file upload did not return a resumable upload URL.',
                cause: new Error('Missing x-goog-upload-url header'),
            });
        }

        const uploadResponse = await this.fetchWithThrottle(uploadUrl, {
            method: 'POST',
            headers: {
                'Content-Length': String(args.buffer.byteLength),
                'Content-Type': args.mimeType,
                'X-Goog-Upload-Offset': '0',
                'X-Goog-Upload-Command': 'upload, finalize',
            },
            body: new Uint8Array(args.buffer),
        });

        if (!uploadResponse.ok) {
            throw await createUpstreamException(
                uploadResponse,
                'Failed to upload the PDF to Gemini.',
            );
        }

        const uploadPayload = await uploadResponse.json();
        const file = uploadPayload.file ?? uploadPayload;

        if (!file?.name || !file?.uri) {
            throw new HTTPException(502, {
                message: 'Gemini upload completed without returning file metadata.',
                cause: new Error('Missing file.name or file.uri in upload response payload'),
            });
        }

        return {
            name: file.name,
            uri: file.uri,
            mimeType: file.mimeType ?? args.mimeType,
            sizeBytes: file.sizeBytes,
            displayName: file.displayName ?? file.display_name,
        };
    }

    static async deleteFile(name: string): Promise<void> {
        const apiKey = this.getApiKey();
        const response = await this.fetchWithThrottle(
            `${GEMINI_API_BASE_URL}/v1beta/${encodeURIComponent(name).replace(/%2F/g, '/')}`,
            {
                method: 'DELETE',
                headers: {
                    'x-goog-api-key': apiKey,
                },
            },
        );

        if (response.status === 404) {
            return;
        }

        if (!response.ok) {
            throw await createUpstreamException(
                response,
                'Gemini generated the preview but failed to delete the uploaded file.',
            );
        }
    }

    static async generateStructuredJson<T>(
        args: {
            prompt: string;
            responseJsonSchema: Record<string, unknown>;
            files?: Array<Pick<AiStudioFile, 'uri' | 'mimeType' | 'inlineData'>>;
            model?: string;
        },
        sleepFn: (ms: number) => Promise<void> = (ms) =>
            new Promise((resolve) => setTimeout(resolve, ms)),
        createTimeoutSignalFn: (ms: number) => AbortSignal | undefined = createTimeoutSignal,
    ): Promise<T> {
        const apiKey = this.getApiKey();
        let currentModel = resolveFlashModel(args.model);
        const perAttemptTimeoutMs = getPerAttemptGenerationTimeoutMs();

        let response: Response | undefined;
        let lastError: unknown = undefined;

        for (let attempt = 0; attempt <= MAX_UPSTREAM_RETRIES; attempt++) {
            const thinkingBudget = resolveThinkingBudget(currentModel);
            const requestInit: RequestInit = {
                method: 'POST',
                headers: {
                    'x-goog-api-key': apiKey,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [
                        {
                            role: 'user',
                            parts: [
                                ...(args.files?.length
                                    ? args.files.map((file) => ({
                                          file_data: {
                                              mime_type: file.mimeType,
                                              file_uri: file.uri,
                                          },
                                      }))
                                    : []),
                                {
                                    text: args.prompt,
                                },
                            ],
                        },
                    ],
                    generationConfig: {
                        responseMimeType: 'application/json',
                        responseJsonSchema: args.responseJsonSchema,
                        ...(thinkingBudget !== undefined
                            ? {
                                  thinkingConfig: {
                                      thinkingBudget,
                                  },
                              }
                            : {}),
                    },
                }),
            };

            try {
                response = await this.fetchWithThrottle(
                    `${GEMINI_API_BASE_URL}/v1beta/models/${encodeURIComponent(currentModel)}:generateContent`,
                    requestInit,
                    perAttemptTimeoutMs,
                    sleepFn,
                    createTimeoutSignalFn,
                );

                if (response.ok) {
                    break;
                }

                if (response.status === 429) {
                    if (attempt === MAX_UPSTREAM_RETRIES) break;
                    const retryDelayMs = await resolveQuotaRetryDelayMs(response);
                    console.warn(
                        `[AiStudioProvider] Gemini quota limit reached (${currentModel}). Retrying generation in ${Math.ceil(retryDelayMs / 1000)} seconds.`,
                    );
                    await sleepFn(retryDelayMs);
                    continue;
                }

                if ([504, 503, 502, 408].includes(response.status)) {
                    if (attempt === MAX_UPSTREAM_RETRIES) break;
                    const fallbackModel = resolveFallbackModel(currentModel);
                    const retryDelayMs = 1500 * (attempt + 1);
                    console.warn(
                        `[AiStudioProvider] Upstream Gemini server error (${response.status}) on model ${currentModel} (attempt ${attempt + 1}/${MAX_UPSTREAM_RETRIES + 1}). Retrying with fallback model ${fallbackModel} in ${retryDelayMs}ms...`,
                    );
                    currentModel = fallbackModel;
                    await sleepFn(retryDelayMs);
                    continue;
                }

                // Non-retryable status (400, 401, 403, 404, 422, etc.)
                break;
            } catch (error) {
                lastError = error;
                if (attempt < MAX_UPSTREAM_RETRIES && isTimeoutOrNetworkFailure(error)) {
                    const fallbackModel = resolveFallbackModel(currentModel);
                    const retryDelayMs = 1500 * (attempt + 1);
                    console.warn(
                        `[AiStudioProvider] Generation attempt ${attempt + 1} timed out or failed network call on ${currentModel}. Retrying with fallback model ${fallbackModel} in ${retryDelayMs}ms...`,
                    );
                    currentModel = fallbackModel;
                    await sleepFn(retryDelayMs);
                    continue;
                }
                throw error;
            }
        }

        if (!response) {
            throw new HTTPException(502, {
                message: 'Gemini did not return a response.',
                cause: lastError ?? new Error('Response is undefined after retries'),
            });
        }

        if (!response.ok) {
            throw await createUpstreamException(
                response,
                'Gemini failed while generating structured questions.',
            );
        }

        const payload = await response.json();
        const text = extractResponseText(payload);

        if (!text) {
            const blockReason = payload?.promptFeedback?.blockReason;
            throw new HTTPException(502, {
                message: blockReason
                    ? `Gemini blocked the request: ${blockReason}.`
                    : 'Gemini returned an empty response.',
                cause: payload ?? new Error('Empty text part in Gemini response'),
            });
        }

        try {
            return JSON.parse(text) as T;
        } catch (error) {
            console.error('[AiStudioProvider] Failed to parse Gemini JSON response:', error, text);
            throw new HTTPException(502, {
                message: 'Gemini returned invalid JSON.',
                cause: error,
            });
        }
    }

    private static async fetchWithThrottle(
        input: string,
        init: RequestInit,
        customTimeoutMs?: number,
        sleepFn: (ms: number) => Promise<void> = (ms) =>
            new Promise((resolve) => setTimeout(resolve, ms)),
        createTimeoutSignalFn: (ms: number) => AbortSignal | undefined = createTimeoutSignal,
    ): Promise<Response> {
        return await aiRequestThrottler.schedule(async () => {
            const timeoutMs = customTimeoutMs ?? getGeminiTimeoutMs();
            const startTime = Date.now();

            for (let attempt = 0; attempt <= MAX_NETWORK_RETRIES; attempt++) {
                const signal = createTimeoutSignalFn(timeoutMs);

                try {
                    return await fetch(input, {
                        ...init,
                        ...(signal ? { signal } : {}),
                    });
                } catch (error) {
                    const elapsedMs = Date.now() - startTime;
                    const isTransient = isTransientNetworkError(error, signal);

                    if (isTransient && attempt < MAX_NETWORK_RETRIES) {
                        const retryDelayMs = NETWORK_RETRY_BASE_DELAY_MS * (attempt + 1);
                        console.warn(
                            `[AiStudioProvider] Transient network failure during fetch to ${input} (attempt ${attempt + 1}/${MAX_NETWORK_RETRIES + 1}, elapsed ${elapsedMs}ms). Retrying in ${retryDelayMs}ms... Error: ${error instanceof Error ? error.message : String(error)}`,
                        );
                        await sleepFn(retryDelayMs);
                        continue;
                    }

                    console.error(
                        `[AiStudioProvider] Upstream request failed for ${input} after ${elapsedMs}ms (attempt ${attempt + 1}/${MAX_NETWORK_RETRIES + 1}). Error:`,
                        error,
                    );

                    if (isTimeoutOrNetworkFailure(error)) {
                        throw new HTTPException(502, {
                            message: GEMINI_REQUEST_FAILURE_MESSAGE,
                            cause: error,
                        });
                    }

                    throw error;
                }
            }

            throw new HTTPException(502, {
                message: GEMINI_REQUEST_FAILURE_MESSAGE,
            });
        });
    }
}
