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
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        isMounted.current = true;
        let intervalId: ReturnType<typeof setInterval> | null = null;

        const sendHeartbeat = async () => {
            // Cancel any pending request
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            // Create new controller for this request
            const controller = new AbortController();
            abortControllerRef.current = controller;

            try {
                const {
                    data: { session },
                } = await supabase.auth.getSession();
                
                if (!isMounted.current) return;

                if (session) {
                    await apiClient('/heartbeat', { signal: controller.signal });
                } else if (intervalId) {
                    clearInterval(intervalId);
                    intervalId = null;
                }
            } catch (error: any) {
                if (error.name === 'AbortError') return;
                if (isMounted.current) {
                    console.error('Heartbeat failed:', error);
                }
            } finally {
                if (abortControllerRef.current === controller) {
                    abortControllerRef.current = null;
                }
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
                if (abortControllerRef.current) {
                    abortControllerRef.current.abort();
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
            if (abortControllerRef.current) abortControllerRef.current.abort();
        };
    }, [supabase, apiClient]);
}
