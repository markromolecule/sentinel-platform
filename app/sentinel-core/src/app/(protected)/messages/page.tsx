'use client';

import { useState, useEffect, useDeferredValue, useRef } from 'react';
import { MessageList } from './_components/message-list';
import { ChatWindow } from './_components/chat-window';
import {
    useConversationsQuery,
    useConversationMessagesQuery,
    useSendMessageMutation,
    useMarkConversationReadMutation,
    useMessageRealtime,
    usePresence,
    useProfileQuery,
    useUsersQuery,
    useCreateDirectConversationMutation,
} from '@sentinel/hooks';
import { Conversation, Message } from '@sentinel/shared/types';

export default function AdminMessagesPage() {
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDirectory, setShowDirectory] = useState(false);
    const [directorySearch, setDirectorySearch] = useState('');

    const { profile, isLoading: isProfileLoading } = useProfileQuery();
    const { onlineUserIds } = usePresence();

    // Enable realtime subscriptions globally to listen for any incoming database messages
    useMessageRealtime({ enabled: !!profile });

    const conversationsQuery = useConversationsQuery({
        enabled: !!profile,
    });

    const conversations = conversationsQuery.data ?? [];

    const messagesQuery = useConversationMessagesQuery({
        conversationId: selectedConversationId ?? '',
        enabled: !!selectedConversationId,
    });

    const currentMessagesRaw = messagesQuery.data ?? [];

    const sendMessageMutation = useSendMessageMutation();
    const markReadMutation = useMarkConversationReadMutation();

    // Query system users for direct messaging directory
    const deferredDirectorySearch = useDeferredValue(directorySearch);
    const directoryQuery = useUsersQuery({
        search: deferredDirectorySearch,
        enabled: showDirectory,
    });
    const rawDirectoryUsers = directoryQuery.data ?? [];

    const createDirectConversationMutation = useCreateDirectConversationMutation({
        onSuccess: (conversation) => {
            setSelectedConversationId(conversation.conversationId);
            setShowDirectory(false);
            setDirectorySearch('');
        },
    });

    const lastMarkedConversationIdRef = useRef<string | null>(null);

    // Mark as read when selecting conversation
    useEffect(() => {
        if (!selectedConversationId) return;

        const selectedConversation = conversations.find(
            (c) => c.conversationId === selectedConversationId,
        );
        if (!selectedConversation) return;

        if (selectedConversation.unreadCount === 0) {
            if (lastMarkedConversationIdRef.current === selectedConversationId) {
                lastMarkedConversationIdRef.current = null;
            }
            return;
        }

        if (lastMarkedConversationIdRef.current === selectedConversationId) {
            return;
        }

        lastMarkedConversationIdRef.current = selectedConversationId;
        markReadMutation.mutate({ conversationId: selectedConversationId });
    }, [selectedConversationId, conversations, markReadMutation]);

    const handleSendMessage = async (content: string) => {
        if (!selectedConversationId) return;
        try {
            await sendMessageMutation.mutateAsync({
                conversationId: selectedConversationId,
                content,
            });
        } catch (err) {
            console.error('Failed to send message:', err);
        }
    };

    const handleStartConversation = async (recipientId: string) => {
        try {
            await createDirectConversationMutation.mutateAsync({ recipientId });
        } catch (err) {
            console.error('Failed to start conversation:', err);
        }
    };

    if (isProfileLoading || conversationsQuery.isLoading) {
        return (
            <div className="flex h-[calc(100vh-2rem)] items-center justify-center">
                <div className="text-muted-foreground animate-pulse text-lg">
                    Loading messages...
                </div>
            </div>
        );
    }

    const currentUserId = profile?.id ?? 'user-1';

    // Map DB ConversationSummary to UI Conversation
    const mappedConversations: Conversation[] = conversations.map((c) => {
        const otherParticipants = c.participants.filter((p) => p.userId !== currentUserId);
        const selfParticipant = c.participants.filter((p) => p.userId === currentUserId);
        const sortedParticipants = [...otherParticipants, ...selfParticipant];

        const participants = sortedParticipants.map((p) => ({
            id: p.userId,
            name: p.name,
            avatar: p.avatarUrl || undefined,
            status: onlineUserIds.has(p.userId) ? ('online' as const) : ('offline' as const),
            role: p.role as any,
        }));

        return {
            id: c.conversationId,
            participants,
            lastMessage: c.lastMessage
                ? {
                      id: c.lastMessage.messageId,
                      senderId: c.lastMessage.senderId,
                      content: c.lastMessage.content,
                      timestamp: c.lastMessage.createdAt,
                      isRead: c.lastMessage.status === 'READ',
                  }
                : undefined,
            unreadCount: c.unreadCount,
        };
    });

    // Client-side search filtering for active conversations list
    const filteredConversations = mappedConversations.filter((c) => {
        const query = searchTerm.trim().toLowerCase();
        if (!query) return true;
        const mainParticipant = c.participants[0];
        const nameMatch = mainParticipant?.name?.toLowerCase().includes(query);
        const contentMatch = c.lastMessage?.content?.toLowerCase().includes(query);
        return nameMatch || contentMatch;
    });

    const selectedConversation =
        mappedConversations.find((c) => c.id === selectedConversationId) || null;

    // Filter out logged-in user from searchable user directory list
    const directoryUsersFiltered = rawDirectoryUsers.filter((u) => u.id !== currentUserId);

    // Map DB ConversationMessage to UI Message
    const mappedMessages: Message[] = currentMessagesRaw.map((m) => ({
        id: m.messageId,
        senderId: m.senderId,
        content: m.content,
        timestamp: m.createdAt,
        isRead: m.status === 'READ',
    }));

    return (
        <div className="flex h-[calc(100vh-2rem)] flex-col gap-6 p-4 md:p-6">
            <div className="bg-background border-border/50 flex flex-1 overflow-hidden rounded-xl border shadow-sm">
                <MessageList
                    conversations={filteredConversations}
                    selectedId={selectedConversationId}
                    onSelect={setSelectedConversationId}
                    searchTerm={showDirectory ? directorySearch : searchTerm}
                    onSearchChange={showDirectory ? setDirectorySearch : setSearchTerm}
                    showDirectory={showDirectory}
                    onToggleDirectory={() => {
                        setShowDirectory((prev) => !prev);
                        setDirectorySearch('');
                        setSearchTerm('');
                    }}
                    directoryUsers={directoryUsersFiltered}
                    onSelectUser={handleStartConversation}
                    isCreatingConversation={createDirectConversationMutation.isPending}
                />
                <ChatWindow
                    conversation={selectedConversation}
                    messages={mappedMessages}
                    currentUserId={currentUserId}
                    onSendMessage={handleSendMessage}
                    onBack={() => setSelectedConversationId(null)}
                />
            </div>
        </div>
    );
}
