import { type MutationOptions, useMutation } from '@tanstack/react-query';
import { createSupabaseClient } from '@/data/supabase/client';
import { OnboardingFormValues } from '@/app/(protected)/onboarding/_types';

export interface OnboardingResponse {
    success: boolean;
    message?: string;
}

export function useOnboardingMutation(args: MutationOptions<OnboardingResponse, Error, OnboardingFormValues> = {}) {
    const supabase = createSupabaseClient();

    return useMutation({
        ...args,
        mutationFn: async (values: OnboardingFormValues) => {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (!session) {
                throw new Error('No active session found.');
            }

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const response = await fetch(`${apiUrl}/onboarding`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    errorData.error || errorData.message || 'Failed to save student details.',
                );
            }

            return response.json();
        },
    });
}
