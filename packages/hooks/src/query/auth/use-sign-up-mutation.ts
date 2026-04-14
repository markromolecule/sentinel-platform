import type { SignUpWithPasswordCredentials, AuthResponse } from '@supabase/supabase-js';
import { useAuth } from '../../auth-provider';
import { useApi } from '../../api-provider';
import { ApiError } from '@sentinel/services';
import { UseMutationOptions, useMutation } from '@tanstack/react-query';

export class SignUpError extends Error {
    code: string;

    constructor(message: string, code: string) {
        super(message);
        this.code = code;
        this.name = 'SignUpError';
    }
}

export function useSignUpMutation(
    args: UseMutationOptions<AuthResponse, SignUpError, SignUpWithPasswordCredentials> = {},
) {
    const { supabase } = useAuth();
    const api = useApi();

    return useMutation({
        ...args,
        mutationFn: async (credentials: SignUpWithPasswordCredentials) => {
            if (!supabase) throw new Error('Supabase client not initialized');

            try {
                // Call the Sentinel API Proxy for Auth
                // This correctly routes the sign-up through our rate-limiter
                const response = (await api('/auth/register', {
                    method: 'POST',
                    body: JSON.stringify({
                        email: 'email' in credentials ? credentials.email : undefined,
                        password: credentials.password,
                        firstName: (credentials.options?.data as any)?.first_name,
                        lastName: (credentials.options?.data as any)?.last_name,
                        terms: true, // Verification is handled on the UI side
                    }),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })) as AuthResponse;

                return response;
            } catch (error: any) {
                if (error instanceof ApiError) {
                    if (error.status === 429) {
                        throw new SignUpError(error.message, 'rate_limit_exceeded');
                    }
                    throw new SignUpError(error.message, 'api_error');
                }

                throw new SignUpError(
                    error instanceof Error ? error.message : 'An unknown error occurred',
                    'unknown_error',
                );
            }
        },
    });
}
