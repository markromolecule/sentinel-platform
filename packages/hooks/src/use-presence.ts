import { useEffect, useState, useRef } from 'react';
import type { PresenceState } from '@sentinel/shared/types';

interface RealtimeChannel {
    unsubscribe: () => void;
    on: (event: 'presence', config: any, callback: (payload: any) => void) => any;
    subscribe: (callback?: (status: string) => void) => any;
    track: (payload: any) => Promise<any>;
    presenceState: () => Record<string, any>;
    [key: string]: any;
}

interface SupabaseClient {
    auth: {
        getSession: () => Promise<any>;
        onAuthStateChange: (callback: (event: string, session: any) => void) => any;
    };
    channel: (name: string, config?: any) => any;
    removeChannel: (channel: any) => Promise<any>;
}

interface PresenceConfig {
    supabase: SupabaseClient;
}

export function usePresence({ supabase }: PresenceConfig) {
    const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());
    const channelRef = useRef<RealtimeChannel | null>(null);
    const isInitializingRef = useRef(false);

    useEffect(() => {
        const cleanup = async () => {
            if (channelRef.current) {
                const ch = channelRef.current;
                channelRef.current = null;
                await supabase.removeChannel(ch);
            }
        };

        const initPresence = async () => {
            if (isInitializingRef.current) return;
            isInitializingRef.current = true;

            try {
                const {
                    data: { session },
                } = await supabase.auth.getSession();

                if (!session) {
                    setOnlineUserIds(new Set());
                    return;
                }

                const user = session.user;

                // Definitively remove any existing channel with this name to avoid cache issues
                const existingChannel = supabase.channel('presence:user-status');
                await supabase.removeChannel(existingChannel);

                const channel = supabase.channel('presence:user-status', {
                    config: {
                        presence: {
                            key: user.id,
                        },
                    },
                });

                channel
                    .on('presence', { event: 'sync' }, () => {
                        const state = channel.presenceState();
                        const ids = new Set<string>();

                        Object.values(state).forEach((presences: any) => {
                            presences.forEach((p: any) => {
                                if (p.user_id) ids.add(p.user_id);
                            });
                        });

                        setOnlineUserIds(ids);
                    })
                    .on('presence', { event: 'join' }, ({ newPresences }: any) => {
                        setOnlineUserIds((prev) => {
                            const next = new Set(prev);
                            (newPresences as unknown as PresenceState[]).forEach((p) => {
                                if (p.user_id) next.add(p.user_id);
                            });
                            return next;
                        });
                    })
                    .on('presence', { event: 'leave' }, ({ leftPresences }: any) => {
                        setOnlineUserIds((prev) => {
                            const next = new Set(prev);
                            (leftPresences as unknown as PresenceState[]).forEach((p) => {
                                if (p.user_id) next.delete(p.user_id);
                            });
                            return next;
                        });
                    })
                    .subscribe(async (status: string) => {
                        if (status === 'SUBSCRIBED') {
                            await channel.track({
                                user_id: user.id,
                                email: user.email,
                                online_at: new Date().toISOString(),
                            });
                        }
                    });

                channelRef.current = channel;
            } finally {
                isInitializingRef.current = false;
            }
        };

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event: string, session: any) => {
            if (event === 'SIGNED_OUT') {
                cleanup();
                setOnlineUserIds(new Set());
            } else if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
                initPresence();
            }
        });

        return () => {
            subscription.unsubscribe();
            cleanup();
        };
    }, [supabase]);

    return { onlineUserIds };
}
