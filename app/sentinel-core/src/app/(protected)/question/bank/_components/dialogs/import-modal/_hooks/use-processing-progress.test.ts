import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useProcessingProgress } from './use-processing-progress';
import { useAiImportStore } from './use-ai-import-store';

describe('useProcessingProgress', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        useAiImportStore.getState().reset();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('returns 0% progress and empty step string when isProcessing is false', () => {
        useAiImportStore.getState().setJobProgress(50, 'Drafting question set');

        const { result } = renderHook(() =>
            useProcessingProgress({
                isProcessing: false,
                filesCount: 2,
                questionCount: 10,
            }),
        );

        expect(result.current.processingProgress).toBe(0);
        expect(result.current.currentStep).toBe('');
    });

    it('returns 0% progress and "Queued" when isProcessing is true and job is at 0%', () => {
        useAiImportStore.getState().setJobProgress(0, 'Queued');

        const { result } = renderHook(() =>
            useProcessingProgress({
                isProcessing: true,
                filesCount: 2,
                questionCount: 10,
            }),
        );

        expect(result.current.processingProgress).toBe(0);
        expect(result.current.currentStep).toBe('Queued');
    });

    it('does not advance progress over elapsed time (no fake simulation)', () => {
        useAiImportStore.getState().setJobProgress(0, 'Queued');

        const { result } = renderHook(() =>
            useProcessingProgress({
                isProcessing: true,
                filesCount: 3,
                questionCount: 20,
            }),
        );

        expect(result.current.processingProgress).toBe(0);
        expect(result.current.currentStep).toBe('Queued');

        // Advance 10 seconds of simulated clock time
        act(() => {
            vi.advanceTimersByTime(10000);
        });

        // Progress must remain strictly at 0% with no simulated advancement
        expect(result.current.processingProgress).toBe(0);
        expect(result.current.currentStep).toBe('Queued');
    });

    it('faithfully updates when server reports durable progress milestones', () => {
        useAiImportStore.getState().setJobProgress(0, 'Queued');

        const { result } = renderHook(() =>
            useProcessingProgress({
                isProcessing: true,
                filesCount: 1,
                questionCount: 10,
            }),
        );

        expect(result.current.processingProgress).toBe(0);

        // Server milestone 1: 5% Staging
        act(() => {
            useAiImportStore.getState().setJobProgress(5, 'Staging lecture documents...');
        });
        expect(result.current.processingProgress).toBe(5);
        expect(result.current.currentStep).toBe('Staging lecture documents...');

        // Server milestone 2: 50% Drafting
        act(() => {
            useAiImportStore.getState().setJobProgress(50, 'Drafting question set...');
        });
        expect(result.current.processingProgress).toBe(50);
        expect(result.current.currentStep).toBe('Drafting question set...');

        // Server milestone 3: 100% Completed
        act(() => {
            useAiImportStore.getState().setJobProgress(100, 'Generation complete');
        });
        expect(result.current.processingProgress).toBe(100);
        expect(result.current.currentStep).toBe('Generation complete');
    });

    it('faithfully renders nonterminal retry status message from server', () => {
        useAiImportStore.getState().setJobProgress(5, 'Staging lecture documents...');

        const { result } = renderHook(() =>
            useProcessingProgress({
                isProcessing: true,
            }),
        );

        expect(result.current.processingProgress).toBe(5);

        // Server reports nonterminal retry
        act(() => {
            useAiImportStore
                .getState()
                .setJobProgress(5, 'Temporary failure encountered. Retrying attempt 1 of 3...');
        });

        expect(result.current.processingProgress).toBe(5);
        expect(result.current.currentStep).toBe(
            'Temporary failure encountered. Retrying attempt 1 of 3...',
        );
    });

    it('defaults to "Queued" when currentStep is null and progress is 0%', () => {
        useAiImportStore.getState().setJobProgress(0, null);

        const { result } = renderHook(() =>
            useProcessingProgress({
                isProcessing: true,
            }),
        );

        expect(result.current.processingProgress).toBe(0);
        expect(result.current.currentStep).toBe('Queued');
    });
});
