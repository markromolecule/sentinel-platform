import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { STEPS } from '../../_constants';

export type UseWizardNavigationArgs = {
    hasUnsavedProgress: boolean;
    validateStep: (step: number) => boolean;
};

export function useWizardNavigation({
    hasUnsavedProgress,
    validateStep,
}: UseWizardNavigationArgs) {
    const router = useRouter();
    const [activeStep, setActiveStep] = useState(0);

    const goNext = useCallback(() => {
        if (!validateStep(activeStep)) return;
        setActiveStep((step) => Math.min(step + 1, STEPS.length - 1));
    }, [activeStep, validateStep]);

    const goBack = useCallback(() => {
        setActiveStep((step) => Math.max(step - 1, 0));
    }, []);

    const handleCancel = useCallback(() => {
        if (
            hasUnsavedProgress &&
            !window.confirm('Leave this setup wizard? Unsaved browser changes will be lost.')
        ) {
            return;
        }
        router.push('/institutions');
    }, [hasUnsavedProgress, router]);

    return {
        activeStep,
        setActiveStep,
        goNext,
        goBack,
        handleCancel,
    };
}
