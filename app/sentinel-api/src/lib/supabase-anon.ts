import { createClient } from '@supabase/supabase-js';

let supabaseAnonInstance: ReturnType<typeof createClient> | null = null;

export const getSupabaseAnon = () => {
    if (!supabaseAnonInstance) {
        const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key =
            process.env.SUPABASE_ANON_KEY ||
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!url || !key) {
            console.error('Missing Supabase Anon Key or URL');
            return null;
        }

        supabaseAnonInstance = createClient(url, key, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });
    }
    return supabaseAnonInstance;
};

export const supabaseAnon = new Proxy({} as ReturnType<typeof createClient>, {
    get(target, prop) {
        if (
            prop === 'then' ||
            prop === 'toJSON' ||
            prop === 'constructor' ||
            typeof prop === 'symbol'
        ) {
            return (target as any)[prop];
        }

        const client = getSupabaseAnon();
        if (!client) {
            console.error('Supabase Anon client not initialized.');
            throw new Error('Supabase Anon client not initialized.');
        }
        return (client as any)[prop];
    },
});
