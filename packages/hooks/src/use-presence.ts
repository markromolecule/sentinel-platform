import { useEffect, useState } from 'react';
import type { PresenceState } from '@sentinel/shared/types';

interface PresenceConfig {
    supabase: any; // SupabaseClient
}

export function usePresence({ supabase }: PresenceConfig) {
    const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        const initPresence = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            if (!session) return;

            const user = session.user;
            const channel = supabase.channel('presence:user-status', {
                config: {
                    presence: {
                        key: user.id,
                    },
                },
            });

            channel
                .on('presence', { event: 'sync' }, () => {
                    const state = channel.presenceState() as unknown as Record<string, PresenceState[]>;
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

            return () => {
                channel.unsubscribe();
            };
        };

        const cleanupPromise = initPresence();

        return () => {
            cleanupPromise.then((cleanup) => cleanup?.());
        };
    }, [supabase]);

    return { onlineUserIds };
}
