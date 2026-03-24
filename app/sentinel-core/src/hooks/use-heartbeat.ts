import { useHeartbeat as useHeartbeatBase } from "@sentinel/hooks";
import { createSupabaseClient } from "@/data/supabase/client";
import { apiClient } from "@/data/api/client";

export function useHeartbeat() {
    const supabase = createSupabaseClient();
    
    return useHeartbeatBase({
        supabase,
        apiClient
    });
}
