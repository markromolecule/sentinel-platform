import { Conversation, Message } from '../../_types';

export interface UseProctorMessagesReturn {
    selectedConversationId: string | null;
    setSelectedConversationId: (id: string | null) => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    showDirectory: boolean;
    setShowDirectory: React.Dispatch<React.SetStateAction<boolean>>;
    directorySearch: string;
    setDirectorySearch: (search: string) => void;
    profile: any;
    onlineUserIds: Set<string>;
    filteredConversations: Conversation[];
    directoryUsersFiltered: any[];
    selectedConversation: Conversation | null;
    mappedMessages: Message[];
    currentUserId: string;
    handleSendMessage: (content: string) => Promise<void>;
    handleStartConversation: (recipientId: string) => Promise<void>;
    isProfileLoading: boolean;
    isConversationsLoading: boolean;
    isMessagesLoading: boolean;
    isCreatingConversation: boolean;
}
