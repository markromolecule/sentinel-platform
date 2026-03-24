import { type MutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { createSupabaseClient } from '@/data/supabase/client';
import { AuthError } from '@supabase/supabase-js';

export type UseLogoutMutationArgs = MutationOptions<void, AuthError, void>;

export function useLogoutMutation(args: UseLogoutMutationArgs = {}) {
    const supabase = createSupabaseClient();
    const queryClient = useQueryClient();

    return useMutation({
        ...args,
        mutationFn: async () => {
            const { error } = await supabase.auth.signOut();

            if (error) {
                throw error;
            }

            queryClient.clear();
        },
    });
}
