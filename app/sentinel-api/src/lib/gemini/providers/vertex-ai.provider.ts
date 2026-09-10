import { HTTPException } from 'hono/http-exception';
import { GoogleGenAI } from '@google/genai';
import { resolveVertexAiConfig } from '../gcp-credentials';
import {
    DEFAULT_QUOTA_RETRY_DELAY_MS,
    MAX_UPSTREAM_RETRIES,
    resolveFallbackModel,
    resolveFlashModel,
    resolveThinkingBudget,
    getPerAttemptGenerationTimeoutMs,
} from '../gemini.config';
import {
    createTimeoutSignal,
    extractErrorStatus,
    isTimeoutOrNetworkFailure,
    mapUpstreamStatus,
} from '../gemini.errors';
import type { LlmInlineData } from '../services/question-generator/types';

export type VertexAiFile = {
    name: string;
    uri: string;
    mimeType: string;
    sizeBytes?: string;
    displayName?: string;
    inlineData?: LlmInlineData;
};

export class VertexAiProvider {
    private static client: GoogleGenAI | null = null;

    static getClient(): GoogleGenAI {
        if (!this.client) {
            const config = resolveVertexAiConfig();
            this.client = new GoogleGenAI(config);
        }
        return this.client;
    }

    static setClientForTesting(client: any): void {
        this.client = client;
    }

    static resetClient(): void {
        this.client = null;
    }

    static async uploadFile(args: {
        buffer: Buffer;
        mimeType: string;
        displayName: string;
    }): Promise<VertexAiFile> {
        const base64Data = args.buffer.toString('base64');
        return {
            name: args.displayName,
            uri: `inline://${encodeURIComponent(args.displayName)}`,
            mimeType: args.mimeType,
            sizeBytes: String(args.buffer.byteLength),
            displayName: args.displayName,
            inlineData: {
                mimeType: args.mimeType,
                data: base64Data,
            },
        };
    }

    static async deleteFile(_name: string): Promise<void> {
        // Vertex AI inline data has no remote persistence on Google Cloud
        return;
    }

    static async generateStructuredJson<T>(
        args: {
            prompt: string;
            responseJsonSchema: Record<string, unknown>;
            files?: Array<Pick<VertexAiFile, 'uri' | 'mimeType' | 'inlineData'>>;
            model?: string;
        },
        sleepFn: (ms: number) => Promise<void> = (ms) =>
            new Promise((resolve) => setTimeout(resolve, ms)),
    ): Promise<T> {
        const client = this.getClient();
        let currentModel = resolveFlashModel(args.model);
        const perAttemptTimeoutMs = getPerAttemptGenerationTimeoutMs();

        const parts: Array<Record<string, unknown>> = [];
        if (args.files?.length) {
            for (const file of args.files) {
                if (file.inlineData) {
                    parts.push({
                        inlineData: {
                            mimeType: file.inlineData.mimeType,
                            data: file.inlineData.data,
                        },
                    });
                } else if (file.uri && !file.uri.startsWith('inline://')) {
                    parts.push({
                        fileData: {
                            mimeType: file.mimeType,
                            fileUri: file.uri,
                        },
                    });
                }
            }
        }
        parts.push({ text: args.prompt });

        let lastError: unknown = undefined;

        for (let attempt = 0; attempt <= MAX_UPSTREAM_RETRIES; attempt++) {
            const thinkingBudget = resolveThinkingBudget(currentModel);
            const signal = createTimeoutSignal(perAttemptTimeoutMs);

            try {
                const response = await client.models.generateContent({
                    model: currentModel,
                    contents: [
                        {
                            role: 'user',
                            parts: parts as any,
                        },
                    ],
                    config: {
                        responseMimeType: 'application/json',
                        responseSchema: args.responseJsonSchema as any,
                        ...(thinkingBudget !== undefined
                            ? {
                                  thinkingConfig: {
                                      thinkingBudget,
                                  },
                              }
                            : {}),
                        ...(signal ? { abortSignal: signal } : {}),
                    },
                });

                const text = response.text;
                if (!text) {
                    const blockReason = (response as any)?.promptFeedback?.blockReason;
                    throw new HTTPException(502, {
                        message: blockReason
                            ? `Vertex AI blocked the request: ${blockReason}.`
                            : 'Vertex AI returned an empty response.',
                        cause: response,
                    });
                }

                try {
                    return JSON.parse(text) as T;
                } catch (error) {
                    console.error(
                        '[VertexAiProvider] Failed to parse Vertex AI JSON response:',
                        error,
                        text,
                    );
                    throw new HTTPException(502, {
                        message: 'Vertex AI returned invalid JSON.',
                        cause: error,
                    });
                }
            } catch (error) {
                lastError = error;

                if (error instanceof HTTPException) {
                    throw error;
                }

                const status = extractErrorStatus(error);

                if (status === 429) {
                    if (attempt === MAX_UPSTREAM_RETRIES) break;
                    const retryDelayMs = DEFAULT_QUOTA_RETRY_DELAY_MS;
                    console.warn(
                        `[VertexAiProvider] Vertex AI quota limit reached (${currentModel}). Retrying generation in ${Math.ceil(retryDelayMs / 1000)} seconds.`,
                    );
                    await sleepFn(retryDelayMs);
                    continue;
                }

                if ([504, 503, 502, 408].includes(status)) {
                    if (attempt === MAX_UPSTREAM_RETRIES) break;
                    const fallbackModel = resolveFallbackModel(currentModel);
                    const retryDelayMs = 1500 * (attempt + 1);
                    console.warn(
                        `[VertexAiProvider] Upstream Vertex AI server error (${status}) on model ${currentModel} (attempt ${attempt + 1}/${MAX_UPSTREAM_RETRIES + 1}). Retrying with fallback model ${fallbackModel} in ${retryDelayMs}ms...`,
                    );
                    currentModel = fallbackModel;
                    await sleepFn(retryDelayMs);
                    continue;
                }

                if (attempt < MAX_UPSTREAM_RETRIES && isTimeoutOrNetworkFailure(error)) {
                    const fallbackModel = resolveFallbackModel(currentModel);
                    const retryDelayMs = 1500 * (attempt + 1);
                    console.warn(
                        `[VertexAiProvider] Generation attempt ${attempt + 1} timed out or failed network call on ${currentModel}. Retrying with fallback model ${fallbackModel} in ${retryDelayMs}ms...`,
                    );
                    currentModel = fallbackModel;
                    await sleepFn(retryDelayMs);
                    continue;
                }

                const httpStatus = mapUpstreamStatus(status || 502);
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.error(
                    `[VertexAiProvider] Vertex AI request failed (${status} -> HTTP ${httpStatus}): ${errorMessage}`,
                    error,
                );
                throw new HTTPException(httpStatus, {
                    message: errorMessage,
                    cause: error,
                });
            }
        }

        const finalStatus = mapUpstreamStatus(extractErrorStatus(lastError) || 502);
        throw new HTTPException(finalStatus, {
            message: 'Vertex AI did not return a response after retries.',
            cause: lastError ?? new Error('Response is undefined after retries'),
        });
    }
}
