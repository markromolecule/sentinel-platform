'use client';

import { useState, useEffect } from 'react';
import { useStableValue } from '@sentinel/hooks';
import { useAiImportStore } from './use-ai-import-store';

export const PROCESSING_STEPS = [
    'Staging lecture documents',
    'Identifying assessable concepts',
    'Drafting question set',
    'Preparing preview',
];

interface UseProcessingProgressProps {
    isProcessing: boolean;
    filesCount: number;
    questionCount: number;
}

export function useProcessingProgress({
    isProcessing,
    filesCount,
    questionCount,
}: UseProcessingProgressProps) {
    const [simulatedProgress, setSimulatedProgress] = useState(0);

    const storeProgress = useAiImportStore((state) => state.jobProgress);
    const storeCurrentStep = useAiImportStore((state) => state.currentStep);

    // Sync state: reset progress when finishing/stopping processing
    const [prevIsProcessing, setPrevIsProcessing] = useState(isProcessing);
    if (isProcessing !== prevIsProcessing) {
        setPrevIsProcessing(isProcessing);
        if (!isProcessing) {
            setSimulatedProgress(0);
        }
    }

    const estimatedDurationMs = useStableValue(
        () => 3500 + filesCount * 1200 + questionCount * 90,
        [filesCount, questionCount],
    );

    useEffect(() => {
        if (!isProcessing) return;

        const startedAt = Date.now();
        const updateProgress = () => {
            const elapsedMs = Date.now() - startedAt;
            const rawProgress = (elapsedMs / estimatedDurationMs) * 100;
            const easedProgress = 100 * (1 - Math.exp((-3 * rawProgress) / 100));
            setSimulatedProgress(Math.min(94, Math.max(5, easedProgress)));
        };

        // Initialize progress immediately
        updateProgress();

        const intervalId = window.setInterval(updateProgress, 120);

        return () => window.clearInterval(intervalId);
    }, [estimatedDurationMs, isProcessing]);

    // Priority: Real server progress if reported; otherwise smoothly simulated progress
    const activeProgress = storeProgress > 0 ? storeProgress : simulatedProgress;

    const processingStepIndex = useStableValue(() => {
        if (activeProgress < 28) return 0;
        if (activeProgress < 56) return 1;
        if (activeProgress < 84) return 2;
        return 3;
    }, [activeProgress]);

    const activeStepText =
        storeCurrentStep || PROCESSING_STEPS[processingStepIndex];

    return {
        processingProgress: activeProgress,
        processingStepIndex,
        currentStep: activeStepText,
    };
}
