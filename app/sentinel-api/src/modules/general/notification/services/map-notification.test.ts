import { describe, expect, it } from 'vitest';
import { mapNotification } from './map-notification';

describe('mapNotification', () => {
    it('maps UUID resource ID correctly', () => {
        const record = {
            id: '11111111-1111-1111-1111-111111111111',
            title: 'Test Title',
            message: 'Test Message',
            status: 'UNREAD' as const,
            actionType: 'EXAM_ASSIGNMENT_CREATED' as const,
            institutionId: '22222222-2222-2222-2222-222222222222',
            actorId: '33333333-3333-3333-3333-333333333333',
            actorName: 'John Doe',
            resourceType: 'EXAM_ASSIGNMENT' as const,
            resourceId: '44444444-4444-4444-4444-444444444444',
            resourceLabel: 'Midterm',
            metadata: null,
            createdAt: new Date('2026-06-10T12:00:00Z'),
            readAt: null,
        };

        const result = mapNotification(record);

        expect(result.resource.id).toBe('44444444-4444-4444-4444-444444444444');
    });

    it('falls back to originalResourceId in metadata when resourceId is null', () => {
        const record = {
            id: '11111111-1111-1111-1111-111111111111',
            title: 'Test Title',
            message: 'Test Message',
            status: 'UNREAD' as const,
            actionType: 'INSTITUTION_ACTIVITY_TRANSACTION_COMPLETED' as const,
            institutionId: '22222222-2222-2222-2222-222222222222',
            actorId: '33333333-3333-3333-3333-333333333333',
            actorName: 'John Doe',
            resourceType: 'INSTITUTION_ACTIVITY' as const,
            resourceId: null,
            resourceLabel: 'Admin Role',
            metadata: {
                originalResourceId: '7',
            },
            createdAt: new Date('2026-06-10T12:00:00Z'),
            readAt: null,
        };

        const result = mapNotification(record);

        expect(result.resource.id).toBe('7');
    });
});
