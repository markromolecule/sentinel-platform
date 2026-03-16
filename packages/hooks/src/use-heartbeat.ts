import { useEffect } from 'react';

const HEARTBEAT_INTERVAL = 4.5 * 60 * 1000; // 4.5 minutes

interface HeartbeatConfig {
    supabase: any; // SupabaseClient
    apiClient: (path: string) => Promise<any>;
}

export function useHeartbeat({ supabase, apiClient }: HeartbeatConfig) {
    useEffect(() => {
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
    }, [supabase, apiClient]);
}
