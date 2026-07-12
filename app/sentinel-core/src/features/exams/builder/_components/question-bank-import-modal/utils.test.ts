import { describe, expect, it } from 'vitest';
import { getPaginationItems } from './utils';

describe('getPaginationItems helper', () => {
    it('returns empty array if totalPages is 1 or less', () => {
        expect(getPaginationItems(1, 1)).toEqual([]);
        expect(getPaginationItems(1, 0)).toEqual([]);
    });

    it('returns all page numbers when totalPages is small', () => {
        expect(getPaginationItems(1, 3)).toEqual([1, 2, 3]);
    });

    it('shows ellipses in the middle when page is in the center', () => {
        expect(getPaginationItems(5, 10)).toEqual([1, 'ellipsis', 4, 5, 6, 'ellipsis', 10]);
    });

    it('shows only trailing ellipsis when page is near the start', () => {
        expect(getPaginationItems(2, 10)).toEqual([1, 2, 3, 'ellipsis', 10]);
    });

    it('shows only leading ellipsis when page is near the end', () => {
        expect(getPaginationItems(9, 10)).toEqual([1, 'ellipsis', 8, 9, 10]);
    });
});
