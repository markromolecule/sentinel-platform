import { type DbClient } from '@sentinel/db';
import type { LobbyAdmissionDecisionStatus } from '../lobby.dto';
import { NotificationService } from '../../../general/notification/notification.service';
import { broadcastLobbyEvent } from './broadcast-lobby-event';

export const updateAdmissions = async (
    dbClient: DbClient,
    examId: string,
    studentIds: string[],
    status: LobbyAdmissionDecisionStatus,
    instructorId?: string,
) => {
    const decidedAt = new Date();
    const result = await dbClient
        .updateTable('exam_lobby_admissions')
        .set({
            status: status as any,
            decided_at: decidedAt,
            decided_by: instructorId ?? null,
        })
        .where('exam_id', '=', examId)
        .where('student_id', 'in', studentIds)
        .executeTakeFirst();

    // Resolve exam and student user records for dual-identity broadcast and notifications
    let exam: { institution_id?: string | null; title?: string | null } | undefined;
    let students: Array<{ student_id?: string; user_id?: string | null }> = [];

    try {
        exam = await dbClient
            .selectFrom('exams')
            .select(['institution_id', 'title'])
            .where('exam_id', '=', examId)
            .executeTakeFirst();

        if (studentIds.length === 1) {
            const single = await dbClient
                .selectFrom('students')
                .select(['student_id', 'user_id'])
                .where('student_id', '=', studentIds[0])
                .executeTakeFirst();
            if (single) {
                students = [single];
            }
        } else if (studentIds.length > 1) {
            students = await dbClient
                .selectFrom('students')
                .select(['student_id', 'user_id'])
                .where('student_id', 'in', studentIds)
                .execute();
        }
    } catch (resolveErr) {
        console.warn('Failed to resolve exam/student details for lobby admission:', resolveErr);
    }

    const userIds = students
        .map((s) => s.user_id)
        .filter((uid): uid is string => Boolean(uid));

    // Fast-path Supabase Realtime broadcast to unlock student UIs in < 50ms
    void broadcastLobbyEvent(examId, 'admission:updated', {
        examId,
        studentIds,
        userIds,
        status,
        decidedAt: decidedAt.toISOString(),
    });

    // Notify each student regarding the decision in parallel
    try {
        if (exam?.institution_id && students.length > 0) {

            const title =
                status === 'APPROVED' ? 'Exam lobby approved' : 'Exam lobby rejected';
            const message =
                status === 'APPROVED'
                    ? `You have been admitted to exam "${exam.title || 'Exam'}".`
                    : `Your request to enter exam "${exam.title || 'Exam'}" was declined.`;

            await Promise.allSettled(
                students
                    .filter((s) => Boolean(s.user_id))
                    .map((student) =>
                        Promise.resolve(
                            NotificationService.createNotification({
                                dbClient,
                                recipientUserId: student.user_id!,
                                actorUserId: instructorId ?? null,
                                institutionId: exam.institution_id ?? null,
                                title,
                                message,
                                actionType: 'INSTITUTION_ACTIVITY_UPDATED',
                                resourceType: 'EXAM_ASSIGNMENT',
                                resourceId: examId,
                                resourceLabel: exam.title || 'Exam',
                                metadata: {
                                    examId,
                                    status,
                                },
                            }),
                        ).catch((notifErr) => {
                            console.error('Failed to notify student lobby admission:', notifErr);
                        }),
                    ),
            );
        }
    } catch (examErr) {
        console.error('Failed to resolve exam/student details for lobby admission notification:', examErr);
    }

    return { updatedCount: Number(result?.numUpdatedRows ?? 0) };
};
