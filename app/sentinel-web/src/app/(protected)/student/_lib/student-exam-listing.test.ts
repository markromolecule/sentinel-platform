import { describe, expect, it } from 'vitest';
import { groupItemsByDate } from './student-exam-listing';

describe('studentExamListing helpers', () => {
    it('groups items by day in ascending order', () => {
        const groups = groupItemsByDate({
            items: [
                { id: 'b', date: '2026-04-20T09:00:00.000Z' },
                { id: 'a', date: '2026-04-18T09:00:00.000Z' },
                { id: 'c', date: '2026-04-20T11:00:00.000Z' },
            ],
            getDate: (item) => item.date,
            sortDirection: 'asc',
        });

        expect(groups).toHaveLength(2);
        expect(groups[0]?.key).toBe('2026-04-18');
        expect(groups[0]?.items.map((item) => item.id)).toEqual(['a']);
        expect(groups[1]?.key).toBe('2026-04-20');
        expect(groups[1]?.items.map((item) => item.id)).toEqual(['b', 'c']);
    });
});
