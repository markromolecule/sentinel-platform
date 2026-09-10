import { isVertexAiEnabled, resolveVertexAiConfig } from './gcp-credentials';
import {
    DEFAULT_FALLBACK_MODEL,
    DEFAULT_FLASH_MODEL,
    DEFAULT_GEMINI_GENERATION_TIMEOUT_MS,
    DEFAULT_PER_ATTEMPT_GENERATION_TIMEOUT_MS,
    MAX_UPSTREAM_RETRIES,
    getGeminiTimeoutMs,
    getPerAttemptGenerationTimeoutMs,
    resolveFallbackModel,
    resolveFlashModel,
    resolveThinkingBudget,
} from './gemini.config';
import { createTimeoutSignal } from './gemini.errors';
import { VertexAiProvider } from './providers/vertex-ai.provider';
import { AiStudioProvider } from './providers/ai-studio.provider';
import type { LlmInlineData } from './services/question-generator/types';

export {
    DEFAULT_FALLBACK_MODEL,
    DEFAULT_FLASH_MODEL,
    DEFAULT_GEMINI_GENERATION_TIMEOUT_MS,
    DEFAULT_PER_ATTEMPT_GENERATION_TIMEOUT_MS,
    MAX_UPSTREAM_RETRIES,
};

export type UploadedGeminiFile = {
    name: string;
    uri: string;
    mimeType: string;
    sizeBytes?: string;
    displayName?: string;
    inlineData?: LlmInlineData;
};

export class GeminiProvider {
    static resolveFlashModel(model?: string): string {
        return resolveFlashModel(model);
    }

    static resolveFallbackModel(currentModel?: string): string {
        return resolveFallbackModel(currentModel);
    }

    static resolveThinkingBudget(model: string): number | undefined {
        return resolveThinkingBudget(model);
    }

    static getPerAttemptGenerationTimeoutMs(): number {
        return getPerAttemptGenerationTimeoutMs();
    }

    static getGeminiTimeoutMs(): number {
        return getGeminiTimeoutMs();
    }

    static getVertexAiClient() {
        return VertexAiProvider.getClient();
    }

    static setVertexAiClientForTesting(client: any): void {
        VertexAiProvider.setClientForTesting(client);
    }

    static resetVertexAiClient(): void {
        VertexAiProvider.resetClient();
    }

    static getBackendInfo(): { backend: string; project?: string; location?: string } {
        if (isVertexAiEnabled()) {
            try {
                const config = resolveVertexAiConfig();
                return {
                    backend: 'Vertex AI',
                    project: config.project,
                    location: config.location,
                };
            } catch {
                return {
                    backend: 'Vertex AI',
                };
            }
        }
        return {
            backend: 'Google AI Studio',
        };
    }

    static async uploadFile(args: {
        buffer: Buffer;
        mimeType: string;
        displayName: string;
    }): Promise<UploadedGeminiFile> {
        if (isVertexAiEnabled()) {
            return await VertexAiProvider.uploadFile(args);
        }
        return await AiStudioProvider.uploadFile(args);
    }

    static async deleteFile(name: string): Promise<void> {
        if (isVertexAiEnabled()) {
            return await VertexAiProvider.deleteFile(name);
        }
        return await AiStudioProvider.deleteFile(name);
    }

    static async generateStructuredJson<T>(args: {
        prompt: string;
        responseJsonSchema: Record<string, unknown>;
        files?: Array<Pick<UploadedGeminiFile, 'uri' | 'mimeType' | 'inlineData'>>;
        model?: string;
    }): Promise<T> {
        const sleep = (ms: number) => this.sleep(ms);
        const timeoutSignal = (ms: number) => this.createTimeoutSignal(ms);

        if (isVertexAiEnabled()) {
            return await VertexAiProvider.generateStructuredJson<T>(args, sleep);
        }

        return await AiStudioProvider.generateStructuredJson<T>(args, sleep, timeoutSignal);
    }

    static sleep(ms: number): Promise<void> {
        return new Promise<void>((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    static createTimeoutSignal(timeoutMs: number): AbortSignal | undefined {
        return createTimeoutSignal(timeoutMs);
    }
}
