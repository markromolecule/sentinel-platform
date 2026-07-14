'use client';

import { Suspense } from 'react';
import { Spinner } from '@sentinel/ui';
import { MessageList } from './_components/message-list';
import { ChatWindow } from './_components/chat-window';
import { useProctorMessages } from './_hooks/use-proctor-messages';

/**
 * Proctor messaging workspace content.
 * Renders the conversation list and active chat window.
 */
function ProctorMessagesPageContent() {
    const {
        selectedConversationId,
        setSelectedConversationId,
        searchTerm,
        setSearchTerm,
        showDirectory,
        setShowDirectory,
        directorySearch,
        setDirectorySearch,
        filteredConversations,
        directoryUsersFiltered,
        selectedConversation,
        mappedMessages,
        currentUserId,
        handleSendMessage,
        handleStartConversation,
        isConversationsLoading,
        isMessagesLoading,
        isCreatingConversation,
    } = useProctorMessages();

    return (
        <div className="flex h-[calc(100dvh-4rem)] min-h-0 max-h-[calc(100dvh-4rem)] flex-1 overflow-hidden">
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
                isCreatingConversation={isCreatingConversation}
                isLoading={isConversationsLoading}
            />
            <ChatWindow
                conversation={selectedConversation}
                messages={mappedMessages}
                currentUserId={currentUserId}
                onSendMessage={handleSendMessage}
                onBack={() => setSelectedConversationId(null)}
                isLoading={isMessagesLoading}
            />
        </div>
    );
}

/**
 * Messages workspace page for proctors/instructors.
 * Renders the workspace content with a loading suspense fallback.
 */
export default function ProctorMessagesPage() {
    return (
        <Suspense
            fallback={
                <div className="flex h-full items-center justify-center">
                    <Spinner className="text-primary size-8" />
                </div>
            }
        >
            <ProctorMessagesPageContent />
        </Suspense>
    );
}
