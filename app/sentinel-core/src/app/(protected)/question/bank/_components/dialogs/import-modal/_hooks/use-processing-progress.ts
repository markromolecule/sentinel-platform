'use client';

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
    filesCount?: number;
    questionCount?: number;
}

export function useProcessingProgress({
    isProcessing,
}: UseProcessingProgressProps) {
    const storeProgress = useAiImportStore((state) => state.jobProgress);
    const storeCurrentStep = useAiImportStore((state) => state.currentStep);

    // Truthful progress: report only server-persisted progress while processing
    const activeProgress = isProcessing ? Math.min(100, Math.max(0, storeProgress)) : 0;

    const processingStepIndex = useStableValue(() => {
        if (activeProgress < 28) return 0;
        if (activeProgress < 56) return 1;
        if (activeProgress < 84) return 2;
        return 3;
    }, [activeProgress]);

    // Explicit queued state when at 0% unless a specific server step is provided
    const activeStepText = isProcessing
        ? storeCurrentStep || (activeProgress === 0 ? 'Queued' : PROCESSING_STEPS[processingStepIndex])
        : '';

    return {
        processingProgress: activeProgress,
        processingStepIndex,
        currentStep: activeStepText,
    };
}
