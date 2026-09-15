import { useMutation, type MutationOptions } from '@tanstack/react-query';
import { GenerateQuestionPreviewResponse, BloomCognitiveLevel } from '@sentinel/shared';
import { apiClient } from '@/data/api/client';
import { createSupabaseClient } from '@/data/supabase/client';
import { useAiImportStore } from '../use-ai-import-store';
import type { QuestionTypeDistributionItem } from '../../_types';

export type GenerateQuestionsInput = {
    files: File[];
    questionCount: number;
    questionTypeDistribution: QuestionTypeDistributionItem[];
    bloomLevels?: BloomCognitiveLevel[];
};

export type UseGenerateQuestionsMutationArgs = MutationOptions<
    GenerateQuestionPreviewResponse,
    Error,
    GenerateQuestionsInput
>;

export function useGenerateQuestionsMutation(args: UseGenerateQuestionsMutationArgs = {}) {
    return useMutation({
        ...args,
        mutationFn: async ({
            files,
            questionCount,
            questionTypeDistribution,
            bloomLevels,
        }: GenerateQuestionsInput) => {
            const formData = new FormData();

            files.forEach((file: File) => {
                formData.append('file', file);
            });

            const config = {
                questionCount,
                questionTypeDistribution,
                bloomLevels,
                target: 'QUESTION_BANK',
            };
            formData.append('config', JSON.stringify(config));

            // 1. Submit 100% of generations asynchronously via POST /ai/generate-preview/jobs
            const submitRes = await apiClient.submitAiGenerationJob(formData);
            const jobId = submitRes.jobId;

            const store = useAiImportStore.getState();
            store.setActiveJobId(jobId);
            store.setJobProgress(5, 'Staging lecture documents...');

            // 2. Await completion via Supabase Realtime with 2s HTTP polling fallback
            return new Promise<GenerateQuestionPreviewResponse>((resolve, reject) => {
                let isSettled = false;
                let pollInterval: ReturnType<typeof setInterval> | null = null;
                let channel: any = null;

                const cleanup = () => {
                    if (pollInterval) {
                        clearInterval(pollInterval);
                        pollInterval = null;
                    }
                    if (channel) {
                        try {
                            channel.unsubscribe();
                        } catch {
                            // ignore cleanup error
                        }
                        channel = null;
                    }
                };

                const handleJobUpdate = (update: {
                    status?: string;
                    progress?: number;
                    current_step?: string | null;
                    currentStep?: string | null;
                    result?: GenerateQuestionPreviewResponse | null;
                    error?: string | null;
                }) => {
                    if (isSettled) return;

                    const status = update.status;
                    const progress = typeof update.progress === 'number' ? update.progress : undefined;
                    const step = update.currentStep ?? update.current_step ?? null;

                    if (progress !== undefined || step) {
                        useAiImportStore.getState().setJobProgress(progress ?? 0, step);
                    }

                    if (status === 'completed') {
                        isSettled = true;
                        cleanup();
                        useAiImportStore.getState().setJobProgress(100, 'Generation complete');
                        useAiImportStore.getState().setActiveJobId(null);

                        if (update.result) {
                            resolve(update.result);
                        } else {
                            // Fallback: fetch status with full result payload
                            apiClient
                                .getAiGenerationJobStatus(jobId)
                                .then((res: any) => {
                                    if (res?.data?.result) {
                                        resolve(res.data.result);
                                    } else {
                                        reject(new Error('Job marked completed but no question preview returned'));
                                    }
                                })
                                .catch(reject);
                        }
                    } else if (status === 'failed') {
                        isSettled = true;
                        cleanup();
                        useAiImportStore.getState().setActiveJobId(null);
                        reject(new Error(update.error || 'AI question generation failed'));
                    }
                };

                // Setup Supabase Realtime channel subscription
                try {
                    const supabase = createSupabaseClient();
                    channel = supabase
                        .channel(`ai-generation-job-${jobId}`)
                        .on(
                            'postgres_changes',
                            {
                                event: 'UPDATE',
                                schema: 'public',
                                table: 'ai_generation_jobs',
                                filter: `id=eq.${jobId}`,
                            },
                            (payload: any) => {
                                handleJobUpdate(payload.new);
                            },
                        )
                        .subscribe();
                } catch (subErr) {
                    console.warn('Realtime channel subscription failed, relying on HTTP polling:', subErr);
                }

                // Setup resilient 2-second HTTP polling fallback
                pollInterval = setInterval(async () => {
                    if (isSettled) return;
                    try {
                        const statusRes = await apiClient.getAiGenerationJobStatus(jobId);
                        if (statusRes?.data) {
                            handleJobUpdate(statusRes.data);
                        }
                    } catch (pollErr) {
                        console.warn('Polling check encountered error:', pollErr);
                    }
                }, 2000);
            });
        },
    });
}
