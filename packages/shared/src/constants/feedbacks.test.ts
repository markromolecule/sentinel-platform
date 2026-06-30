import { describe, expect, it } from 'vitest';
import { FEEDBACK_QUERY_KEYS } from './feedbacks';

describe('FEEDBACK_QUERY_KEYS', () => {
    it('builds base keys', () => {
        expect(FEEDBACK_QUERY_KEYS.all).toEqual(['feedbacks']);
        expect(FEEDBACK_QUERY_KEYS.lists()).toEqual(['feedbacks', 'list']);
        expect(FEEDBACK_QUERY_KEYS.details()).toEqual(['feedbacks', 'detail']);
    });

    it('builds keyed list and detail entries', () => {
        expect(FEEDBACK_QUERY_KEYS.list({ page: 1 })).toEqual(['feedbacks', 'list', { page: 1 }]);
        expect(FEEDBACK_QUERY_KEYS.detail('abc')).toEqual(['feedbacks', 'detail', 'abc']);
    });
});
