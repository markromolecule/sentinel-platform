import type { DbClient } from '@sentinel/db';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../access/data/entitlements.repository', () => ({
    EntitlementsRepository: {
        getStudentProfileByUserId: vi.fn(),
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
} from './assessment-access';

describe('assessment access', () => {
    const mockDb = {} as DbClient;

    const createMockContext = (permissions: Set<string>) =>
        ({
            get: (key: string) => {
                if (key === 'activePermissionKeys') return permissions;
                return null;
            },
        }) as any;

    beforeEach(() => {
        vi.clearAllMocks();
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
});
