import { useHeartbeat as useHeartbeatBase } from '@sentinel/hooks';
import { createSupabaseClient } from '@/data/supabase/client';
import { apiClient } from '@/data/api/client';
import { useMemo } from 'react';

export function useHeartbeat() {
    const supabase = createSupabaseClient();

    const config = useMemo(() => ({
        supabase,
        apiClient,
    }), [supabase]);

    return useHeartbeatBase(config);
}
