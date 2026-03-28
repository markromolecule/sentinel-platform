import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createSupabaseServerClient() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            auth: {
                storageKey: 'sentinel-web-auth',
                persistSession: true,
            },
            cookies: {
                // get the cookie from the cookie store
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                // set the cookie in the cookie store
                set(name: string, value: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value, ...options });
                    } catch (error) {
                        console.error(error);
                    }
                },
                // remove the cookie from the cookie store
                remove(name: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value: '', ...options });
                    } catch (error) {
                        console.error(error);
                    }
                },
            },
        },
    );
}
