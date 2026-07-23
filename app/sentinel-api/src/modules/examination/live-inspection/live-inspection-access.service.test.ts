import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HTTPException } from 'hono/http-exception';
import type { DbClient } from '@sentinel/db';
import { SessionRepository } from '../flow/data/session.repository';
import {
    assertLiveInspectionStudentAccess,
    assertLiveInspectionViewerAccess,
} from './live-inspection-access.service';
import { getExamConfigurationState } from '../configuration/configuration.service';

vi.mock('../flow/data/session.repository', () => ({
    SessionRepository: {
        getOwnedSessionAttempt: vi.fn(),
    },
}));

vi.mock('../configuration/configuration.service', () => ({
    getExamConfigurationState: vi.fn(),
}));

function createDbClient(rows: unknown[]): DbClient {
    const queue = [...rows];
    const builder: Record<string, any> = {
        innerJoin: vi.fn().mockReturnThis(),
        select: vi.fn().mockImplementation((selector) => {
            if (typeof selector === 'function') {
                selector({
                    exists: () => ({ as: vi.fn() }),
                    selectFrom: () => builder,
                });
            }
            return builder;
        }),
        where: vi.fn().mockReturnThis(),
        whereRef: vi.fn().mockReturnThis(),
        executeTakeFirst: vi.fn().mockImplementation(() => Promise.resolve(queue.shift())),
    };

    builder.selectFrom = vi.fn().mockReturnValue(builder);

    return {
        selectFrom: vi.fn().mockReturnValue(builder),
    } as unknown as DbClient;
}

const baseViewerArgs = {
    attemptId: 'attempt-1',
    viewerUserId: 'viewer-1',
    role: 'instructor',
    activeInstitutionId: 'institution-1',
    activePermissionKeys: ['examinations:monitor_live_video'],
};

const baseRecord = {
    attemptId: 'attempt-1',
    examId: 'exam-1',
    institutionId: 'institution-1',
    createdBy: null,
    isAcceptedProctor: false,
    isSectionInstructor: false,
    isClassroomInstructor: false,
};

