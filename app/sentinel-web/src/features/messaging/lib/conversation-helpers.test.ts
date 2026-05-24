import { describe, expect, it } from 'vitest';
import {
    getParticipantActivity,
    getParticipantInitials,
    getPrimaryParticipant,
    matchesConversationSearch,
} from './conversation-helpers';
import type { ConversationSummary, MessageParticipant } from '@sentinel/shared/types';

describe('conversation-helpers', () => {
    const currentUserId = '11111111-1111-1111-1111-111111111111';
    const recipientId = '22222222-2222-2222-2222-222222222222';
    const participant: MessageParticipant = {
        userId: recipientId,
        name: 'Riley Santos',
        avatarUrl: null,
        role: 'instructor',
        status: 'ACTIVE',
        institution: {
            id: '33333333-3333-3333-3333-333333333333',
            name: 'Sentinel Main Campus',
        },
        lastSeenAt: '2026-05-24T09:56:00.000Z',
    };
    const conversation: ConversationSummary = {
        conversationId: '44444444-4444-4444-4444-444444444444',
        type: 'DIRECT',
        createdAt: '2026-05-24T09:00:00.000Z',
        updatedAt: '2026-05-24T10:00:00.000Z',
        participants: [
            {
                userId: currentUserId,
                name: 'Current User',
                avatarUrl: null,
                role: 'instructor',
                status: 'ACTIVE',
                institution: null,
                lastSeenAt: null,
            },
            participant,
        ],
        lastMessage: {
            messageId: '55555555-5555-5555-5555-555555555555',
            conversationId: '44444444-4444-4444-4444-444444444444',
            senderId: recipientId,
            content: 'Can you review the branch update?',
            status: 'SENT',
            createdAt: '2026-05-24T10:00:00.000Z',
        },
        unreadCount: 2,
    };

    it('returns the non-current participant for direct conversations', () => {
        expect(getPrimaryParticipant(conversation, currentUserId)?.userId).toBe(recipientId);
    });

    it('marks a participant active when presence includes them', () => {
        const activity = getParticipantActivity(participant, new Set([recipientId]));

        expect(activity).toEqual({
            isActive: true,
            label: 'Active now',
        });
    });

    it('falls back to inactive when backend status is inactive', () => {
        const activity = getParticipantActivity(
            {
                ...participant,
                status: 'INACTIVE',
            },
            new Set([recipientId]),
        );

        expect(activity).toEqual({
            isActive: false,
            label: 'Inactive',
        });
    });

    it('matches conversation search against institution and message text', () => {
        expect(matchesConversationSearch(conversation, currentUserId, 'main campus')).toBe(true);
        expect(matchesConversationSearch(conversation, currentUserId, 'branch update')).toBe(true);
        expect(matchesConversationSearch(conversation, currentUserId, 'missing')).toBe(false);
    });

    it('builds initials from participant names', () => {
        expect(getParticipantInitials('Riley Santos')).toBe('RS');
        expect(getParticipantInitials('Single')).toBe('S');
        expect(getParticipantInitials('')).toBe('U');
    });
});
