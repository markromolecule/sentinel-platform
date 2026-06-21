import { describe, expect, it } from 'vitest';
import { isPaginatedResult, paginateItems } from './pagination';

describe('paginateItems', () => {
    it('returns the original list when pagination is omitted', () => {
        const items = ['a', 'b', 'c'];

        const result = paginateItems(items);

        expect(result).toEqual(items);
        expect(isPaginatedResult(result)).toBe(false);
    });

    it('defaults the missing pageSize to 20 when only page is provided', () => {
        const items = Array.from({ length: 22 }, (_, index) => `item-${index + 1}`);

        const result = paginateItems(items, 2);

        expect(isPaginatedResult(result)).toBe(true);
        if (isPaginatedResult(result)) {
            expect(result.items).toHaveLength(2);
            expect(result.pagination).toEqual({
                page: 2,
                pageSize: 20,
                total: 22,
                totalPages: 2,
                hasMore: false,
            });
        }
    });

    it('returns correct totalPages and hasMore when mid-page', () => {
        const items = Array.from({ length: 25 }, (_, index) => `item-${index + 1}`);

        const result = paginateItems(items, 1, 10);

        expect(isPaginatedResult(result)).toBe(true);
        if (isPaginatedResult(result)) {
            expect(result.items).toHaveLength(10);
            expect(result.pagination).toEqual({
                page: 1,
                pageSize: 10,
                total: 25,
                totalPages: 3,
                hasMore: true,
            });
        }
    });
});
