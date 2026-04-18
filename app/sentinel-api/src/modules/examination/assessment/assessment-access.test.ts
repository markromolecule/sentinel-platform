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
} from './assessment-access';

describe('assessment access', () => {
    const mockDb = {} as DbClient;

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
});
