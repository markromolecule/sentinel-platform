import { HTTPException } from 'hono/http-exception';
import { type DbClient } from '@sentinel/db';
import { type UpdateQuestionBody } from '../question.dto';
import { getQuestionByIdData } from '../data/get-question-by-id';
import { updateQuestionData } from '../data/update-question';
import { validateQuestionContentByType } from '../../../examination/assessment/assessment-contracts';
import { LogsService } from '../../../general/logs/logs.service';
import { ActivityNotificationService } from '../../../general/notification/services/activity-notification.service';
import { buildQuestionSourceValues } from './_utils';
import { getQuestionByIdService } from './get-questions.service';

export type UpdateQuestionServiceArgs = {
    dbClient: DbClient;
    id: string;
    body: UpdateQuestionBody;
    institutionId: string | undefined;
    userId: string;
};

/**
 * Merges incoming fields with the existing question record, validates content
 * by type, persists the update, then re-fetches the question in full mapped
 * form. Logs a telemetry event and fires an activity notification on success.
 *
 * @param args.dbClient - Database client
 * @param args.id - Question ID to update
 * @param args.body - Partial update payload
 * @param args.institutionId - Institution context
 * @param args.userId - Acting user ID (set as updated_by)
 * @returns Fully mapped updated question response
 */
export async function updateQuestionService({
    dbClient,
    id,
    body,
    institutionId,
    userId,
}: UpdateQuestionServiceArgs) {
    const current = await getQuestionByIdData({ dbClient, id, institutionId });

    if (!current) {
        throw new HTTPException(404, { message: 'Question not found.' });
    }

    const nextType = body.type ?? current.question_type;
    const nextContent = body.content ?? current.content;
    const validatedContent = validateQuestionContentByType(nextType, nextContent);
    const nextSourceOrigin = body.sourceOrigin ?? current.source_origin;
    const nextSourceValues = buildQuestionSourceValues({
        sourceOrigin: nextSourceOrigin,
        sourceFileName:
            body.sourceFileName === undefined ? current.source_file_name : body.sourceFileName,
        sourcePageNumber:
            body.sourcePageNumber === undefined
                ? current.source_page_number
                : body.sourcePageNumber,
        sourceEvidence:
            body.sourceEvidence === undefined ? current.source_evidence : body.sourceEvidence,
        passageContent:
            body.passageContent === undefined ? current.passage_content : body.passageContent,
        passageType: body.passageType === undefined ? current.passage_type : body.passageType,
    });

    const updated = await updateQuestionData({
        dbClient,
        id,
        institutionId,
        values: {
            subject_id: body.subjectId === undefined ? current.subject_id : body.subjectId,
            institution_id: institutionId ?? body.institutionId ?? current.institution_id,
            ...nextSourceValues,
            question_type: nextType,
            difficulty: body.difficulty ?? current.difficulty,
            content: validatedContent,
            points: body.points ?? current.points,
            tags: body.tags ?? current.tags,
            status: body.status ?? current.status,
            updated_by: userId,
            updated_at: new Date(),
        },
    });

    if (!updated) {
        throw new HTTPException(404, { message: 'Question not found.' });
    }

    // Telemetry logging and notifications
    try {
        const instId = institutionId ?? body.institutionId ?? current.institution_id;
        if (instId) {
            await LogsService.createLog(dbClient, {
                userId,
                action: 'question.updated',
                resourceType: 'question',
                resourceId: id,
                activeInstitutionId: instId,
                details: { updatedFields: Object.keys(body) },
            });

            await ActivityNotificationService.notifyInstitutionActivityUpdated({
                dbClient,
                actorUserId: userId,
                institutionId: instId,
                targetType: 'QUESTION',
                targetId: id,
                targetLabel: current.question_type || 'Question',
                title: 'Question updated',
                message: `A question of type "${current.question_type}" was updated.`,
                sourceModule: 'questions',
                sourceAction: 'update',
                metadata: { questionId: id },
            });
        }
    } catch (logErr) {
        console.error('Failed to log or notify question.updated:', logErr);
    }

    return getQuestionByIdService({
        dbClient,
        id,
        institutionId: institutionId ?? body.institutionId ?? current.institution_id ?? undefined,
    });
}

export type UpdateQuestionServiceResponse = Awaited<ReturnType<typeof updateQuestionService>>;
