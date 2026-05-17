import { describe, it, expect } from 'vitest';
import { buildRequesterAcademicScope, resolveAcademicQueryScope } from './context';

describe('Academic Query Scope Resolution', () => {
    it('allows support role to remain global', () => {
        const scope = buildRequesterAcademicScope({
            requesterRole: 'support',
            requesterInstitutionId: undefined,
            requesterDepartmentId: null,
            requesterCourseId: null,
        });

        const result = resolveAcademicQueryScope(scope, {
            requestedInstitutionId: 'inst-123',
        });

        expect(result.institutionId).toBe('inst-123');
    });

    it('allows global superadmin (unassigned to an institution) to remain global', () => {
        const scope = buildRequesterAcademicScope({
            requesterRole: 'superadmin',
            requesterInstitutionId: undefined,
            requesterDepartmentId: null,
            requesterCourseId: null,
        });

        const result = resolveAcademicQueryScope(scope, {
            requestedInstitutionId: 'inst-456',
        });

        expect(result.institutionId).toBe('inst-456');
    });

    it('restricts scoped superadmin (assigned to an institution) to their assigned institution', () => {
        const scope = buildRequesterAcademicScope({
            requesterRole: 'superadmin',
            requesterInstitutionId: 'inst-789',
            requesterDepartmentId: null,
            requesterCourseId: null,
        });

        const result = resolveAcademicQueryScope(scope, {
            requestedInstitutionId: 'inst-different',
        });

        expect(result.institutionId).toBe('inst-789');
    });

    it('restricts scoped admin to their assigned institution', () => {
        const scope = buildRequesterAcademicScope({
            requesterRole: 'admin',
            requesterInstitutionId: 'inst-abc',
            requesterDepartmentId: null,
            requesterCourseId: null,
        });

        const result = resolveAcademicQueryScope(scope, {
            requestedInstitutionId: 'inst-different',
        });

        expect(result.institutionId).toBe('inst-abc');
    });
});
