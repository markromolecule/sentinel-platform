import { type DbClient } from '@sentinel/db';
import type { ExamAccessEligibility } from '../access.dto';
import { EntitlementsRepository } from '../data/entitlements.repository';
import { RuntimeAccessService } from '../../runtime-access/runtime-access.service';
import {
    buildStudentOverrideRuntimeAccess,
    StudentOverridesService,
} from '../../student-overrides/student-overrides.service';
import { validateBasicEligibility } from './validate-basic-eligibility';
import { resolveLobbyRuntimeAccess } from './resolve-lobby-runtime-access';

export type EvaluateStudentExamEligibilityArgs = {
    dbClient: DbClient;
    userId: string;
    examId: string;
    now?: Date;
};

/**
 * Performs core eligibility and access rule evaluations for a student exam access request.
 * Delegates basic constraints and lobby gating checks to modular helpers.
 */
export async function evaluateStudentExamEligibilityService({
    dbClient,
    userId,
    examId,
    now = new Date(),
}: EvaluateStudentExamEligibilityArgs): Promise<ExamAccessEligibility> {
    const [student, exam] = await Promise.all([
        EntitlementsRepository.getStudentProfileByUserId(dbClient, userId),
        EntitlementsRepository.getExamAccessPolicy(dbClient, examId),
    ]);

    const basicCheck = validateBasicEligibility({ student, exam, now });
    if (!basicCheck.isEligible) {
        return basicCheck.errorResponse;
    }

    const { startsAt, endsAt } = basicCheck;

    // Student and Exam are verified non-nullable here by validateBasicEligibility
    const resolvedStudent = student!;
    const resolvedExam = exam!;

    const isEnrolled = await EntitlementsRepository.hasStudentExamEnrollment(dbClient, {
        studentId: resolvedStudent.student_id,
        classGroupId: resolvedExam.class_group_id,
        subjectId: resolvedExam.subject_id!,
        sectionId: resolvedExam.section_id,
        sectionIds: resolvedExam.assigned_section_ids,
    });

    if (!isEnrolled) {
        return {
            isEligible: false,
            reason: 'Student is not actively enrolled in the exam subject or assigned section.',
            reasonCode: 'CLOSED',
            runtimeAccess: {
                state: 'closed',
                reasonCode: 'CLOSED',
                message:
                    'Student is not actively enrolled in the exam subject or assigned section.',
                canStart: false,
                canResume: false,
                hasActiveAttempt: false,
                startsAt,
                endsAt,
                reopenedUntil: null,
            },
        };
    }

    const latestAttempt = await EntitlementsRepository.getStudentLatestExamAttempt(dbClient, {
        studentId: resolvedStudent.student_id,
        examId: resolvedExam.exam_id,
    });
    const latestLobbyAdmission = await EntitlementsRepository.getStudentLatestLobbyAdmission(
        dbClient,
        {
            studentId: resolvedStudent.student_id,
            examId: resolvedExam.exam_id,
        },
    );
    const persistedRuntimeAccess = await RuntimeAccessService.getPersistedExamRuntimeAccess(
        dbClient,
        resolvedExam.exam_id,
    );
    const scheduledRuntimeAccess = await RuntimeAccessService.resolveExamRuntimeAccess({
        dbClient,
        examId: resolvedExam.exam_id,
        scheduledDate: resolvedExam.scheduled_date!,
        endDateTime: resolvedExam.end_date_time,
        durationMinutes: resolvedExam.duration_minutes,
        now,
        hasActiveAttempt: latestAttempt?.status === 'IN_PROGRESS',
        reconnectAttemptCount: Number(latestAttempt?.reconnect_attempt_count ?? 0),
        maxReconnectAttempts: resolvedExam.max_reconnect_attempts ?? undefined,
    });
    const accessOverride = await StudentOverridesService.getActiveStudentExamOverride({
        dbClient,
        examId: resolvedExam.exam_id,
        studentId: resolvedStudent.student_id,
        now,
    });
    const runtimeAccess =
        resolvedExam.lobby_admission_mode === 'INSTRUCTOR_GATED' &&
            !latestAttempt?.completed_at &&
            latestAttempt?.status !== 'IN_PROGRESS' &&
            (scheduledRuntimeAccess.canStart || accessOverride)
            ? resolveLobbyRuntimeAccess({
                scheduledRuntimeAccess,
                admissionStatus: latestLobbyAdmission?.status ?? null,
            })
            : scheduledRuntimeAccess;

    if (
        accessOverride &&
        persistedRuntimeAccess?.state !== 'closed' &&
        !scheduledRuntimeAccess.canStart &&
        !scheduledRuntimeAccess.canResume
    ) {
        return {
            isEligible: true,
            context: {
                examId: resolvedExam.exam_id,
                studentId: resolvedStudent.student_id,
                classroomId: resolvedExam.class_group_id,
                subjectId: resolvedExam.subject_id!,
                sectionId: resolvedExam.section_id,
                sectionIds: resolvedExam.assigned_section_ids,
                roomId: resolvedExam.room_id,
                durationMinutes: resolvedExam.duration_minutes,
                scheduledDate: resolvedExam.scheduled_date!,
                endDateTime: resolvedExam.end_date_time,
                status: resolvedExam.status,
                publishedAt: resolvedExam.published_at,
                institutionId: resolvedExam.institution_id,
            },
            runtimeAccess: buildStudentOverrideRuntimeAccess({
                accessOverride,
                runtimeAccess: scheduledRuntimeAccess,
                hasActiveAttempt: latestAttempt?.status === 'IN_PROGRESS',
            }),
            accessOverride,
        };
    }

    if (!runtimeAccess.canStart && !runtimeAccess.canResume) {
        return {
            isEligible: false,
            reason: runtimeAccess.message,
            reasonCode: runtimeAccess.reasonCode,
            runtimeAccess,
            accessOverride: accessOverride ?? null,
        };
    }

    return {
        isEligible: true,
        context: {
            examId: resolvedExam.exam_id,
            studentId: resolvedStudent.student_id,
            classroomId: resolvedExam.class_group_id,
            subjectId: resolvedExam.subject_id!,
            sectionId: resolvedExam.section_id,
            sectionIds: resolvedExam.assigned_section_ids,
            roomId: resolvedExam.room_id,
            durationMinutes: resolvedExam.duration_minutes,
            scheduledDate: resolvedExam.scheduled_date!,
            endDateTime: resolvedExam.end_date_time,
            status: resolvedExam.status,
            publishedAt: resolvedExam.published_at,
            institutionId: resolvedExam.institution_id,
        },
        runtimeAccess,
        accessOverride: accessOverride ?? null,
    };
}
