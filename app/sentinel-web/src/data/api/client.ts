import { createApiClient } from '@sentinel/services';
import { createSupabaseClient } from '@/data/supabase/client';

export const apiClient = createApiClient({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    getToken: async () => {
        const supabase = createSupabaseClient();
        const {
            data: { session },
        } = await supabase.auth.getSession();
        return session?.access_token;
    },
});
