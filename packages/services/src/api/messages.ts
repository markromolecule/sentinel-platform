import type {
    ConversationSummary,
    ConversationDetail,
    ConversationMessage,
} from '@sentinel/shared/types';
import type { ApiClientType } from '../api-client';

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    error?: string;
}

/**
 * Fetches all conversations for the authenticated user.
 *
 * @param apiClient The API client instance.
 * @returns A promise resolving to an array of conversation summaries.
 */
export async function getConversations(apiClient: ApiClientType): Promise<ConversationSummary[]> {
    const response = (await apiClient('/messages/conversations', {
        method: 'GET',
    })) as ApiResponse<ConversationSummary[]>;

    if (!response.success) {
        throw new Error(response.error || response.message || 'Failed to fetch conversations');
    }

    return response.data || [];
}

/**
 * Fetches messages in a specific conversation.
 *
 * @param apiClient The API client instance.
 * @param conversationId The ID of the conversation.
 * @returns A promise resolving to an array of conversation messages.
 */
export async function getConversationMessages(
    apiClient: ApiClientType,
    conversationId: string,
): Promise<ConversationMessage[]> {
    const response = (await apiClient(`/messages/conversations/${conversationId}/messages`, {
        method: 'GET',
    })) as ApiResponse<ConversationMessage[]>;

    if (!response.success) {
        throw new Error(
            response.error || response.message || 'Failed to fetch conversation messages',
        );
    }

    return response.data || [];
}

/**
 * Creates a new direct conversation with a recipient.
 *
 * @param apiClient The API client instance.
 * @param recipientId The ID of the recipient user.
 * @returns A promise resolving to the created conversation detail.
 */
export async function createDirectConversation(
    apiClient: ApiClientType,
    recipientId: string,
): Promise<ConversationDetail> {
    const response = (await apiClient('/messages/conversations/direct', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipientId }),
    })) as ApiResponse<ConversationDetail>;

    if (!response.success) {
        throw new Error(
            response.error || response.message || 'Failed to create direct conversation',
        );
    }

    return response.data;
}

/**
 * Sends a message in a conversation.
 *
 * @param apiClient The API client instance.
 * @param conversationId The ID of the conversation.
 * @param content The text content of the message.
 * @returns A promise resolving to the sent conversation message.
 */
export async function sendMessage(
    apiClient: ApiClientType,
    conversationId: string,
    content: string,
): Promise<ConversationMessage> {
    const response = (await apiClient(`/messages/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
    })) as ApiResponse<ConversationMessage>;

    if (!response.success) {
        throw new Error(response.error || response.message || 'Failed to send message');
    }

    return response.data;
}

/**
 * Marks all messages in a conversation as read.
 *
 * @param apiClient The API client instance.
 * @param conversationId The ID of the conversation.
 * @returns A promise resolving to a success status object.
 */
export async function markConversationRead(
    apiClient: ApiClientType,
    conversationId: string,
): Promise<{ success: boolean }> {
    const response = (await apiClient(`/messages/conversations/${conversationId}/read`, {
        method: 'POST',
    })) as ApiResponse<{ success: boolean }>;

    if (!response.success) {
        throw new Error(response.error || response.message || 'Failed to mark conversation read');
    }

    return response.data;
}
