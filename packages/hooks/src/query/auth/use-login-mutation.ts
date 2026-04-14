import type { SignInWithPasswordCredentials, User, Session } from '@supabase/supabase-js';
import { useAuth } from '../../auth-provider';
import { useApi } from '../../api-provider';
import { ApiError } from '@sentinel/services';
import { MutationOptions, useMutation } from '@tanstack/react-query';

export interface LoginResponse {
    user: User | null;
    session: Session | null;
}

export class LoginError extends Error {
    code: string;

    constructor(message: string, code: string) {
        super(message);
        this.code = code;
        this.name = 'LoginError';
    }
}

export type UseLoginMutationArgs = MutationOptions<
    LoginResponse,
    LoginError,
    SignInWithPasswordCredentials
>;

export function useLoginMutation(args: UseLoginMutationArgs = {}) {
    const { supabase } = useAuth();
    const api = useApi();

    return useMutation({
        ...args,
        mutationFn: async (credentials) => {
            if (!supabase) throw new Error('Supabase client not initialized');

            try {
                // Call the Sentinel API Proxy for Auth
                const data = (await api('/auth/login', {
                    method: 'POST',
                    body: JSON.stringify({
                        email: 'email' in credentials ? credentials.email : undefined,
                        password: credentials.password,
                    }),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })) as LoginResponse;

                // Sync the session with the local Supabase client to ensure auth state is preserved
                if (data.session) {
                    const { error } = await supabase.auth.setSession(data.session);
                    if (error) {
                        throw new LoginError(error.message, 'session_sync_error');
                    }
                }

                return data;
            } catch (error: any) {
                if (error instanceof ApiError) {
                    // Check for rate limit specifically
                    if (error.status === 429) {
                        throw new LoginError(error.message, 'rate_limit_exceeded');
                    }
                    throw new LoginError(error.message, 'api_error');
                }

                // Generic error
                throw new LoginError(
                    error instanceof Error ? error.message : 'An unknown error occurred',
                    'unknown_error',
                );
            }
        },
    });
}
