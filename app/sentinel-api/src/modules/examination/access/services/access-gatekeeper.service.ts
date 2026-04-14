import { type DbClient } from '@sentinel/db';
import { getExamArchiveCutoff, normalizeExamStatus } from '@sentinel/shared';
import type { ExamAccessEligibility } from '../access.dto';
import { EntitlementsRepository } from '../data/entitlements.repository';

export class AccessGatekeeperService {
    /**
     * Verifies if a student is completely eligible to enter the exam flow right now.
     * Evaluates enrollment, active status, time-window logic, and basic room assignments.
     */
    static async verifyStudentExamEligibility(
        db: DbClient,
        userId: string,
        examId: string,
        now = new Date(),
    ): Promise<ExamAccessEligibility> {
        const [student, exam] = await Promise.all([
            EntitlementsRepository.getStudentProfileByUserId(db, userId),
            EntitlementsRepository.getExamAccessPolicy(db, examId),
        ]);

        if (!student) {
            return {
                isEligible: false,
                reason: 'Student profile not found for the authenticated account.',
            };
        }

        if (!exam || !exam.subject_id) {
            return {
                isEligible: false,
                reason: 'Exam not found or missing subject assignment.',
            };
        }

        if (
            student.institution_id &&
            exam.institution_id &&
            student.institution_id !== exam.institution_id
        ) {
            return {
                isEligible: false,
                reason: 'Student and exam belong to different institutions.',
            };
        }

        const normalizedStatus = normalizeExamStatus(exam.status);
        if (!exam.published_at || ['draft', 'archived', 'completed'].includes(normalizedStatus)) {
            return {
                isEligible: false,
                reason: 'Exam is not available for student access.',
            };
        }

        if (!exam.scheduled_date) {
            return {
                isEligible: false,
                reason: 'Exam start time is not configured.',
            };
        }

        const startsAt =
            exam.scheduled_date instanceof Date
                ? exam.scheduled_date
                : new Date(exam.scheduled_date);
        if (Number.isNaN(startsAt.getTime())) {
            return {
                isEligible: false,
                reason: 'Exam start time is invalid.',
            };
        }

        if (startsAt.getTime() > now.getTime()) {
            return {
                isEligible: false,
                reason: 'Exam has not started yet.',
            };
        }

        const endsAt = getExamArchiveCutoff({
            scheduledDate: exam.scheduled_date,
            endDateTime: exam.end_date_time,
            durationMinutes: exam.duration_minutes,
            now,
        });

        if (!endsAt) {
            return {
                isEligible: false,
                reason: 'Exam end time is not configured.',
            };
        }

        if (endsAt.getTime() <= now.getTime()) {
            return {
                isEligible: false,
                reason: 'Exam access window has already closed.',
            };
        }

        if (
            exam.room_id &&
            (!exam.assigned_room_id ||
                (exam.room_institution_id &&
                    exam.institution_id &&
                    exam.room_institution_id !== exam.institution_id))
        ) {
            return {
                isEligible: false,
                reason: 'Exam room assignment is invalid.',
            };
        }

        const isEnrolled = await EntitlementsRepository.hasStudentExamEnrollment(db, {
            studentId: student.student_id,
            subjectId: exam.subject_id,
            sectionId: exam.section_id,
        });

        if (!isEnrolled) {
            return {
                isEligible: false,
                reason: 'Student is not actively enrolled in the exam subject or assigned section.',
            };
        }

        return {
            isEligible: true,
            context: {
                examId: exam.exam_id,
                studentId: student.student_id,
                subjectId: exam.subject_id,
                sectionId: exam.section_id,
                roomId: exam.room_id,
                durationMinutes: exam.duration_minutes,
                scheduledDate: exam.scheduled_date,
                endDateTime: exam.end_date_time,
                status: exam.status,
                publishedAt: exam.published_at,
                institutionId: exam.institution_id,
            },
        };
    }
}
