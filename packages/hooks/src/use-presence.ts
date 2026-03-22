import { useEffect, useState } from 'react';
import type { PresenceState } from '@sentinel/shared/types';

interface RealtimeChannel {
    unsubscribe: () => void;
    on: (event: 'presence', config: any, callback: (payload: any) => void) => RealtimeChannel;
    subscribe: (callback: (status: string) => void) => void;
    track: (payload: any) => Promise<any>;
    presenceState: () => Record<string, any>;
}

interface SupabaseClient {
    auth: {
        getSession: () => Promise<{
            data: { session: { user: { id: string; email?: string } } | null };
            error: any;
        }>;
        onAuthStateChange: (callback: (event: string, session: any) => void) => {
            data: {
                subscription: { unsubscribe: () => void };
            };
        };
    };
    channel: (name: string, config?: any) => RealtimeChannel;
}

interface PresenceConfig {
    supabase: SupabaseClient;
}

export function usePresence({ supabase }: PresenceConfig) {
    const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        let channel: RealtimeChannel | null = null;

        const initPresence = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (!session) {
                setOnlineUserIds(new Set());
                return;
            }

            const user = session.user;
            channel = supabase.channel('presence:user-status', {
                config: {
                    presence: {
                        key: user.id,
                    },
                },
            });

            channel
                .on('presence', { event: 'sync' }, () => {
                    if (!channel) return;
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
                    if (status === 'SUBSCRIBED' && channel) {
                        await channel.track({
                            user_id: user.id,
                            email: user.email,
                            online_at: new Date().toISOString(),
                        });
                    }
                });
        };

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event: string, session: any) => {
            if (event === 'SIGNED_OUT') {
                if (channel) {
                    channel.unsubscribe();
                    channel = null;
                }
                setOnlineUserIds(new Set());
            } else if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
                initPresence();
            }
        });

        initPresence();

        return () => {
            subscription.unsubscribe();
            if (channel) {
                channel.unsubscribe();
            }
        };
    }, [supabase]);

    return { onlineUserIds };
}
