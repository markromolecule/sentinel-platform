import { useEffect } from 'react';
import { apiClient } from '@/data/api/client';
import { createSupabaseClient } from '@/data/supabase/client';

const HEARTBEAT_INTERVAL = 4.5 * 60 * 1000; // 4.5 minutes

export function useHeartbeat() {
    useEffect(() => {
        const supabase = createSupabaseClient();
        
        const sendHeartbeat = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    await apiClient('/heartbeat');
                }
            } catch (error) {
                console.error('Heartbeat failed:', error);
            }
        };

        // Initial heartbeat
        sendHeartbeat();

        // Setup interval
        const intervalId = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, []);
}
