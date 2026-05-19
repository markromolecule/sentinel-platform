import { describe, it, expect } from 'vitest';
import { verifyRequesterPermissions } from './verify-requester-permissions';
import {
    resolveStudentWhitelistInstitutionId,
    resolveStudentWhitelistQueryScope,
} from './resolve-student-whitelist-scope';

describe('Student Whitelist Helpers', () => {
    describe('verifyRequesterPermissions', () => {
        it('should throw error for admin without institutionId', () => {
            expect(() =>
                verifyRequesterPermissions({
                    requesterRole: 'admin',
                    requesterInstitutionId: undefined,
                }),
            ).toThrow('Forbidden: No institution assigned to this admin account');
        });

        it('should NOT throw error for superadmin without institutionId', () => {
            expect(() =>
                verifyRequesterPermissions({
                    requesterRole: 'superadmin',
                    requesterInstitutionId: undefined,
                }),
            ).not.toThrow();
        });

        it('should NOT throw error for support without institutionId', () => {
            expect(() =>
                verifyRequesterPermissions({
                    requesterRole: 'support',
                    requesterInstitutionId: undefined,
                }),
            ).not.toThrow();
        });
    });

    describe('resolveStudentWhitelistInstitutionId', () => {
        it('should return requestedInstitutionId for support regardless of assigned institution', () => {
            const result = resolveStudentWhitelistInstitutionId({
                requesterRole: 'support',
                requesterInstitutionId: 'assigned-id',
                requestedInstitutionId: 'requested-id',
            });
            expect(result).toBe('requested-id');
        });

        it('should return undefined for support if no institution requested', () => {
            const result = resolveStudentWhitelistInstitutionId({
                requesterRole: 'support',
                requesterInstitutionId: 'assigned-id',
                requestedInstitutionId: undefined,
            });
            expect(result).toBeUndefined();
        });

        it('should return requestedInstitutionId for superadmin', () => {
            const result = resolveStudentWhitelistInstitutionId({
                requesterRole: 'superadmin',
                requesterInstitutionId: undefined,
                requestedInstitutionId: 'requested-id',
            });
            expect(result).toBe('requested-id');
        });

        it('should return assigned institution for superadmin when linked to an institution', () => {
            const result = resolveStudentWhitelistInstitutionId({
                requesterRole: 'superadmin',
                requesterInstitutionId: 'assigned-id',
                requestedInstitutionId: 'requested-id',
            });
            expect(result).toBe('assigned-id');
        });

        it('should return assigned institution for admin', () => {
            const result = resolveStudentWhitelistInstitutionId({
                requesterRole: 'admin',
                requesterInstitutionId: 'assigned-id',
                requestedInstitutionId: 'requested-id',
            });
            expect(result).toBe('assigned-id');
        });
    });

    describe('resolveStudentWhitelistQueryScope', () => {
        it('should resolve global scope for support when no filters applied', () => {
            const result = resolveStudentWhitelistQueryScope({
                requesterRole: 'support',
                requesterInstitutionId: 'any',
                departmentId: 'dept-id',
                courseId: 'course-id',
            });
            expect(result.institutionId).toBeUndefined();
            expect(result.departmentId).toBe('dept-id');
            expect(result.courseId).toBe('course-id');
        });

        it('should restrict scope for admin based on profile', () => {
            const result = resolveStudentWhitelistQueryScope({
                requesterRole: 'admin',
                requesterInstitutionId: 'inst-id',
                requesterDepartmentId: 'profile-dept',
                requesterCourseId: 'profile-course',
                departmentId: 'other-dept',
                courseId: 'other-course',
            });
            expect(result.institutionId).toBe('inst-id');
            expect(result.departmentId).toBe('profile-dept');
            expect(result.courseId).toBe('profile-course');
        });
    });
});