describe('live inspection access service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it.each([
        ['creator', { createdBy: 'viewer-1' }],
        ['accepted proctor', { isAcceptedProctor: true }],
        ['section instructor', { isSectionInstructor: true }],
        ['classroom instructor', { isClassroomInstructor: true }],
    ])('allows instructor access through %s relationship', async (_, relationship) => {
        const dbClient = createDbClient([{ ...baseRecord, ...relationship }]);

        await expect(
            assertLiveInspectionViewerAccess({ dbClient, ...baseViewerArgs }),
        ).resolves.toMatchObject({ attemptId: 'attempt-1' });
    });

    it('allows admin and superadmin only inside the active institution', async () => {
        const adminDb = createDbClient([{ ...baseRecord, institutionId: 'institution-1' }]);
        await expect(
            assertLiveInspectionViewerAccess({
                dbClient: adminDb,
                ...baseViewerArgs,
                role: 'admin',
            }),
        ).resolves.toMatchObject({ examId: 'exam-1' });

        const crossTenantDb = createDbClient([{ ...baseRecord, institutionId: 'institution-2' }]);
        await expect(
            assertLiveInspectionViewerAccess({
                dbClient: crossTenantDb,
                ...baseViewerArgs,
                role: 'superadmin',
            }),
        ).rejects.toBeInstanceOf(HTTPException);
    });

    it('denies support, students, missing permissions, and share/public-only instructor access', async () => {
        const dbClient = createDbClient([baseRecord]);

        await expect(
            assertLiveInspectionViewerAccess({
                dbClient,
                ...baseViewerArgs,
                role: 'support',
            }),
        ).rejects.toBeInstanceOf(HTTPException);

        await expect(
            assertLiveInspectionViewerAccess({
                dbClient,
                ...baseViewerArgs,
                role: 'student',
            }),
        ).rejects.toBeInstanceOf(HTTPException);

        await expect(
            assertLiveInspectionViewerAccess({
                dbClient,
                ...baseViewerArgs,
                activePermissionKeys: [],
            }),
        ).rejects.toBeInstanceOf(HTTPException);

        await expect(
            assertLiveInspectionViewerAccess({
                dbClient: createDbClient([baseRecord]),
                ...baseViewerArgs,
            }),
        ).rejects.toBeInstanceOf(HTTPException);
    });

    it('allows student-owned incomplete camera-required attempts (raw camera_required = NULL, effective default = true)', async () => {
        vi.mocked(SessionRepository.getOwnedSessionAttempt).mockResolvedValue({
            attempt_id: 'attempt-1',
            exam_id: 'exam-1',
            student_id: 'student-1',
            completed_at: null,
            status: 'IN_PROGRESS',
            started_at: new Date(),
            lifecycle_state: 'IN_PROGRESS',
            institution_id: 'institution-1',
        } as any);

        vi.mocked(getExamConfigurationState).mockResolvedValue({
            configuration: { cameraRequired: true },
        } as any);

        const dbClient = createDbClient([]);

        await expect(
            assertLiveInspectionStudentAccess({
                dbClient,
                sessionId: 'attempt-1',
                studentUserId: 'student-user-1',
            }),
        ).resolves.toMatchObject({ attempt_id: 'attempt-1' });
    });

    it('allows student-owned incomplete camera-required attempts (explicit camera_required = true)', async () => {
        vi.mocked(SessionRepository.getOwnedSessionAttempt).mockResolvedValue({
            attempt_id: 'attempt-1',
            exam_id: 'exam-1',
            student_id: 'student-1',
            completed_at: null,
            status: 'IN_PROGRESS',
            started_at: new Date(),
            lifecycle_state: 'IN_PROGRESS',
            institution_id: 'institution-1',
        } as any);

        vi.mocked(getExamConfigurationState).mockResolvedValue({
            configuration: { cameraRequired: true },
        } as any);

        const dbClient = createDbClient([]);

        await expect(
            assertLiveInspectionStudentAccess({
                dbClient,
                sessionId: 'attempt-1',
                studentUserId: 'student-user-1',
            }),
        ).resolves.toMatchObject({ attempt_id: 'attempt-1' });
    });

    it.each([
        ['missing owned attempt', undefined, { cameraRequired: true }],
        [
            'owned attempt without an exam',
            {
                exam_id: null,
                completed_at: null,
                status: 'IN_PROGRESS',
                lifecycle_state: 'IN_PROGRESS',
            },
            { cameraRequired: true },
        ],
        [
            'camera optional (raw NULL, effective default = false)',
            {
                exam_id: 'exam-1',
                completed_at: null,
                status: 'IN_PROGRESS',
                lifecycle_state: 'IN_PROGRESS',
            },
            { cameraRequired: false },
        ],
        [
            'camera optional (explicit camera_required = false)',
            {
                exam_id: 'exam-1',
                completed_at: null,
                status: 'IN_PROGRESS',
                lifecycle_state: 'IN_PROGRESS',
            },
            { cameraRequired: false },
        ],
        [
            'completed',
            {
                exam_id: 'exam-1',
                completed_at: new Date(),
                status: 'COMPLETED',
                lifecycle_state: 'SUBMITTED',
            },
            { cameraRequired: true },
        ],
        [
            'locked',
            {
                exam_id: 'exam-1',
                completed_at: null,
                status: 'IN_PROGRESS',
                lifecycle_state: 'LOCKED',
            },
            { cameraRequired: true },
        ],
        [
            'closed',
            {
                exam_id: 'exam-1',
                completed_at: null,
                status: 'IN_PROGRESS',
                lifecycle_state: 'CLOSED',
            },
            { cameraRequired: true },
        ],
        [
            'superseded',
            {
                exam_id: 'exam-1',
                completed_at: null,
                status: 'IN_PROGRESS',
                lifecycle_state: 'SUPERSEDED',
            },
            { cameraRequired: true },
        ],
    ])('denies student access for %s', async (_, attempt, configState) => {
        vi.mocked(SessionRepository.getOwnedSessionAttempt).mockResolvedValue(attempt as any);
        vi.mocked(getExamConfigurationState).mockResolvedValue({
            configuration: configState,
        } as any);
        const dbClient = createDbClient([]);

        await expect(
            assertLiveInspectionStudentAccess({
                dbClient,
                sessionId: 'attempt-1',
                studentUserId: 'student-user-1',
            }),
        ).rejects.toBeInstanceOf(HTTPException);
    });
});
