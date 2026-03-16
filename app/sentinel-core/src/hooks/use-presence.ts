import { usePresence as usePresenceBase } from "@sentinel/hooks";
import { createSupabaseClient } from "@/data/supabase/client";

export function usePresence() {
    return usePresenceBase({
        supabase: createSupabaseClient()
    });
}
