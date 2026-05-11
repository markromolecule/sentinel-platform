import { describe, expect, it, vi } from 'vitest';
import { applyRequesterLimits } from './get-users.filters';
import { EFFECTIVE_ROLE_NAME_SQL } from './get-users.query';

function createMockQuery() {
    return {
        where: vi.fn().mockReturnThis(),
    };
}

describe('applyRequesterLimits', () => {
    it('keeps explicit instructor role filters for instructor requesters', () => {
        const query = createMockQuery();

        const result = applyRequesterLimits(
            query as any,
            {
                dbClient: {} as any,
                requesterRole: 'instructor',
                requesterUserId: '11111111-1111-4111-8111-111111111111',
                roleFilter: 'instructor',
                roleFilters: ['instructor'],
            },
            false,
        );

        expect(result).toBe(query);
        expect(query.where).toHaveBeenCalledTimes(1);
        expect(query.where).toHaveBeenCalledWith(EFFECTIVE_ROLE_NAME_SQL, '=', 'instructor');
    });

    it('defaults instructor requesters to scoped student results when no instructor filter is requested', () => {
        const query = createMockQuery();

        const result = applyRequesterLimits(
            query as any,
            {
                dbClient: {} as any,
                requesterRole: 'instructor',
                requesterUserId: '11111111-1111-4111-8111-111111111111',
            },
            false,
        );

        expect(result).toBe(query);
        expect(query.where).toHaveBeenCalledTimes(2);
        expect(query.where).toHaveBeenNthCalledWith(1, EFFECTIVE_ROLE_NAME_SQL, '=', 'student');
        expect(query.where).toHaveBeenNthCalledWith(2, expect.any(Function));
    });
});
