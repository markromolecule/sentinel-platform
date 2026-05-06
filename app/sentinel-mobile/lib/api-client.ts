import { createApiClient } from '@sentinel/services';
import { supabase } from './supabase';

let cachedToken: string | undefined = undefined;

export const apiClient = createApiClient({
    baseUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001',
    getToken: async () => {
        if (cachedToken) return cachedToken;

        const {
            data: { session },
        } = await supabase.auth.getSession();
        return session?.access_token;
    },
});

// Update cache when auth state changes
supabase.auth.onAuthStateChange((_event, session) => {
    cachedToken = session?.access_token;
});
