import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import type { OAuthResponse } from '@supabase/supabase-js';
import { useAuth } from '../../auth-provider';

// 1. Create a custom type that explicitly omits 'mutationFn'
type UseGoogleLoginOptions = Omit<UseMutationOptions<OAuthResponse, Error, void>, 'mutationFn'>;

function resolveOAuthRedirectUrl() {
    if (typeof window !== 'undefined' && window.location.origin) {
        return `${window.location.origin}/auth/callback`;
    }

    const configuredUrl = (
        globalThis as typeof globalThis & {
            process?: { env?: { NEXT_PUBLIC_APP_URL?: string } };
        }
    ).process?.env?.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, '');
    return configuredUrl ? `${configuredUrl}/auth/callback` : undefined;
}

// 2. Change the argument name from 'args' to 'options' for standard convention
export function useGoogleLogin(options?: UseGoogleLoginOptions) {
    const { supabase } = useAuth();

    return useMutation({
        // 3. Spread the safe options here
        ...options,
        // 4. mutationFn is strictly defined and cannot be overridden
        mutationFn: async () => {
            if (!supabase) throw new Error('Supabase client not initialized');
            const redirectTo = resolveOAuthRedirectUrl();

            const response = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo,
                    queryParams: {
                        prompt: 'select_account',
                    },
                },
            });

            if (response.error) throw response.error;
            return response;
        },
    });
}
