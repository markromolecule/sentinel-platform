import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useGenerateQuestionsMutation } from './use-generate-questions-mutation';
import { apiClient } from '@/data/api/client';
import { createSupabaseClient } from '@/data/supabase/client';
import { useAiImportStore } from '../use-ai-import-store';

vi.mock('@/data/api/client', () => ({
    apiClient: {
        submitAiGenerationJob: vi.fn(),
        getAiGenerationJobStatus: vi.fn(),
    },
}));

vi.mock('@/data/supabase/client', () => ({
    createSupabaseClient: vi.fn(),
}));

describe('useGenerateQuestionsMutation', () => {
    let queryClient: QueryClient;
    let realtimeCallback: ((payload: any) => void) | null = null;
    let mockChannel: any;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers({ shouldAdvanceTime: true });
        useAiImportStore.getState().reset();

        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
        });

        realtimeCallback = null;
        mockChannel = {
            on: vi.fn().mockImplementation((event, filter, cb) => {
                realtimeCallback = cb;
                return mockChannel;
            }),
            subscribe: vi.fn().mockReturnValue(mockChannel),
            unsubscribe: vi.fn().mockReturnValue(mockChannel),
        };

        (createSupabaseClient as any).mockReturnValue({
            channel: vi.fn().mockReturnValue(mockChannel),
        });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(QueryClientProvider, { client: queryClient }, children);

    const mockInput = {
        files: [new File(['dummy'], 'sample.pdf', { type: 'application/pdf' })],
        questionCount: 10,
        questionTypeDistribution: [{ type: 'MULTIPLE_CHOICE' as const, count: 10 }],
    };

    it('submits job asynchronously and resolves via Supabase Realtime update', async () => {
        const jobId = 'test-job-rt-1';
        const expectedResult = {
            questions: [
                {
                    type: 'MULTIPLE_CHOICE',
                    questionText: 'What is photosynthesis?',
                    options: ['A', 'B'],
                    correctAnswer: 'A',
                    explanation: 'Test',
                },
            ],
            savePayload: { questions: [] },
        };

        (apiClient.submitAiGenerationJob as any).mockResolvedValueOnce({
            jobId,
            status: 'queued',
        });

        const { result } = renderHook(() => useGenerateQuestionsMutation(), { wrapper });

        result.current.mutate(mockInput);

        await waitFor(() => {
            expect(apiClient.submitAiGenerationJob).toHaveBeenCalledTimes(1);
        });

        expect(useAiImportStore.getState().activeJobId).toBe(jobId);
        expect(useAiImportStore.getState().jobProgress).toBe(0);
        expect(useAiImportStore.getState().currentStep).toBe('Queued');

        // Simulate Realtime in-flight progress event
        expect(realtimeCallback).toBeTruthy();
        realtimeCallback!({
            new: {
                id: jobId,
                status: 'processing',
                progress: 45,
                current_step: 'Generating batch 1 of 2...',
            },
        });

        expect(useAiImportStore.getState().jobProgress).toBe(45);
        expect(useAiImportStore.getState().currentStep).toBe('Generating batch 1 of 2...');

        // Simulate Realtime completed event
        realtimeCallback!({
            new: {
                id: jobId,
                status: 'completed',
                progress: 100,
                current_step: 'Done',
                result: expectedResult,
            },
        });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(result.current.data).toEqual(expectedResult);
        expect(useAiImportStore.getState().activeJobId).toBeNull();
        expect(useAiImportStore.getState().jobProgress).toBe(100);
    });

    it('resolves via 2-second HTTP polling fallback when Realtime event is not received', async () => {
        const jobId = 'test-job-poll-1';
        const expectedResult = {
            questions: [{ type: 'TRUE_FALSE', questionText: 'Is water wet?', correctAnswer: 'TRUE' }],
            savePayload: { questions: [] },
        };

        (apiClient.submitAiGenerationJob as any).mockResolvedValueOnce({
            jobId,
            status: 'queued',
        });

        // Polling returns in-progress then completed
        (apiClient.getAiGenerationJobStatus as any)
            .mockResolvedValueOnce({
                success: true,
                data: {
                    jobId,
                    status: 'processing',
                    progress: 60,
                    currentStep: 'Batch generation in progress',
                    result: null,
                    error: null,
                },
            })
            .mockResolvedValueOnce({
                success: true,
                data: {
                    jobId,
                    status: 'completed',
                    progress: 100,
                    currentStep: 'Finalizing',
                    result: expectedResult,
                    error: null,
                },
            });

        const { result } = renderHook(() => useGenerateQuestionsMutation(), { wrapper });

        result.current.mutate(mockInput);

        await waitFor(() => {
            expect(apiClient.submitAiGenerationJob).toHaveBeenCalled();
        });

        // Advance 2 seconds for first poll
        await vi.advanceTimersByTimeAsync(2100);
        expect(useAiImportStore.getState().jobProgress).toBe(60);

        // Advance 2 seconds for second poll
        await vi.advanceTimersByTimeAsync(2100);

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(result.current.data).toEqual(expectedResult);
    });

    it('rejects with error message when job fails', async () => {
        const jobId = 'test-job-fail-1';

        (apiClient.submitAiGenerationJob as any).mockResolvedValueOnce({
            jobId,
            status: 'queued',
        });

        const { result } = renderHook(() => useGenerateQuestionsMutation(), { wrapper });

        result.current.mutate(mockInput);

        await waitFor(() => {
            expect(realtimeCallback).toBeTruthy();
        });

        // Simulate failure event
        realtimeCallback!({
            new: {
                id: jobId,
                status: 'failed',
                error: 'Gemini upstream quota exceeded',
            },
        });

        await waitFor(() => {
            expect(result.current.isError).toBe(true);
        });

        expect(result.current.error?.message).toBe('Gemini upstream quota exceeded');
        expect(useAiImportStore.getState().activeJobId).toBeNull();
    });

    it('handles nonterminal retry progress update without resolving or rejecting', async () => {
        const jobId = 'test-job-retry-1';

        (apiClient.submitAiGenerationJob as any).mockResolvedValueOnce({
            jobId,
            status: 'queued',
        });

        const { result } = renderHook(() => useGenerateQuestionsMutation(), { wrapper });

        result.current.mutate(mockInput);

        await waitFor(() => {
            expect(realtimeCallback).toBeTruthy();
        });

        expect(useAiImportStore.getState().jobProgress).toBe(0);
        expect(useAiImportStore.getState().currentStep).toBe('Queued');

        // 1. Worker begins and reports staging milestone
        realtimeCallback!({
            new: {
                id: jobId,
                status: 'processing',
                progress: 5,
                current_step: 'Staging lecture documents...',
            },
        });
        expect(useAiImportStore.getState().jobProgress).toBe(5);
        expect(useAiImportStore.getState().currentStep).toBe('Staging lecture documents...');

        // 2. Retry update on attempt 1 failure
        realtimeCallback!({
            new: {
                id: jobId,
                status: 'processing',
                progress: 5,
                current_step: 'Temporary failure encountered. Retrying attempt 1 of 3...',
            },
        });

        // Mutation must remain pending and nonterminal
        expect(result.current.isPending).toBe(true);
        expect(result.current.isSuccess).toBe(false);
        expect(result.current.isError).toBe(false);
        expect(useAiImportStore.getState().jobProgress).toBe(5);
        expect(useAiImportStore.getState().currentStep).toBe(
            'Temporary failure encountered. Retrying attempt 1 of 3...',
        );
        expect(useAiImportStore.getState().activeJobId).toBe(jobId);
    });
});
