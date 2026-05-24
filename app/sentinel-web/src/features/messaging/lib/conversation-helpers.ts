import type { ConversationDetail, ConversationSummary, MessageParticipant } from '@sentinel/shared/types';

type ConversationLike = ConversationSummary | ConversationDetail;

const ACTIVE_THRESHOLD_MS = 5 * 60 * 1000;

/**
 * Returns the non-current participant for direct-message displays.
 */
export function getPrimaryParticipant(
    conversation: ConversationLike | null | undefined,
    currentUserId: string | null | undefined,
) {
    if (!conversation) {
        return null;
    }

    return (
        conversation.participants.find((participant) => participant.userId !== currentUserId) ??
        conversation.participants[0] ??
        null
    );
}

/**
 * Derives the display activity state from presence, backend status, and last-seen fallback.
 */
export function getParticipantActivity(
    participant: MessageParticipant | null | undefined,
    onlineUserIds: Set<string>,
    now = new Date(),
) {
    if (!participant) {
        return {
            isActive: false,
            label: 'Offline',
        };
    }

    if (participant.status === 'INACTIVE') {
        return {
            isActive: false,
            label: 'Inactive',
        };
    }

    if (onlineUserIds.has(participant.userId)) {
        return {
            isActive: true,
            label: 'Active now',
        };
    }

    if (participant.lastSeenAt) {
        const lastSeenAt = new Date(participant.lastSeenAt);

        if (!Number.isNaN(lastSeenAt.getTime()) && now.getTime() - lastSeenAt.getTime() <= ACTIVE_THRESHOLD_MS) {
            return {
                isActive: true,
                label: 'Active now',
            };
        }
    }

    return {
        isActive: false,
        label: 'Offline',
    };
}

/**
 * Filters a conversation by participant identity, institution, or message preview.
 */
export function matchesConversationSearch(
    conversation: ConversationSummary,
    currentUserId: string | null | undefined,
    searchTerm: string,
) {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
        return true;
    }

    const participant = getPrimaryParticipant(conversation, currentUserId);
    const searchableParts = [
        participant?.name,
        participant?.role,
        participant?.institution?.name,
        conversation.lastMessage?.content,
    ].filter(Boolean);

    return searchableParts.some((value) => value?.toLowerCase().includes(normalizedSearch));
}

/**
 * Builds initials for avatar fallbacks.
 */
export function getParticipantInitials(name: string | null | undefined) {
    if (!name) {
        return 'U';
    }

    const parts = name
        .split(' ')
        .map((part) => part.trim())
        .filter(Boolean);

    if (parts.length === 0) {
        return 'U';
    }

    return parts
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('');
}
