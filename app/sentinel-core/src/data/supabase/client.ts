import { createBrowserClient } from '@supabase/ssr';
import { type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | undefined;

export function createSupabaseClient() {
    if (client) return client;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

    client = createBrowserClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            auth: {
                storageKey: 'sentinel-admin-auth',
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true,
            },
        },
    );

    return client;
}
