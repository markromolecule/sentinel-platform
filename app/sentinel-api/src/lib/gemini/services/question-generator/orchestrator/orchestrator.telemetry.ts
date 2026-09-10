import type { GenerateQuestionPreviewConfig } from '@sentinel/shared';
import { isVertexAiEnabled, resolveVertexAiConfig } from '../../../gcp-credentials';
import type { QuestionGeneratorLlmProvider } from '../types';

export interface BackendTelemetryInfo {
    backend: string;
    project?: string;
    location?: string;
}

/**
 * Resolves active AI backend details for logging and observability.
 */
export function resolveBackendTelemetry(provider: QuestionGeneratorLlmProvider): BackendTelemetryInfo {
    if (provider.getBackendInfo) {
        return provider.getBackendInfo();
    }

    if (isVertexAiEnabled()) {
        try {
            const conf = resolveVertexAiConfig();
            return {
                backend: 'Vertex AI',
                project: conf.project,
                location: conf.location,
            };
        } catch {
            return { backend: 'Vertex AI' };
        }
    }

    return { backend: 'Google AI Studio' };
}

/**
 * Logs standard startup diagnostics for preview generation.
 */
export function logPipelineStartup(args: {
    provider: QuestionGeneratorLlmProvider;
    config: GenerateQuestionPreviewConfig;
    batchCount: number;
    batchSize: number;
    model: string;
}): void {
    const backendInfo = resolveBackendTelemetry(args.provider);
    const backendDetails =
        backendInfo.project && backendInfo.location
            ? `Vertex AI (project: ${backendInfo.project}, location: ${backendInfo.location})`
            : backendInfo.backend;

    console.log(`[QuestionGeneratorService] Using AI backend: ${backendDetails}`);
    console.log(
        `[QuestionGeneratorService] Starting generation: ${args.config.questionCount} questions in ${args.batchCount} batch(es) (size ${args.batchSize}), model: ${args.model}`,
    );
}
