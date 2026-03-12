import { useEffect, useState } from 'react';
import { createSupabaseClient } from '@/data/supabase/client';
import { PresenceState } from '@sentinel/shared/types';

export function usePresence() {

    const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());
    
    useEffect(() => {
        const supabase = createSupabaseClient();
        
        const initPresence = async () => {
            const { data: { session } } = await supabase.auth.getSession();
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
                    const state = channel.presenceState<PresenceState>();
                    const ids = new Set<string>();
                    
                    Object.values(state).forEach((presences) => {
                        presences.forEach((p) => {
                            if (p.user_id) ids.add(p.user_id);
                        });
                    });
                    
                    setOnlineUserIds(ids);
                })
                .on('presence', { event: 'join' }, ({ newPresences }) => {
                    setOnlineUserIds((prev) => {
                        const next = new Set(prev);
                        (newPresences as unknown as PresenceState[]).forEach((p) => {
                            if (p.user_id) next.add(p.user_id);
                        });
                        return next;
                    });
                })
                .on('presence', { event: 'leave' }, ({ leftPresences }) => {
                    setOnlineUserIds((prev) => {
                        const next = new Set(prev);
                        (leftPresences as unknown as PresenceState[]).forEach((p) => {
                            if (p.user_id) next.delete(p.user_id);
                        });
                        return next;
                    });
                })

                .subscribe(async (status) => {
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
    }, []);

    return { onlineUserIds };
}
