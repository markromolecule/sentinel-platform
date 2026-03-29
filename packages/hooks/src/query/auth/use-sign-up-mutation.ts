import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import type { SignUpWithPasswordCredentials, AuthResponse } from '@supabase/supabase-js';
import { useAuth } from '../../auth-provider';

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

    return useMutation({
        ...args,
        mutationFn: async (credentials: SignUpWithPasswordCredentials) => {
            if (!supabase) throw new Error('Supabase client not initialized');
            const response = await supabase.auth.signUp(credentials);
            if (response.error) {
                throw new SignUpError(
                    response.error.message,
                    response.error.name || 'unknown_error',
                );
            }
            return response;
        },
    });
}
