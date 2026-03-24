import { useEffect, useRef } from 'react';

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
    apiClient: (path: string, options?: any) => Promise<any>;
}

export function useHeartbeat({ supabase, apiClient }: HeartbeatConfig) {
    const isMounted = useRef(false);
    const isPending = useRef(false);

    useEffect(() => {
        isMounted.current = true;
        let intervalId: ReturnType<typeof setInterval> | null = null;

        const sendHeartbeat = async () => {
            if (isPending.current) return;
            isPending.current = true;

            try {
                const {
                    data: { session },
                } = await supabase.auth.getSession();
                
                if (!isMounted.current) return;

                if (session) {
                    await apiClient('/heartbeat');
                } else if (intervalId) {
                    clearInterval(intervalId);
                    intervalId = null;
                }
            } catch (error: any) {
                if (isMounted.current) {
                    console.error('Heartbeat failed:', error);
                }
            } finally {
                isPending.current = false;
            }
        };

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event: string) => {
            if (!isMounted.current) return;

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
        if (!intervalId) {
            intervalId = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);
        }

        return () => {
            isMounted.current = false;
            subscription.unsubscribe();
            if (intervalId) clearInterval(intervalId);
        };
    }, [supabase, apiClient]);
}
