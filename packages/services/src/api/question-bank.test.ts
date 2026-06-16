import { describe, expect, it, vi } from 'vitest';
import {
    getQuestionBankCollectionShares,
    shareQuestionBankCollection,
} from './question-bank';

describe('question bank api client services', () => {
    it('fetches collection shares and maps the response shape', async () => {
        const apiClient = vi.fn().mockResolvedValue({
            data: [
                {
                    user_id: 'user-1',
                    first_name: 'Alice',
                    last_name: 'Smith',
                    email: 'alice@example.com',
                },
            ],
        });

        const result = await getQuestionBankCollectionShares(apiClient, 'collection-1');

        expect(apiClient).toHaveBeenCalledWith('/question-bank/collections/collection-1/shares');
        expect(result).toEqual([
            {
                userId: 'user-1',
                firstName: 'Alice',
                lastName: 'Smith',
                email: 'alice@example.com',
            },
        ]);
    });

    it('shares a collection with the provided user list', async () => {
        const apiClient = vi.fn().mockResolvedValue({
            data: [],
        });

        await shareQuestionBankCollection(apiClient, {
            id: 'collection-1',
            payload: {
                userIds: ['user-1', 'user-2'],
            },
        });

        expect(apiClient).toHaveBeenCalledWith(
            '/question-bank/collections/collection-1/shares',
            expect.objectContaining({
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userIds: ['user-1', 'user-2'],
                }),
            }),
        );
    });
});
