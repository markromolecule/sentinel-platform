import {
    type ConversationMessage,
    type ConversationSummary,
    type ConversationDetail,
    type MessageParticipant,
} from '@sentinel/shared/types';

/**
 * Maps a database message record to the shared ConversationMessage type.
 *
 * @param record - Database message record.
 * @returns Mapped ConversationMessage.
 */
export function mapMessageRecord(record: any): ConversationMessage {
    return {
        messageId: record.messageId,
        conversationId: record.conversationId,
        senderId: record.senderId,
        content: record.content || '',
        status: record.status || 'SENT',
        createdAt:
            record.createdAt instanceof Date
                ? record.createdAt.toISOString()
                : new Date(record.createdAt).toISOString(),
    };
}

/**
 * Maps a database participant record to the shared MessageParticipant type.
 *
 * @param record - Database participant record.
 * @returns Mapped MessageParticipant.
 */
export function mapParticipantRecord(record: any): MessageParticipant {
    return {
        userId: record.userId,
        name: record.name || 'User',
        avatarUrl: record.avatarUrl || null,
        role: record.role || 'student',
        status: record.status || null,
        institution: record.institution
            ? {
                  id: record.institution.id,
                  name: record.institution.name,
              }
            : null,
        lastSeenAt: record.lastSeenAt
            ? record.lastSeenAt instanceof Date
                ? record.lastSeenAt.toISOString()
                : new Date(record.lastSeenAt).toISOString()
            : null,
    };
}

/**
 * Maps a database conversation record to the shared ConversationSummary type.
 *
 * @param record - Database conversation record.
 * @returns Mapped ConversationSummary.
 */
export function mapConversationSummaryRecord(record: any): ConversationSummary {
    let lastMessage: ConversationMessage | null = null;

    // Check if nested lastMessage exists and has valid properties
    if (record.lastMessage && record.lastMessage.messageId) {
        lastMessage = {
            messageId: record.lastMessage.messageId,
            conversationId: record.lastMessage.conversationId,
            senderId: record.lastMessage.senderId,
            content: record.lastMessage.content || '',
            status: record.lastMessage.status || 'SENT',
            createdAt:
                record.lastMessage.createdAt instanceof Date
                    ? record.lastMessage.createdAt.toISOString()
                    : new Date(record.lastMessage.createdAt).toISOString(),
        };
    }

    const participants = Array.isArray(record.participants)
        ? record.participants.map(mapParticipantRecord)
        : [];

    return {
        conversationId: record.conversationId,
        type: record.type || 'DIRECT',
        createdAt:
            record.createdAt instanceof Date
                ? record.createdAt.toISOString()
                : new Date(record.createdAt).toISOString(),
        updatedAt: record.updatedAt
            ? record.updatedAt instanceof Date
                ? record.updatedAt.toISOString()
                : new Date(record.updatedAt).toISOString()
            : null,
        participants,
        lastMessage,
        unreadCount:
            typeof record.unreadCount === 'number'
                ? record.unreadCount
                : Number(record.unreadCount || 0),
    };
}

/**
 * Maps a database conversation record to the shared ConversationDetail type.
 *
 * @param record - Database conversation record.
 * @returns Mapped ConversationDetail.
 */
export function mapConversationDetailRecord(record: any): ConversationDetail {
    const participants = Array.isArray(record.participants)
        ? record.participants.map(mapParticipantRecord)
        : [];

    return {
        conversationId: record.conversationId,
        type: record.type || 'DIRECT',
        createdAt:
            record.createdAt instanceof Date
                ? record.createdAt.toISOString()
                : new Date(record.createdAt).toISOString(),
        updatedAt: record.updatedAt
            ? record.updatedAt instanceof Date
                ? record.updatedAt.toISOString()
                : new Date(record.updatedAt).toISOString()
            : null,
        participants,
    };
}
