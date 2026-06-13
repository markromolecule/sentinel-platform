'use client';

import { useState, useEffect } from 'react';
import { useStableValue } from '@sentinel/hooks';

export const PROCESSING_STEPS = [
    'Reading lesson material',
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
    const [processingProgress, setProcessingProgress] = useState(0);

    // Sync state: reset progress when finishing/stopping processing
    const [prevIsProcessing, setPrevIsProcessing] = useState(isProcessing);
    if (isProcessing !== prevIsProcessing) {
        setPrevIsProcessing(isProcessing);
        if (!isProcessing) {
            setProcessingProgress(0);
        }
    }

    const estimatedDurationMs = useStableValue(
        () => 3500 + filesCount * 1200 + questionCount * 90,
        [filesCount, questionCount],
    );

    const processingStepIndex = useStableValue(() => {
        if (processingProgress < 28) return 0;
        if (processingProgress < 56) return 1;
        if (processingProgress < 84) return 2;
        return 3;
    }, [processingProgress]);

    useEffect(() => {
        if (!isProcessing) return;

        const startedAt = Date.now();
        const updateProgress = () => {
            const elapsedMs = Date.now() - startedAt;
            const rawProgress = (elapsedMs / estimatedDurationMs) * 100;
            const easedProgress = 100 * (1 - Math.exp((-3 * rawProgress) / 100));
            setProcessingProgress(Math.min(94, Math.max(8, easedProgress)));
        };

        // Initialize progress immediately
        updateProgress();

        const intervalId = window.setInterval(updateProgress, 120);

        return () => window.clearInterval(intervalId);
    }, [estimatedDurationMs, isProcessing]);

    return {
        processingProgress,
        processingStepIndex,
        currentStep: PROCESSING_STEPS[processingStepIndex],
    };
}
