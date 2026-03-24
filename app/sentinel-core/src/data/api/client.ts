import { createApiClient } from '@sentinel/services';
import { createSupabaseClient } from '@/data/supabase/client';

const supabase = createSupabaseClient();

export const apiClient = createApiClient({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    getToken: async () => {
        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
            console.warn('API Client: No active session found. Request will likely fail with 401.');
        }

        return session?.access_token;
    },
});
