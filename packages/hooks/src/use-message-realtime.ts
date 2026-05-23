'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { useAuth } from './auth-provider';
import { MESSAGES_QUERY_KEYS } from '@sentinel/shared/constants';

type UseMessageRealtimeArgs = {
    conversationId?: string;
    enabled?: boolean;
    invalidateList?: boolean;
};

/**
 * Reusable React hook for subscribing to Supabase Realtime updates for the messages module.
 * Automatically invalidates relevant React Query caches when messages or participant states change.
 *
 * @param args Hook configuration arguments.
 */
export function useMessageRealtime(args: UseMessageRealtimeArgs = {}) {
    const { conversationId, enabled = true, invalidateList = true } = args;
    const queryClient = useQueryClient();
    const { supabase, user } = useAuth();

    useEffect(() => {
        if (!enabled || !supabase || !user?.id) {
            return;
        }

        if (!supabase.channel || !supabase.removeChannel) {
            return;
        }

        // Setup unique channel names to avoid collisions
        const channelName = conversationId
            ? `messages:${conversationId}:${user.id}`
            : `messages:all:${user.id}`;

        const channel: RealtimeChannel = supabase.channel(channelName);

        // 1. Subscribe to new/updated messages
        if (conversationId) {
            channel.on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`,
                },
                () => {
                    // Invalidate messages for this specific conversation
                    void queryClient.invalidateQueries({
                        queryKey: MESSAGES_QUERY_KEYS.messages(conversationId),
                    });

                    // Also invalidate the conversation list to update the preview
                    if (invalidateList) {
                        void queryClient.invalidateQueries({
                            queryKey: MESSAGES_QUERY_KEYS.conversations(),
                        });
                    }
                },
            );
        } else {
            // Listen to any message events the user is authorized to see
            channel.on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'messages',
                },
                (payload: any) => {
                    // Invalidate conversation list preview
                    if (invalidateList) {
                        void queryClient.invalidateQueries({
                            queryKey: MESSAGES_QUERY_KEYS.conversations(),
                        });
                    }
                    // If we receive a payload with a conversationId, we could also invalidate its specific message list
                    if (payload?.new?.conversation_id) {
                        void queryClient.invalidateQueries({
                            queryKey: MESSAGES_QUERY_KEYS.messages(payload.new.conversation_id),
                        });
                    }
                },
            );
        }

        // 2. Subscribe to participant updates for the current user (e.g. read status change)
        channel.on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'conversation_participants',
                filter: `user_id=eq.${user.id}`,
            },
            () => {
                if (invalidateList) {
                    void queryClient.invalidateQueries({
                        queryKey: MESSAGES_QUERY_KEYS.conversations(),
                    });
                }
            },
        );

        channel.subscribe();

        return () => {
            void supabase.removeChannel(channel);
        };
    }, [conversationId, enabled, invalidateList, queryClient, supabase, user?.id]);
}
