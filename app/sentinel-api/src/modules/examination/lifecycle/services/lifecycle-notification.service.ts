import { type DbClient } from '@sentinel/db';
import type { ExamAttemptLifecycleEventType } from '@sentinel/shared';
import { NotificationService } from '../../../general/notification/notification.service';
import { ActivityNotificationService } from '../../../general/notification/services/activity-notification.service';

export const LIFECYCLE_SYSTEM_ACTOR_ID = '00000000-0000-0000-0000-000000000000';

export type LifecycleNotificationEventType = ExamAttemptLifecycleEventType | 'AUTOMATIC_CLOSE';

type LifecycleNotificationContext = {
    examTitle: string;
    institutionId: string | null;
    studentUserId: string | null;
    studentName: string;
};

const NOTIFICATION_COPY: Record<
    LifecycleNotificationEventType,
    {
        studentTitle: string;
        studentMessage: (examTitle: string) => string;
        instructorTitle: string;
        instructorMessage: (studentName: string, examTitle: string) => string;
        sourceAction: string;
    }
> = {
    STARTED: {
        studentTitle: 'Exam Attempt Started',
        studentMessage: (examTitle) => `Your attempt for "${examTitle}" has started.`,
        instructorTitle: 'Student Exam Attempt Started',
        instructorMessage: (studentName, examTitle) =>
            `${studentName}'s attempt for "${examTitle}" has started.`,
        sourceAction: 'attempt-started',
    },
    SUBMITTED: {
        studentTitle: 'Exam Attempt Submitted',
        studentMessage: (examTitle) => `Your attempt for "${examTitle}" has been submitted.`,
        instructorTitle: 'Student Exam Attempt Submitted',
        instructorMessage: (studentName, examTitle) =>
            `${studentName}'s attempt for "${examTitle}" has been submitted.`,
        sourceAction: 'attempt-submitted',
    },
    LOCKED: {
        studentTitle: 'Exam Attempt Locked',
        studentMessage: (examTitle) => `Your attempt for "${examTitle}" has been locked.`,
        instructorTitle: 'Student Exam Attempt Locked',
        instructorMessage: (studentName, examTitle) =>
            `${studentName}'s attempt for "${examTitle}" has been locked.`,
        sourceAction: 'lock-attempt',
    },
    REOPENED: {
        studentTitle: 'Exam Attempt Reopened',
        studentMessage: (examTitle) => `Your attempt for "${examTitle}" has been reopened.`,
        instructorTitle: 'Student Exam Attempt Reopened',
        instructorMessage: (studentName, examTitle) =>
            `${studentName}'s attempt for "${examTitle}" has been reopened.`,
        sourceAction: 'reopen-attempt',
    },
    RESET: {
        studentTitle: 'Exam Attempt Reset',
        studentMessage: (examTitle) =>
            `Your attempt for "${examTitle}" has been reset. You may start a replacement attempt.`,
        instructorTitle: 'Student Exam Attempt Reset',
        instructorMessage: (studentName, examTitle) =>
            `${studentName}'s attempt for "${examTitle}" has been reset.`,
        sourceAction: 'reset-attempt',
    },
    CLOSED: {
        studentTitle: 'Exam Attempt Closed',
        studentMessage: (examTitle) => `Your attempt for "${examTitle}" has been closed.`,
        instructorTitle: 'Student Exam Attempt Closed',
        instructorMessage: (studentName, examTitle) =>
            `${studentName}'s attempt for "${examTitle}" has been closed.`,
        sourceAction: 'close-attempt',
    },
    SUPERSEDED: {
        studentTitle: 'Exam Attempt Superseded',
        studentMessage: (examTitle) =>
            `Your previous attempt for "${examTitle}" has been replaced.`,
        instructorTitle: 'Student Exam Attempt Superseded',
        instructorMessage: (studentName, examTitle) =>
            `${studentName}'s attempt for "${examTitle}" has been superseded.`,
        sourceAction: 'supersede-attempt',
    },
    FINALIZED: {
        studentTitle: 'Exam Score Finalized',
        studentMessage: (examTitle) => `Your score for "${examTitle}" has been finalized.`,
        instructorTitle: 'Student Exam Score Finalized',
        instructorMessage: (studentName, examTitle) =>
            `${studentName}'s score for "${examTitle}" has been finalized.`,
        sourceAction: 'finalize-attempt',
    },
    FINALIZATION_REVISED: {
        studentTitle: 'Exam Score Under Review',
        studentMessage: (examTitle) => `Your score for "${examTitle}" has been marked for review.`,
        instructorTitle: 'Student Exam Score Marked for Review',
        instructorMessage: (studentName, examTitle) =>
            `${studentName}'s score for "${examTitle}" has been marked for review.`,
        sourceAction: 'revise-finalization',
    },
    MAKEUP_GRANTED: {
        studentTitle: 'Makeup Exam Window Granted',
        studentMessage: (examTitle) => `A makeup window has been granted for "${examTitle}".`,
        instructorTitle: 'Makeup Exam Window Granted',
        instructorMessage: (studentName, examTitle) =>
            `A makeup window was granted to ${studentName} for "${examTitle}".`,
        sourceAction: 'grant-makeup',
    },
    RETAKE_GRANTED: {
        studentTitle: 'Retake Exam Window Granted',
        studentMessage: (examTitle) => `A retake window has been granted for "${examTitle}".`,
        instructorTitle: 'Retake Exam Window Granted',
        instructorMessage: (studentName, examTitle) =>
            `A retake window was granted to ${studentName} for "${examTitle}".`,
        sourceAction: 'grant-retake',
    },
    INCIDENT_REVIEWED: {
        studentTitle: 'Exam Incident Reviewed',
        studentMessage: (examTitle) =>
            `An incident on your attempt for "${examTitle}" was reviewed.`,
        instructorTitle: 'Student Exam Incident Reviewed',
        instructorMessage: (studentName, examTitle) =>
            `An incident on ${studentName}'s attempt for "${examTitle}" was reviewed.`,
        sourceAction: 'incident-reviewed',
    },
    AUTOMATIC_CLOSE: {
        studentTitle: 'Exam Attempt Automatically Closed',
        studentMessage: (examTitle) =>
            `Your attempt for "${examTitle}" has been automatically closed due to proctoring policy.`,
        instructorTitle: 'Student Exam Attempt Automatically Closed',
        instructorMessage: (studentName, examTitle) =>
            `${studentName}'s attempt for "${examTitle}" has been automatically closed.`,
        sourceAction: 'automatic-close',
    },
};

