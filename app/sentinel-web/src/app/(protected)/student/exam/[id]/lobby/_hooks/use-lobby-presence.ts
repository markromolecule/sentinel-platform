'use client';

import { useEffect, useState, useRef } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { useAuth } from '@sentinel/hooks';
import type { PresenceState } from '@sentinel/shared/types';

export function useLobbyPresence(examId: string) {
    const { supabase, session } = useAuth();
    const [presenceCount, setPresenceCount] = useState(0);
    const channelRef = useRef<RealtimeChannel | null>(null);

    useEffect(() => {
        if (!supabase || !session?.user || !examId) return;

        const userId = session.user.id;
        const channelName = `presence:lobby:${examId}`;

        const cleanup = async () => {
            if (channelRef.current) {
                const ch = channelRef.current;
                channelRef.current = null;
                await supabase.removeChannel(ch);
            }
        };

        const initPresence = async () => {
            await cleanup();

            const channel = supabase.channel(channelName, {
                config: {
                    presence: {
                        key: userId,
                    },
                },
            });

            channel
                .on('presence', { event: 'sync' }, () => {
                    const state = channel.presenceState<PresenceState>();
                    const uniqueUserIds = new Set<string>();

                    Object.values(state).forEach((presences) => {
                        presences.forEach((p) => {
                            if (p.user_id) uniqueUserIds.add(p.user_id);
                        });
                    });

                    setPresenceCount(uniqueUserIds.size);
                })
                .subscribe(async (status) => {
                    if (status === 'SUBSCRIBED') {
                        await channel.track({
                            user_id: userId,
                            online_at: new Date().toISOString(),
                        });
                    }
                });

            channelRef.current = channel;
        };

        void initPresence();

        return () => {
            void cleanup();
        };
    }, [supabase, session?.user, examId]);

    return { presenceCount };
}
