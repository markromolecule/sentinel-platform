import { describe, expect, it, vi } from 'vitest';
import { buildFeedbacksQueryString, createFeedback, getFeedback, getFeedbacks } from './feedbacks';

describe('feedbacks api', () => {
    it('builds the feedback query string while skipping empty values', () => {
        expect(
            buildFeedbacksQueryString({
                page: 2,
                pageSize: 20,
                search: '',
                rating: 4,
            }),
        ).toBe('?page=2&pageSize=20&rating=4');
    });

    it('unwraps createFeedback responses', async () => {
        const apiClient = vi.fn().mockResolvedValue({
            success: true,
            message: 'ok',
            data: { feedbackId: 'abc' },
        });

        const result = await createFeedback(apiClient as any, {
            attemptId: '11111111-1111-4111-8111-111111111111',
            rating: 5,
        });

        expect(apiClient).toHaveBeenCalledWith(
            '/feedbacks',
            expect.objectContaining({ method: 'POST' }),
        );
        expect(result).toEqual({ feedbackId: 'abc' });
    });

    it('unwraps getFeedbacks and getFeedback responses', async () => {
        const apiClient = vi
            .fn()
            .mockResolvedValueOnce({
                success: true,
                message: 'ok',
                data: { items: [], page: 1, pageSize: 10, total: 0, totalPages: 0, hasMore: false },
            })
            .mockResolvedValueOnce({
                success: true,
                message: 'ok',
                data: { feedbackId: 'abc' },
            });

        const list = await getFeedbacks(apiClient as any, { page: 1 });
        const detail = await getFeedback(apiClient as any, 'abc');

        expect(list.total).toBe(0);
        expect(detail.feedbackId).toBe('abc');
    });
});
