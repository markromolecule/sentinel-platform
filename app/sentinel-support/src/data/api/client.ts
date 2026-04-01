import { createApiClient } from '@sentinel/services';
import { createSupabaseClient } from '@/data/supabase/client';

const supabase = createSupabaseClient();

export const apiClient = createApiClient({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    getToken: async () => {
        // Try to get the session from the singleton client
        const {
            data: { session },
        } = await supabase.auth.getSession();

        return session?.access_token;
    },
});
