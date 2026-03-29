import { type MutationOptions, useMutation } from '@tanstack/react-query';
import { submitOnboarding } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { OnboardingFormValues } from '@sentinel/shared/types';

export interface OnboardingResponse {
    success: boolean;
    message?: string;
}

export function useOnboardingMutation(args: MutationOptions<OnboardingResponse, Error, OnboardingFormValues> = {}) {
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (values: OnboardingFormValues) => submitOnboarding(apiClient, values),
    });
}