function withNotes(message: string, notes?: string | null) {
    return notes ? `${message} Note: ${notes}` : message;
}

async function getNotificationContext(args: {
    dbClient: DbClient;
    examId: string;
    studentId: string;
}): Promise<LifecycleNotificationContext | null> {
    const [studentInfo, examInfo] = await Promise.all([
        args.dbClient
            .selectFrom('students as s')
            .leftJoin('user_profiles as up', 'up.user_id', 's.user_id')
            .select([
                's.user_id as userId',
                'up.first_name as firstName',
                'up.last_name as lastName',
            ])
            .where('s.student_id', '=', args.studentId)
            .executeTakeFirst(),
        args.dbClient
            .selectFrom('exams')
            .select(['title', 'institution_id'])
            .where('exam_id', '=', args.examId)
            .executeTakeFirst(),
    ]);

    if (!examInfo) {
        return null;
    }

    const firstName = studentInfo?.firstName ?? '';
    const lastName = studentInfo?.lastName ?? '';
    const studentName = `${firstName} ${lastName}`.trim() || 'the selected student';

    return {
        examTitle: examInfo.title || 'Exam',
        institutionId: examInfo.institution_id ?? null,
        studentUserId: studentInfo?.userId ?? null,
        studentName,
    };
}

export async function notifyAttemptLifecycleStudent(args: {
    dbClient: DbClient;
    examId: string;
    studentId: string;
    attemptId?: string | null;
    eventType: LifecycleNotificationEventType;
    actorUserId?: string | null;
    institutionId?: string | null;
    notes?: string | null;
}) {
    const context = await getNotificationContext(args);

    if (!context?.studentUserId) {
        return null;
    }

    const copy = NOTIFICATION_COPY[args.eventType];
    const institutionId = args.institutionId ?? context.institutionId;

    return NotificationService.createNotification({
        dbClient: args.dbClient,
        recipientUserId: context.studentUserId,
        actorUserId: args.actorUserId ?? null,
        institutionId,
        title: copy.studentTitle,
        message: withNotes(copy.studentMessage(context.examTitle), args.notes),
        actionType: 'INSTITUTION_ACTIVITY_CREATED',
        resourceType: 'INSTITUTION_ACTIVITY',
        resourceId: args.attemptId ?? args.examId,
        resourceLabel: context.examTitle,
        metadata: {
            attemptId: args.attemptId ?? null,
            examId: args.examId,
            studentId: args.studentId,
            eventType: args.eventType,
        },
    });
}

export async function notifyAttemptLifecycleInstructor(args: {
    dbClient: DbClient;
    examId: string;
    studentId: string;
    attemptId?: string | null;
    eventType: LifecycleNotificationEventType;
    actorUserId?: string | null;
    institutionId?: string | null;
    notes?: string | null;
}) {
    const context = await getNotificationContext(args);

    if (!context) {
        return null;
    }

    const institutionId = args.institutionId ?? context.institutionId;

    if (!institutionId) {
        return null;
    }

    const copy = NOTIFICATION_COPY[args.eventType];

    return ActivityNotificationService.notifyInstitutionActivityCreated({
        dbClient: args.dbClient,
        actorUserId: args.actorUserId ?? LIFECYCLE_SYSTEM_ACTOR_ID,
        institutionId,
        targetType: 'EXAM_ATTEMPT',
        targetId: args.attemptId ?? args.examId,
        targetLabel: context.examTitle,
        title: copy.instructorTitle,
        message: withNotes(
            copy.instructorMessage(context.studentName, context.examTitle),
            args.notes,
        ),
        sourceModule: 'exams',
        sourceAction: copy.sourceAction,
        metadata: {
            attemptId: args.attemptId ?? null,
            examId: args.examId,
            studentId: args.studentId,
            studentName: context.studentName,
            eventType: args.eventType,
        },
    });
}

export class LifecycleNotificationService {
    static async notifyLifecycleChange(args: {
        dbClient: DbClient;
        attemptId?: string | null;
        examId: string;
        studentId: string;
        eventType: LifecycleNotificationEventType;
        actorUserId?: string | null;
        institutionId?: string | null;
        notes?: string | null;
    }) {
        await Promise.all([
            notifyAttemptLifecycleStudent(args),
            notifyAttemptLifecycleInstructor(args),
        ]);
    }
}
