import { createClient } from '@supabase/supabase-js';

let supabaseAdminInstance: ReturnType<typeof createClient> | null = null;

export const getSupabaseAdmin = () => {
    if (!supabaseAdminInstance) {
        const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key =
            process.env.SUPABASE_SERVICE_ROLE_KEY ||
            process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

        if (!url || !key) {
            console.error('Missing Supabase Service Role Key or URL');
            return null;
        }

        supabaseAdminInstance = createClient(url, key, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });
    }
    return supabaseAdminInstance;
};

export const supabaseAdmin = new Proxy({} as ReturnType<typeof createClient>, {
    get(_, prop) {
        const client = getSupabaseAdmin();
        if (!client) {
            throw new Error('Supabase Admin client not initialized. Check environment variables.');
        }
        return (client as any)[prop];
    },
});
