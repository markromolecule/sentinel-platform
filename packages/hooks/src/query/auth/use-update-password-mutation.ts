import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import type { UserResponse } from '@supabase/supabase-js';
import { useAuth } from '../../auth-provider';

export function useUpdatePasswordMutation(
    args: UseMutationOptions<UserResponse, Error, { password: string }> = {},
) {
    const { supabase } = useAuth();

    return useMutation({
        ...args,
        mutationFn: async ({ password }) => {
            if (!supabase) throw new Error('Supabase client not initialized');
            const response = await supabase.auth.updateUser({ password });
            if (response.error) throw response.error;
            return response;
        },
    });
}
