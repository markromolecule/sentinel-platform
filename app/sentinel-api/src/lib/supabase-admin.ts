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
    get(target, prop) {
        // Skip Proxy protection for internal properties and symbols
        if (
            prop === 'then' ||
            prop === 'toJSON' ||
            prop === 'constructor' ||
            typeof prop === 'symbol'
        ) {
            return (target as any)[prop];
        }

        const client = getSupabaseAdmin();
        if (!client) {
            // Log but don't throw immediately to avoid crashing the whole process
            // only throw if we're actually trying to perform an action
            console.error('Supabase Admin client not initialized. Check environment variables.');
            throw new Error('Supabase Admin client not initialized.');
        }
        return (client as any)[prop];
    },
});
