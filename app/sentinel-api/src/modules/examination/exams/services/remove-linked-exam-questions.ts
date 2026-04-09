import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';
import { getExamQuestionColumnSupport } from '../helper/exam-schema-compat';
import { updateExamData } from '../data/update-exam';

export async function removeLinkedExamQuestionsBySourceQuestionIds(args: {
    dbClient: DbClient;
    questionIds?: string[];
    sourceCollectionId?: string;
}) {
    const questionColumnSupport = await getExamQuestionColumnSupport(args.dbClient);
    const uniqueQuestionIds = [...new Set(args.questionIds ?? [])];
    const hasSourceQuestionFilter = uniqueQuestionIds.length > 0;
    const hasSourceCollectionFilter = Boolean(
        args.sourceCollectionId && questionColumnSupport.hasSourceCollectionId,
    );

    if (!hasSourceQuestionFilter && !hasSourceCollectionFilter) {
        return [];
    }

    let affectedExamQuery = args.dbClient
        .selectFrom('exam_questions')
        .select('exam_id')
        .distinct();

    if (hasSourceQuestionFilter) {
        affectedExamQuery = affectedExamQuery.where(
            'source_question_bank_question_id',
            'in',
            uniqueQuestionIds,
        );
    }

    if (hasSourceCollectionFilter) {
        affectedExamQuery = affectedExamQuery.where(
            'source_collection_id',
            '=',
            args.sourceCollectionId!,
        );
    }

    const affectedExamRows = await affectedExamQuery.execute();

    const affectedExamIds = affectedExamRows.map((row) => row.exam_id);

    if (affectedExamIds.length === 0) {
        return [];
    }

    let deleteQuery = args.dbClient.deleteFrom('exam_questions');

    if (hasSourceQuestionFilter) {
        deleteQuery = deleteQuery.where('source_question_bank_question_id', 'in', uniqueQuestionIds);
    }

    if (hasSourceCollectionFilter) {
        deleteQuery = deleteQuery.where('source_collection_id', '=', args.sourceCollectionId!);
    }

    await deleteQuery.execute();

    const remainingQuestionCounts = await args.dbClient
        .selectFrom('exam_questions')
        .select([
            'exam_id',
            sql<number>`count(*)::int`.as('question_count'),
        ])
        .where('exam_id', 'in', affectedExamIds)
        .groupBy('exam_id')
        .execute();

    const questionCountByExamId = new Map(
        remainingQuestionCounts.map((row) => [row.exam_id, row.question_count]),
    );
    const updatedAt = new Date();

    await Promise.all(
        affectedExamIds.map((examId) =>
            updateExamData({
                dbClient: args.dbClient,
                id: examId,
                values: {
                    question_count: questionCountByExamId.get(examId) ?? 0,
                    updated_at: updatedAt,
                },
            }),
        ),
    );

    return affectedExamIds;
}
