import { usePresence as usePresenceBase } from '@sentinel/hooks';
import { createSupabaseClient } from '@/data/supabase/client';
import { useMemo } from 'react';

export function usePresence() {
    const supabase = createSupabaseClient();

    const config = useMemo(
        () => ({
            supabase,
        }),
        [supabase],
    );

    return usePresenceBase(config);
}
