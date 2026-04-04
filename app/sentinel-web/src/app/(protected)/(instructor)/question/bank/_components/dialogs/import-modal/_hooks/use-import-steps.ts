'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import type { ImportStep } from '../_types';

export function useImportSteps() {
    const [currentStep, setCurrentStep] = useState<ImportStep>('upload');
    const [isTransitioning, setIsTransitioning] = useState(false);

    const handleAnalyze = async (fileCount: number) => {
        if (fileCount === 0) {
            toast.error('Please select at least one PDF file first.');
            return;
        }

        setIsTransitioning(true);
        // Simulate minor analysis delay
        await new Promise((resolve) => setTimeout(resolve, 300));
        setIsTransitioning(false);

        setCurrentStep('configure');
    };

    const handleBack = () => {
        setCurrentStep('upload');
    };

    return {
        currentStep,
        setCurrentStep,
        isTransitioning,
        handleAnalyze,
        handleBack,
    };
}
