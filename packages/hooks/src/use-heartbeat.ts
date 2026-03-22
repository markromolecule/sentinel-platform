import { useEffect } from 'react';

const HEARTBEAT_INTERVAL = 3.5 * 60 * 1000;

interface SupabaseClient {
    auth: {
        getSession: () => Promise<{ data: { session: any }; error: any }>;
        onAuthStateChange: (callback: (event: string, session: any) => void) => {
            data: { subscription: { unsubscribe: () => void } };
        };
    };
}

interface HeartbeatConfig {
    supabase: SupabaseClient;
    apiClient: (path: string) => Promise<any>;
}

export function useHeartbeat({ supabase, apiClient }: HeartbeatConfig) {
    useEffect(() => {
        let intervalId: ReturnType<typeof setInterval> | null = null;

        const sendHeartbeat = async () => {
            try {
                const {
                    data: { session },
                } = await supabase.auth.getSession();
                if (session) {
                    await apiClient('/heartbeat');
                } else if (intervalId) {
                    clearInterval(intervalId);
                    intervalId = null;
                }
            } catch (error) {
                console.error('Heartbeat failed:', error);
            }
        };

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event: string) => {
            if (event === 'SIGNED_OUT') {
                if (intervalId) {
                    clearInterval(intervalId);
                    intervalId = null;
                }
            } else if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
                sendHeartbeat();
                if (!intervalId) {
                    intervalId = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);
                }
            }
        });

        // Initial heartbeat
        sendHeartbeat();

        // Setup interval
        intervalId = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

        return () => {
            subscription.unsubscribe();
            if (intervalId) clearInterval(intervalId);
        };
    }, [supabase, apiClient]);
}
