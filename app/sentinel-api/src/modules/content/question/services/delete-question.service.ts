import { HTTPException } from 'hono/http-exception';
import { type DbClient, executeTransaction } from '@sentinel/db';
import { deleteQuestionData } from '../data/delete-question';
import { removeLinkedExamQuestionsBySourceQuestionIds } from '../../../examination/exams/services/remove-linked-exam-questions';
import { LogsService } from '../../../general/logs/logs.service';
import { ActivityNotificationService } from '../../../general/notification/services/activity-notification.service';

export type DeleteQuestionServiceArgs = {
    dbClient: DbClient;
    id: string;
    institutionId?: string;
};

/**
 * Archives (soft-deletes) a question inside a transaction and removes any
 * linked exam questions referencing it. Logs a telemetry event and fires an
 * activity notification on success. Throws HTTP 404 when not found.
 *
 * @param args.dbClient - Database client
 * @param args.id - Question ID to archive
 * @param args.institutionId - Institution context used for logging
 */
export async function deleteQuestionService({
    dbClient,
    id,
    institutionId,
}: DeleteQuestionServiceArgs): Promise<void> {
    const deleted = await executeTransaction(async (trx) => {
        const archivedQuestion = await deleteQuestionData({
            dbClient: trx,
            id,
            institutionId,
            archivedAt: new Date(),
        });

        if (!archivedQuestion) {
            return null;
        }

        await removeLinkedExamQuestionsBySourceQuestionIds({
            dbClient: trx,
            questionIds: [id],
        });

        return archivedQuestion;
    });

    if (!deleted) {
        throw new HTTPException(404, { message: 'Question not found.' });
    }

    // Telemetry logging and notifications
    try {
        const instId = institutionId || (deleted as any).institution_id;
        if (instId) {
            await LogsService.createLog(dbClient, {
                userId: '00000000-0000-0000-0000-000000000000',
                action: 'question.deleted',
                resourceType: 'question',
                resourceId: id,
                activeInstitutionId: instId,
                details: { id },
            });

            await ActivityNotificationService.notifyInstitutionActivityDeleted({
                dbClient,
                actorUserId: '00000000-0000-0000-0000-000000000000',
                institutionId: instId,
                targetType: 'QUESTION',
                targetId: id,
                targetLabel: (deleted as any).question_type || 'Question',
                title: 'Question deleted',
                message: `A question of type "${(deleted as any).question_type || 'Question'}" has been archived.`,
                sourceModule: 'questions',
                sourceAction: 'delete',
                metadata: { questionId: id },
            });
        }
    } catch (logErr) {
        console.error('Failed to log or notify question.deleted:', logErr);
    }
}
