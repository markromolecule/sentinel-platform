import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import { ActivityNotificationService } from '../../../general/notification/services/activity-notification.service';

export const checkInLobby = async (dbClient: DbClient, examId: string, studentId: string) => {
    const exam = await dbClient
        .selectFrom('exams as e')
        .leftJoin('exam_configurations as ec', 'e.exam_id', 'ec.exam_id')
        .select(['e.exam_id', 'e.institution_id', 'e.title', 'ec.lobby_admission_mode'])
        .where('e.exam_id', '=', examId)
        .executeTakeFirst();

    if (!exam) {
        throw new HTTPException(404, { message: 'Exam not found' });
    }

    const mode = exam.lobby_admission_mode ?? 'AUTOMATIC';
    const student = await dbClient
        .selectFrom('students')
        .select(['user_id'])
        .where('student_id', '=', studentId)
        .executeTakeFirst();
    const actorUserId = student?.user_id ?? null;

    const existingAdmission = await dbClient
        .selectFrom('exam_lobby_admissions')
        .selectAll()
        .where('exam_id', '=', examId)
        .where('student_id', '=', studentId)
        .executeTakeFirst();

    if (existingAdmission) {
        if (mode === 'AUTOMATIC' && existingAdmission.status !== 'APPROVED') {
            const updatedAdmission = await dbClient
                .updateTable('exam_lobby_admissions')
                .set({
                    status: 'APPROVED',
                    decided_at: new Date(),
                })
                .where('admission_id', '=', existingAdmission.admission_id)
                .returningAll()
                .executeTakeFirstOrThrow();

            return {
                status: updatedAdmission.status ?? 'WAITING',
                checkedInAt:
                    updatedAdmission.checked_in_at?.toISOString() ?? new Date().toISOString(),
            };
        }

        const resolvedStatus = existingAdmission.status ?? 'WAITING';
        if (resolvedStatus === 'WAITING' && exam.institution_id && actorUserId) {
            try {
                await ActivityNotificationService.notifyInstitutionActivityCreated({
                    dbClient,
                    actorUserId,
                    institutionId: exam.institution_id,
                    targetType: 'EXAM_LOBBY',
                    targetId: examId,
                    targetLabel: exam.title || 'Exam',
                    title: 'Student checked into lobby',
                    message: `A student has checked into the waiting lobby for exam "${exam.title || 'Exam'}".`,
                    sourceModule: 'exams',
                    sourceAction: 'lobby-check-in',
                    metadata: {
                        examId,
                        studentId,
                    },
                });
            } catch (notifErr) {
                console.error('Failed to notify lobby check-in:', notifErr);
            }
        }

        return {
            status: resolvedStatus,
            checkedInAt: existingAdmission.checked_in_at?.toISOString() ?? new Date().toISOString(),
        };
    }

    const now = new Date();
    const newAdmission = await dbClient
        .insertInto('exam_lobby_admissions')
        .values({
            exam_id: examId,
            student_id: studentId,
            status: mode === 'AUTOMATIC' ? 'APPROVED' : 'WAITING',
            checked_in_at: now,
            decided_at: mode === 'AUTOMATIC' ? now : null,
        })
        .onConflict((oc) =>
            oc.columns(['exam_id', 'student_id']).doUpdateSet({
                checked_in_at: now,
            }),
        )
        .returningAll()
        .executeTakeFirstOrThrow();

    const resolvedStatus = newAdmission.status ?? 'WAITING';
    if (resolvedStatus === 'WAITING' && exam.institution_id && actorUserId) {
        try {
            await ActivityNotificationService.notifyInstitutionActivityCreated({
                dbClient,
                actorUserId,
                institutionId: exam.institution_id,
                targetType: 'EXAM_LOBBY',
                targetId: examId,
                targetLabel: exam.title || 'Exam',
                title: 'Student checked into lobby',
                message: `A student has checked into the waiting lobby for exam "${exam.title || 'Exam'}".`,
                sourceModule: 'exams',
                sourceAction: 'lobby-check-in',
                metadata: {
                    examId,
                    studentId,
                },
            });
        } catch (notifErr) {
            console.error('Failed to notify lobby check-in:', notifErr);
        }
    }

    return {
        status: resolvedStatus,
        checkedInAt: newAdmission.checked_in_at?.toISOString() ?? new Date().toISOString(),
    };
};
