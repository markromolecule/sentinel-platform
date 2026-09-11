import type { User, Session } from '@supabase/supabase-js';
import { useAuth } from '../../auth-provider';
import { useApi } from '../../api-provider';
import { ApiError } from '@sentinel/services';
import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import type { VerifyOtpSchemaType } from '@sentinel/shared/schema';

export interface VerifyOtpResponse {
    user: User | null;
    session: Session | null;
}

export class VerifyOtpError extends Error {
    code: string;

    constructor(message: string, code: string) {
        super(message);
        this.code = code;
        this.name = 'VerifyOtpError';
    }
}

export function useVerifyOtpMutation(
    args: UseMutationOptions<VerifyOtpResponse, VerifyOtpError, VerifyOtpSchemaType> = {},
) {
    const { supabase } = useAuth();
    const api = useApi();

    return useMutation({
        ...args,
        mutationFn: async (payload: VerifyOtpSchemaType) => {
            if (!supabase) throw new Error('Supabase client not initialized');

            try {
                const response = (await api('/auth/verify-otp', {
                    method: 'POST',
                    body: JSON.stringify(payload),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })) as VerifyOtpResponse;

                if (response.session) {
                    await supabase.auth.setSession({
                        access_token: response.session.access_token,
                        refresh_token: response.session.refresh_token,
                    });
                }

                return response;
            } catch (error: any) {
                if (error instanceof ApiError) {
                    if (error.status === 429) {
                        throw new VerifyOtpError(error.message, 'rate_limit_exceeded');
                    }
                    throw new VerifyOtpError(error.message, 'api_error');
                }

                throw new VerifyOtpError(
                    error instanceof Error ? error.message : 'An unknown error occurred',
                    'unknown_error',
                );
            }
        },
    });
}
