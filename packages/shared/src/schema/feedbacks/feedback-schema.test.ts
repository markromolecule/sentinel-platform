import { describe, expect, it } from 'vitest';
import {
    createFeedbackSchema,
    feedbackRecordSchema,
    getFeedbacksQuerySchema,
} from './feedback-schema';

describe('feedback-schema', () => {
    it('accepts a valid create payload with optional experience omitted', () => {
        const result = createFeedbackSchema.parse({
            attemptId: '11111111-1111-4111-8111-111111111111',
            rating: 5,
        });

        expect(result.rating).toBe(5);
        expect(result.experience).toBeUndefined();
    });

    it('rejects ratings outside the supported range', () => {
        expect(() =>
            createFeedbackSchema.parse({
                attemptId: '11111111-1111-4111-8111-111111111111',
                rating: 0,
            }),
        ).toThrow();

        expect(() =>
            createFeedbackSchema.parse({
                attemptId: '11111111-1111-4111-8111-111111111111',
                rating: 6,
            }),
        ).toThrow();
    });

    it('applies feedback list query defaults', () => {
        expect(getFeedbacksQuerySchema.parse({})).toEqual({
            page: 1,
            pageSize: 10,
            sortBy: 'createdAt',
            sortOrder: 'desc',
        });
    });

    it('rejects invalid query values', () => {
        expect(() => getFeedbacksQuerySchema.parse({ page: 0 })).toThrow();
        expect(() => getFeedbacksQuerySchema.parse({ pageSize: 101 })).toThrow();
        expect(() => getFeedbacksQuerySchema.parse({ examId: 'not-a-uuid' })).toThrow();
    });

    it('accepts a fully shaped feedback record', () => {
        const result = feedbackRecordSchema.parse({
            feedbackId: '11111111-1111-4111-8111-111111111111',
            attemptId: '22222222-2222-4222-8222-222222222222',
            examId: '33333333-3333-4333-8333-333333333333',
            examTitle: 'Midterm',
            studentId: '44444444-4444-4444-8444-444444444444',
            studentUserId: '55555555-5555-4555-8555-555555555555',
            studentNumber: '2026-0001',
            studentName: 'Jane Doe',
            studentEmail: 'jane@example.com',
            institutionId: '66666666-6666-4666-8666-666666666666',
            institutionName: 'Sentinel University',
            rating: 4,
            experience: 'Everything worked well.',
            createdAt: '2026-06-30T12:00:00.000Z',
            updatedAt: '2026-06-30T12:00:00.000Z',
        });

        expect(result.studentName).toBe('Jane Doe');
    });
});
