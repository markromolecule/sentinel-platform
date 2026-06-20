import { type DbClient } from '@sentinel/db';
import { type CreateQuestionBody } from '../question.dto';
import { createQuestionData } from '../data/create-question';
import { validateQuestionContentByType } from '../../../examination/assessment/assessment-contracts';
import { LogsService } from '../../../general/logs/logs.service';
import { buildQuestionSourceValues } from './_utils';
import { getQuestionByIdService } from './get-questions.service';

export type CreateQuestionServiceArgs = {
    dbClient: DbClient;
    body: CreateQuestionBody;
    institutionId: string | undefined;
    userId: string;
};

/**
 * Validates and creates a new question, then re-fetches it in full mapped
 * form. Logs a telemetry event against the institution on success.
 *
 * @param args.dbClient - Database client
 * @param args.body - Question creation payload
 * @param args.institutionId - Institution context (overrides body.institutionId)
 * @param args.userId - Acting user ID (set as created_by / updated_by)
 * @returns Fully mapped question response
 */
export async function createQuestionService({
    dbClient,
    body,
    institutionId,
    userId,
}: CreateQuestionServiceArgs) {
    const content = validateQuestionContentByType(body.type, body.content);

    const created = await createQuestionData({
        dbClient,
        values: {
            subject_id: body.subjectId ?? null,
            institution_id: institutionId ?? body.institutionId ?? null,
            created_by: userId,
            updated_by: userId,
            ...buildQuestionSourceValues({
                sourceOrigin: body.sourceOrigin,
                sourceFileName: body.sourceFileName,
                sourcePageNumber: body.sourcePageNumber,
                sourceEvidence: body.sourceEvidence,
                passageContent: body.passageContent,
                passageType: body.passageType,
            }),
            question_type: body.type,
            difficulty: body.difficulty,
            content,
            points: body.points,
            tags: body.tags ?? [],
            created_at: new Date(),
            updated_at: new Date(),
        },
    });

    // Telemetry logging
    try {
        const instId = institutionId ?? body.institutionId;
        if (instId) {
            await LogsService.createLog(dbClient, {
                userId,
                action: 'question.created',
                resourceType: 'question',
                resourceId: created.question_bank_question_id,
                activeInstitutionId: instId,
                details: { type: body.type, difficulty: body.difficulty },
            });
        }
    } catch (logErr) {
        console.error('Failed to log question.created:', logErr);
    }

    return getQuestionByIdService({
        dbClient,
        id: created.question_bank_question_id,
        institutionId: institutionId ?? body.institutionId,
    });
}

export type CreateQuestionServiceResponse = Awaited<ReturnType<typeof createQuestionService>>;
