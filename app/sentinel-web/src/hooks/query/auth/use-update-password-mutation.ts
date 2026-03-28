import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import { createSupabaseClient } from '@/data/supabase/client';
import { User } from '@supabase/supabase-js';

export type UpdatePasswordArgs = { password: string };

export function useUpdatePasswordMutation(
    args: UseMutationOptions<User | null, Error, UpdatePasswordArgs> = {},
) {
    const supabase = createSupabaseClient();

    return useMutation({
        ...args,
        mutationFn: async ({ password }) => {
            const { data, error } = await supabase.auth.updateUser({ password });
            if (error) {
                throw new Error(error.message || 'Failed to update password');
            }
            return data.user;
        },
    });
}
