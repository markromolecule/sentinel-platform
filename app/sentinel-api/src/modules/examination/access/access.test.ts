import { describe, it, expect, vi, beforeEach } from 'vitest';
import { type DbClient } from '@sentinel/db';
import { AccessGatekeeperService } from './services/access-gatekeeper.service';
import { EntitlementsRepository } from './data/entitlements.repository';

vi.mock('./data/entitlements.repository', () => ({
    EntitlementsRepository: {
        getStudentProfileByUserId: vi.fn(),
        getExamAccessPolicy: vi.fn(),
        hasStudentExamEnrollment: vi.fn(),
    },
}));

describe('AccessGatekeeperService', () => {
    const mockDb = {} as DbClient;
    const userId = 'b49ef7a1-c7c7-4c79-851d-b5c6c0e48ff8';
    const examId = '0df6f61d-282e-4be7-a2f2-a190246ef7be';
    const now = new Date('2026-04-13T06:00:00.000Z');

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('rejects access when the authenticated account has no student profile', async () => {
        vi.mocked(EntitlementsRepository.getStudentProfileByUserId).mockResolvedValue(undefined);
        vi.mocked(EntitlementsRepository.getExamAccessPolicy).mockResolvedValue(undefined);

        const result = await AccessGatekeeperService.verifyStudentExamEligibility(
            mockDb,
            userId,
            examId,
            now,
        );

        expect(result).toEqual({
            isEligible: false,
            reason: 'Student profile not found for the authenticated account.',
        });
    });

    it('rejects access when the exam window has not started yet', async () => {
        vi.mocked(EntitlementsRepository.getStudentProfileByUserId).mockResolvedValue({
            student_id: 'e5c1ca10-c818-4bda-8f95-5255c1d5b1e7',
            institution_id: 'institution-1',
        });
        vi.mocked(EntitlementsRepository.getExamAccessPolicy).mockResolvedValue({
            exam_id: examId,
            subject_id: 'subject-1',
            section_id: null,
            room_id: null,
            duration_minutes: 60,
            scheduled_date: new Date('2026-04-13T08:00:00.000Z'),
            end_date_time: new Date('2026-04-13T09:00:00.000Z'),
            status: 'PUBLISHED',
            published_at: new Date('2026-04-12T06:00:00.000Z'),
            institution_id: 'institution-1',
            assigned_room_id: null,
            room_institution_id: null,
        });

        const result = await AccessGatekeeperService.verifyStudentExamEligibility(
            mockDb,
            userId,
            examId,
            now,
        );

        expect(result).toEqual({
            isEligible: false,
            reason: 'Exam has not started yet.',
        });
        expect(EntitlementsRepository.hasStudentExamEnrollment).not.toHaveBeenCalled();
    });

    it('returns the access context when enrollment and schedule checks pass', async () => {
        vi.mocked(EntitlementsRepository.getStudentProfileByUserId).mockResolvedValue({
            student_id: 'e5c1ca10-c818-4bda-8f95-5255c1d5b1e7',
            institution_id: 'institution-1',
        });
        vi.mocked(EntitlementsRepository.getExamAccessPolicy).mockResolvedValue({
            exam_id: examId,
            subject_id: 'subject-1',
            section_id: 'section-1',
            room_id: 'room-1',
            duration_minutes: 60,
            scheduled_date: new Date('2026-04-13T05:00:00.000Z'),
            end_date_time: new Date('2026-04-13T07:00:00.000Z'),
            status: 'PUBLISHED',
            published_at: new Date('2026-04-12T06:00:00.000Z'),
            institution_id: 'institution-1',
            assigned_room_id: 'room-1',
            room_institution_id: 'institution-1',
        });
        vi.mocked(EntitlementsRepository.hasStudentExamEnrollment).mockResolvedValue(true);

        const result = await AccessGatekeeperService.verifyStudentExamEligibility(
            mockDb,
            userId,
            examId,
            now,
        );

        expect(result).toEqual({
            isEligible: true,
            context: {
                examId,
                studentId: 'e5c1ca10-c818-4bda-8f95-5255c1d5b1e7',
                subjectId: 'subject-1',
                sectionId: 'section-1',
                roomId: 'room-1',
                durationMinutes: 60,
                scheduledDate: new Date('2026-04-13T05:00:00.000Z'),
                endDateTime: new Date('2026-04-13T07:00:00.000Z'),
                status: 'PUBLISHED',
                publishedAt: new Date('2026-04-12T06:00:00.000Z'),
                institutionId: 'institution-1',
            },
        });
        expect(EntitlementsRepository.hasStudentExamEnrollment).toHaveBeenCalledWith(mockDb, {
            studentId: 'e5c1ca10-c818-4bda-8f95-5255c1d5b1e7',
            subjectId: 'subject-1',
            sectionId: 'section-1',
        });
    });
});
