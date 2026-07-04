import type { DbClient } from '@sentinel/db';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../access/data/entitlements.repository', () => ({
    EntitlementsRepository: {
        getStudentProfileByUserId: vi.fn(),
        getInstructorProfileByUserId: vi.fn(),
    },
}));

vi.mock('../../identity/users/data/resolve-target-user-role', () => ({
    resolveTargetUserRole: vi.fn(),
}));

import { EntitlementsRepository } from '../access/data/entitlements.repository';
import { resolveTargetUserRole } from '../../identity/users/data/resolve-target-user-role';
import {
    assertAssessmentAccess,
    assertAssessmentReadAccess,
    normalizeAssessmentRole,
    resolveAssessmentActorRole,
    resolveAssessmentInstitutionId,
    resolveAssessmentReadScope,
} from './assessment-access';


describe('assessment access', () => {
    const mockDb = {} as DbClient;

    const createMockContext = (permissions: Set<string>, role?: string) =>
        ({
            get: (key: string) => {
                if (key === 'activePermissionKeys') return permissions;
                if (key === 'role') return role || null;
                return null;
            },
        }) as any;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(EntitlementsRepository.getStudentProfileByUserId).mockResolvedValue(null);
        vi.mocked(EntitlementsRepository.getInstructorProfileByUserId).mockResolvedValue(null);
    });

    it('allows students to use read-only assessment routes', () => {
        expect(() => assertAssessmentReadAccess('student')).not.toThrow();
    });

    it('keeps student accounts blocked from write-capable assessment routes', () => {
        expect(() => assertAssessmentAccess('student')).toThrowError(
            'Forbidden. Insufficient permissions.',
        );
    });

    it('normalizes role casing and spacing', () => {
        expect(normalizeAssessmentRole(' Student ')).toBe('student');
    });

    it('falls back to the resolved db role when the claim is missing', async () => {
        vi.mocked(resolveTargetUserRole).mockResolvedValue('student');

        await expect(
            resolveAssessmentActorRole({
                dbClient: mockDb,
                userId: 'user-1',
                claimedRole: null,
            }),
        ).resolves.toBe('student');
    });

    it('treats a user with a student profile as student when no claim exists', async () => {
        vi.mocked(resolveTargetUserRole).mockResolvedValue(null);
        vi.mocked(EntitlementsRepository.getStudentProfileByUserId).mockResolvedValue({
            student_id: 'student-1',
            institution_id: 'institution-1',
        });

        await expect(
            resolveAssessmentActorRole({
                dbClient: mockDb,
                userId: 'user-1',
                claimedRole: null,
            }),
        ).resolves.toBe('student');
    });

    it('treats a user with an instructor profile as instructor when no claim exists', async () => {
        vi.mocked(resolveTargetUserRole).mockResolvedValue(null);
        vi.mocked(EntitlementsRepository.getInstructorProfileByUserId).mockResolvedValue({
            instructor_id: 'instructor-1',
            institution_id: 'institution-1',
        });

        await expect(
            resolveAssessmentActorRole({
                dbClient: mockDb,
                userId: 'user-1',
                claimedRole: null,
            }),
        ).resolves.toBe('instructor');
    });

    describe('dynamic RBAC assertAssessmentAccess', () => {
        it('allows access if assessments:manage permission is active', () => {
            const ctx = createMockContext(new Set(['assessments:manage']));
            expect(() => assertAssessmentAccess(ctx)).not.toThrow();
        });

        it('throws 403 if assessments:manage permission is missing', () => {
            const ctx = createMockContext(new Set(['assessments:view']));
            expect(() => assertAssessmentAccess(ctx)).toThrowError(
                'Forbidden. Insufficient permissions.',
            );
        });
    });

    describe('dynamic RBAC assertAssessmentReadAccess', () => {
        it('allows access if assessments:view permission is active', () => {
            const ctx = createMockContext(new Set(['assessments:view']));
            expect(() => assertAssessmentReadAccess(ctx)).not.toThrow();
        });

        it('allows access if role is student, bypassing missing assessments:view permission', () => {
            const ctx = createMockContext(new Set(['something:else']), 'student');
            expect(() => assertAssessmentReadAccess(ctx)).not.toThrow();
        });

        it('throws 403 if assessments:view permission is missing', () => {
            const ctx = createMockContext(new Set(['something:else']));
            expect(() => assertAssessmentReadAccess(ctx)).toThrowError(
                'Forbidden. Insufficient permissions.',
            );
        });
    });

    describe('dynamic RBAC resolveAssessmentInstitutionId', () => {
        it('resolves requested institution for cross-tenant users via active permissions', () => {
            const activePermissionKeys = new Set(['institutions:cross-tenant-view']);
            const res = resolveAssessmentInstitutionId({
                activePermissionKeys,
                contextInstitutionId: 'context-1',
                requestedInstitutionId: 'requested-1',
            });
            expect(res).toBe('requested-1');
        });

        it('falls back to context institution for non-cross-tenant users even if requested is specified', () => {
            const activePermissionKeys = new Set(['something:else']);
            const res = resolveAssessmentInstitutionId({
                activePermissionKeys,
                contextInstitutionId: 'context-1',
                requestedInstitutionId: 'requested-1',
            });
            expect(res).toBe('context-1');
        });
    });

    describe('resolveAssessmentReadScope', () => {
        it('resolves student scope correctly', async () => {
            vi.mocked(resolveTargetUserRole).mockResolvedValue('student');
            vi.mocked(EntitlementsRepository.getStudentProfileByUserId).mockResolvedValue({
                student_id: 'student-1',
                institution_id: 'institution-1',
            });

            const res = await resolveAssessmentReadScope({
                dbClient: mockDb,
                user: { id: 'user-1' },
                claimedRole: null,
                contextInstitutionId: 'institution-1',
            });

            expect(res).toEqual({
                role: 'student',
                institutionId: 'institution-1',
                studentUserId: 'user-1',
                departmentId: undefined,
                instructorUserId: undefined,
            });
        });

        it('resolves instructor scope correctly', async () => {
            vi.mocked(resolveTargetUserRole).mockResolvedValue('instructor');

            const res = await resolveAssessmentReadScope({
                dbClient: mockDb,
                user: { id: 'user-2' },
                claimedRole: 'instructor',
                contextInstitutionId: 'institution-1',
            });

            expect(res).toEqual({
                role: 'instructor',
                institutionId: 'institution-1',
                studentUserId: undefined,
                departmentId: undefined,
                instructorUserId: 'user-2',
            });
        });

        it('resolves admin scope with departmentId correctly', async () => {
            vi.mocked(resolveTargetUserRole).mockResolvedValue('admin');

            const res = await resolveAssessmentReadScope({
                dbClient: mockDb,
                user: { id: 'user-3', user_profiles: { department_id: 'dept-1' } },
                claimedRole: 'admin',
                contextInstitutionId: 'institution-1',
            });

            expect(res).toEqual({
                role: 'admin',
                institutionId: 'institution-1',
                studentUserId: undefined,
                departmentId: 'dept-1',
                instructorUserId: 'user-3',
            });
        });

        it('resolves cross-tenant support scope correctly', async () => {
            vi.mocked(resolveTargetUserRole).mockResolvedValue('support');

            const res = await resolveAssessmentReadScope({
                dbClient: mockDb,
                user: { id: 'user-4' },
                claimedRole: 'support',
                contextInstitutionId: 'institution-1',
                requestedInstitutionId: 'requested-2',
            });

            expect(res).toEqual({
                role: 'support',
                institutionId: 'requested-2',
                studentUserId: undefined,
                departmentId: undefined,
                instructorUserId: undefined,
            });
        });
    });
});

