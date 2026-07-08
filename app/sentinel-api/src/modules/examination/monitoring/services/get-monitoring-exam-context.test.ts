import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';
import { buildStaffExamVisibilityPredicates } from '../../assign/services/exam-access';
import { getMonitoringExamContext } from './get-monitoring-exam-context';

vi.mock('../../assign/services/exam-access', () => ({
    buildStaffExamVisibilityPredicates: vi.fn(),
}));

describe('getMonitoringExamContext', () => {
    let mockDb: any;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(buildStaffExamVisibilityPredicates).mockResolvedValue([
            sql<boolean>`e.created_by = ${'user-1'}`,
        ]);

        mockDb = {
            selectFrom: vi.fn().mockReturnThis(),
            leftJoin: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            executeTakeFirst: vi.fn(),
        };
    });

    it('returns monitoring context for assigned instructors within the institution scope', async () => {
        mockDb.executeTakeFirst.mockResolvedValue({
            exam_id: 'exam-1',
            title: 'Final Exam',
            duration_minutes: 60,
            scheduled_date: '2026-07-08T08:00:00.000Z',
            end_date_time: '2026-07-08T09:00:00.000Z',
            max_reconnect_attempts: 3,
            subject_title: 'Mathematics',
            remediation_id: null,
            remediation_type: null,
            source_exam_id: null,
            source_attempt_id: null,
            source_exam_title: null,
            question_count: 25,
        });

        const result = await getMonitoringExamContext({
            dbClient: mockDb as DbClient,
            examId: 'exam-1',
            institutionId: 'institution-1',
            viewerRole: 'instructor',
            userId: 'user-1',
        });

        expect(buildStaffExamVisibilityPredicates).toHaveBeenCalledWith({
            dbClient: mockDb,
            userId: 'user-1',
            institutionId: 'institution-1',
            includePublicInstitutionExams: true,
        });
        expect(mockDb.where).toHaveBeenCalledWith('e.institution_id', '=', 'institution-1');
        expect(result).toMatchObject({
            examId: 'exam-1',
            title: 'Final Exam',
            subject: 'Mathematics',
            durationMinutes: 60,
            maxReconnectAttempts: 3,
            questionCount: 25,
        });
    });

    it('throws when the monitoring exam cannot be found', async () => {
        mockDb.executeTakeFirst.mockResolvedValue(undefined);

        await expect(
            getMonitoringExamContext({
                dbClient: mockDb as DbClient,
                examId: 'exam-1',
                institutionId: 'institution-1',
                viewerRole: 'instructor',
                userId: 'user-1',
            }),
        ).rejects.toThrow('Exam monitoring record not found.');
    });
});
