import { createBrowserClient } from '@supabase/ssr';
import { type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | undefined;
const SUPABASE_STORAGE_KEY = 'sentinel-web-auth';

function normalizeStoredSession(rawSession: string) {
    try {
        const parsed = JSON.parse(rawSession) as unknown;
        const normalized =
            typeof parsed === 'string' ? (JSON.parse(parsed) as unknown) : parsed;

        if (!normalized || typeof normalized !== 'object' || Array.isArray(normalized)) {
            return null;
        }

        return JSON.stringify(normalized);
    } catch {
        return null;
    }
}

function sanitizeStoredSession() {
    if (typeof window === 'undefined') {
        return;
    }

    const rawSession = window.localStorage.getItem(SUPABASE_STORAGE_KEY);

    if (!rawSession) {
        return;
    }

    const normalizedSession = normalizeStoredSession(rawSession);

    if (!normalizedSession) {
        window.localStorage.removeItem(SUPABASE_STORAGE_KEY);
        return;
    }

    if (normalizedSession !== rawSession) {
        window.localStorage.setItem(SUPABASE_STORAGE_KEY, normalizedSession);
    }
}

export function createSupabaseClient() {
    if (client) return client;

    sanitizeStoredSession();

    client = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            auth: {
                storageKey: SUPABASE_STORAGE_KEY,
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true,
            },
        }
    );

    return client;
}
