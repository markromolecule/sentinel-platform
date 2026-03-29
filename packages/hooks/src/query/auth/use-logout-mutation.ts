import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query'
import { useAuth } from '../../auth-provider'

export function useLogoutMutation(args: UseMutationOptions<void, Error, void | undefined> = {}) {
    const { supabase } = useAuth()
    const queryClient = useQueryClient()

    return useMutation({
        ...args,
        mutationFn: async () => {
            if (!supabase) throw new Error('Supabase client not initialized')
            const { error } = await supabase.auth.signOut()
            if (error) throw error
        },
        onSuccess: async (data, variables, context) => {
            // Clear all queries on logout
            await queryClient.clear()
            // @ts-ignore - handled by optional chaining or direct call
            args.onSuccess?.(data, variables, context)
        },
    })
}
