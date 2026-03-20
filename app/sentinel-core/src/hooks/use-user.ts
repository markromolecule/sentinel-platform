import { useQuery } from '@tanstack/react-query';
import { createSupabaseClient } from '@/data/supabase/client';

export function useUser() {
    const supabase = createSupabaseClient();

    return useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) throw error;
            return {
                ...user,
                role: user?.user_metadata?.role as 'admin' | 'superadmin' | undefined,
            };
        },
        staleTime: Infinity, // User session doesn't change often
    });
}
