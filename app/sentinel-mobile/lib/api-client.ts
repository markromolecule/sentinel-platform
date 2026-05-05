import { createApiClient } from '@sentinel/services';
import { supabase } from './supabase';

export const apiClient = createApiClient({
    baseUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001',
    getToken: async () => {
        const {
            data: { session },
        } = await supabase.auth.getSession();
        return session?.access_token;
    },
});
