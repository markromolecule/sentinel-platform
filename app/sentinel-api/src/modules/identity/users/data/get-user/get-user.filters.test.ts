import { describe, expect, it, vi } from 'vitest';
import { applyInstitutionScope, applyRequesterLimits } from './get-user.filters';

function createMockQuery() {
    return {
        where: vi.fn().mockReturnThis(),
    };
}

describe('getUserFilters', () => {
    describe('applyInstitutionScope', () => {
        it('applies institution filter for non-superadmin/non-support users', () => {
            const query = createMockQuery();
            const result = applyInstitutionScope(query as any, {
                dbClient: {} as any,
                id: 'target-user-id',
                institutionId: 'inst-123',
                requesterRole: 'instructor',
            });

            expect(result).toBe(query);
            expect(query.where).toHaveBeenCalledWith('up.institution_id', '=', 'inst-123');
        });

        it('does not apply institution filter for superadmin', () => {
            const query = createMockQuery();
            const result = applyInstitutionScope(query as any, {
                dbClient: {} as any,
                id: 'target-user-id',
                institutionId: 'inst-123',
                requesterRole: 'superadmin',
            });

            expect(result).toBe(query);
            expect(query.where).not.toHaveBeenCalled();
        });

        it('does not apply institution filter for support', () => {
            const query = createMockQuery();
            const result = applyInstitutionScope(query as any, {
                dbClient: {} as any,
                id: 'target-user-id',
                institutionId: 'inst-123',
                requesterRole: 'support',
            });

            expect(result).toBe(query);
            expect(query.where).not.toHaveBeenCalled();
        });
    });

    describe('applyRequesterLimits', () => {
        it('does not restrict superadmin profiles from instructor or other non-superadmin users', () => {
            const query = createMockQuery();
            const result = applyRequesterLimits(
                query as any,
                {
                    dbClient: {} as any,
                    id: 'target-user-id',
                    requesterRole: 'instructor',
                },
                false,
            );

            expect(result).toBe(query);
            // Verify that we do not filter out SUPERADMIN_ROLE_NAME profiles
            expect(query.where).not.toHaveBeenCalled();
        });

        it('restricts support to superadmin, admin, instructor, support roles', () => {
            const query = createMockQuery();
            const result = applyRequesterLimits(
                query as any,
                {
                    dbClient: {} as any,
                    id: 'target-user-id',
                    requesterRole: 'support',
                    requesterUserId: 'support-user-id',
                },
                false,
            );

            expect(result).toBe(query);
            expect(query.where).toHaveBeenCalledTimes(1);
        });
    });
});
