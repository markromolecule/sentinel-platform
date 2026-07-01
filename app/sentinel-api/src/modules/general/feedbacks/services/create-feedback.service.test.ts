import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createFeedback } from './create-feedback.service';
import { createFeedbackData } from '../data/create-feedback';
import { getFeedbackData } from '../data/get-feedback';

vi.mock('../data/create-feedback', () => ({
    createFeedbackData: vi.fn(),
}));

vi.mock('../data/get-feedback', () => ({
    getFeedbackData: vi.fn(),
}));

type QueryResult = unknown;

function createMockDbClient(sequence: QueryResult[]) {
    let index = 0;

    return {
        selectFrom: () => {
            const selectChain = {
                where: () => ({
                    where: () => ({
                        executeTakeFirst: async () => sequence[index++],
                    }),
                    executeTakeFirst: async () => sequence[index++],
                }),
            };

            return {
                select: () => selectChain,
                innerJoin: () => ({
                    leftJoin: () => ({
                        select: () => selectChain,
                    }),
                }),
            };
        },
    } as any;
}

describe('createFeedback', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns 403 when the user is not a student', async () => {
        const dbClient = createMockDbClient([undefined]);

        await expect(
            createFeedback(dbClient, {
                userId: '11111111-1111-4111-8111-111111111111',
                payload: {
                    attemptId: '22222222-2222-4222-8222-222222222222',
                    rating: 4,
                },
            }),
        ).rejects.toThrowError('Forbidden. Only students can submit feedback.');
    });

    it('returns 404 when the attempt does not belong to the student', async () => {
        const dbClient = createMockDbClient([
            {
                student_id: '33333333-3333-4333-8333-333333333333',
            },
            undefined,
        ]);

        await expect(
            createFeedback(dbClient, {
                userId: '11111111-1111-4111-8111-111111111111',
                payload: {
                    attemptId: '22222222-2222-4222-8222-222222222222',
                    rating: 4,
                },
            }),
        ).rejects.toThrowError('Completed attempt not found.');
    });

    it('returns 409 when the owned attempt is not completed', async () => {
        const dbClient = createMockDbClient([
            {
                student_id: '33333333-3333-4333-8333-333333333333',
            },
            {
                attemptId: '22222222-2222-4222-8222-222222222222',
                completedAt: null,
                examId: '44444444-4444-4444-8444-444444444444',
                studentId: '33333333-3333-4333-8333-333333333333',
                institutionId: '55555555-5555-4555-8555-555555555555',
            },
        ]);

        await expect(
            createFeedback(dbClient, {
                userId: '11111111-1111-4111-8111-111111111111',
                payload: {
                    attemptId: '22222222-2222-4222-8222-222222222222',
                    rating: 3,
                },
            }),
        ).rejects.toThrowError('Feedback can only be submitted for a completed attempt.');
    });

    it('returns 409 when feedback already exists for the attempt', async () => {
        const dbClient = createMockDbClient([
            {
                student_id: '33333333-3333-4333-8333-333333333333',
            },
            {
                attemptId: '22222222-2222-4222-8222-222222222222',
                completedAt: new Date('2026-07-01T11:00:00.000Z'),
                examId: '44444444-4444-4444-8444-444444444444',
                studentId: '33333333-3333-4333-8333-333333333333',
                institutionId: '55555555-5555-4555-8555-555555555555',
            },
            {
                feedback_id: '66666666-6666-4666-8666-666666666666',
            },
        ]);

        await expect(
            createFeedback(dbClient, {
                userId: '11111111-1111-4111-8111-111111111111',
                payload: {
                    attemptId: '22222222-2222-4222-8222-222222222222',
                    rating: 5,
                },
            }),
        ).rejects.toThrowError('Feedback for this attempt has already been submitted.');
    });

    it('creates feedback for a completed owned attempt and trims experience', async () => {
        vi.mocked(createFeedbackData).mockResolvedValue({
            feedback_id: '66666666-6666-4666-8666-666666666666',
        } as any);
        vi.mocked(getFeedbackData).mockResolvedValue({
            feedbackId: '66666666-6666-4666-8666-666666666666',
            attemptId: '22222222-2222-4222-8222-222222222222',
            examId: '44444444-4444-4444-8444-444444444444',
            examTitle: 'Feedback Exam',
            studentId: '33333333-3333-4333-8333-333333333333',
            studentUserId: '11111111-1111-4111-8111-111111111111',
            studentNumber: '2026-0001',
            studentName: 'Feedback Student',
            studentEmail: 'feedback@sentinel.test',
            institutionId: '55555555-5555-4555-8555-555555555555',
            institutionName: 'Feedback Institution',
            rating: 5,
            experience: 'Helpful and smooth.',
            createdAt: new Date('2026-07-01T12:00:00.000Z'),
            updatedAt: new Date('2026-07-01T12:00:00.000Z'),
        } as any);

        const dbClient = createMockDbClient([
            {
                student_id: '33333333-3333-4333-8333-333333333333',
            },
            {
                attemptId: '22222222-2222-4222-8222-222222222222',
                completedAt: new Date('2026-07-01T11:00:00.000Z'),
                examId: '44444444-4444-4444-8444-444444444444',
                studentId: '33333333-3333-4333-8333-333333333333',
                institutionId: '55555555-5555-4555-8555-555555555555',
            },
            undefined,
        ]);

        const result = await createFeedback(dbClient, {
            userId: '11111111-1111-4111-8111-111111111111',
            payload: {
                attemptId: '22222222-2222-4222-8222-222222222222',
                rating: 5,
                experience: '  Helpful and smooth.  ',
            },
        });

        expect(createFeedbackData).toHaveBeenCalledWith(
            dbClient,
            expect.objectContaining({
                attempt_id: '22222222-2222-4222-8222-222222222222',
                experience: 'Helpful and smooth.',
            }),
        );
        expect(getFeedbackData).toHaveBeenCalledWith(
            dbClient,
            '66666666-6666-4666-8666-666666666666',
        );
        expect(result).toEqual({
            feedbackId: '66666666-6666-4666-8666-666666666666',
            attemptId: '22222222-2222-4222-8222-222222222222',
            examId: '44444444-4444-4444-8444-444444444444',
            examTitle: 'Feedback Exam',
            studentId: '33333333-3333-4333-8333-333333333333',
            studentUserId: '11111111-1111-4111-8111-111111111111',
            studentNumber: '2026-0001',
            studentName: 'Feedback Student',
            studentEmail: 'feedback@sentinel.test',
            institutionId: '55555555-5555-4555-8555-555555555555',
            institutionName: 'Feedback Institution',
            rating: 5,
            experience: 'Helpful and smooth.',
            createdAt: '2026-07-01T12:00:00.000Z',
            updatedAt: '2026-07-01T12:00:00.000Z',
        });
    });
});
