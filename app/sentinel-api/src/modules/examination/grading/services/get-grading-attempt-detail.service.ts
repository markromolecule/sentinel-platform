import { type DbClient } from '@sentinel/db';
import { buildExamAttemptQuestionReports, randomizeQuestionChoices } from '@sentinel/shared';
import type { ExamQuestion, PassageType } from '@sentinel/shared/types';
import { HTTPException } from 'hono/http-exception';
import { sql } from 'kysely';

export type GetGradingAttemptDetailArgs = {
    dbClient: DbClient;
    attemptId: string;
    institutionId?: string;
};

/**
 * Retrieves the detailed content of a student exam attempt, including questions,
 * student responses, and existing grading evaluations.
 *
 * @param args - GetGradingAttemptDetailArgs
 * @returns The attempt detail, including student profile, exam details, questions, and evaluations.
 */
export async function getGradingAttemptDetail({
    dbClient,
    attemptId,
    institutionId,
}: GetGradingAttemptDetailArgs) {
    const attemptRow = await dbClient
        .selectFrom('exam_attempts as ea')
        .innerJoin('exams as e', 'e.exam_id', 'ea.exam_id')
        .innerJoin('students as st', 'st.student_id', 'ea.student_id')
        .leftJoin('user_profiles as up', 'up.user_id', 'st.user_id')
        .leftJoin('subjects as s', 's.subject_id', 'e.subject_id')
        .select([
            'ea.attempt_id as attemptId',
            'ea.exam_id as examId',
            'ea.student_id as studentId',
            'st.student_number as studentNumber',
            'ea.completed_at as completedAt',
            'ea.score as score',
            'ea.total_score as totalScore',
            'ea.initial_score as initialScore',
            'ea.status as status',
            'ea.answer_snapshot as answerSnapshot',
            'e.title as examTitle',
            's.subject_title as subjectTitle',
            sql<string>`trim(concat(up.first_name, ' ', up.last_name))`.as('studentName'),
            sql<string | null>`ea.lifecycle_state::text`.as('lifecycleState'),
            sql<string | null>`ea.score_state::text`.as('scoreState'),
            'ea.finalized_at as finalizedAt',
            'ea.finalized_by as finalizedBy',
        ])
        .where('ea.attempt_id', '=', attemptId)
        .$if(Boolean(institutionId), (qb) => qb.where('e.institution_id', '=', institutionId!))
        .executeTakeFirst();

    if (!attemptRow) {
        throw new HTTPException(404, {
            message: 'Exam attempt not found.',
        });
    }

    const questions = await dbClient
        .selectFrom('exam_questions as eq')
        .leftJoin(
            'question_bank_questions as qbq',
            'qbq.question_bank_question_id',
            'eq.source_question_bank_question_id',
        )
        .select([
            'eq.question_id as id',
            'eq.exam_id as examId',
            'eq.question_type as type',
            'qbq.source_file_name as sourceFileName',
            'qbq.source_page_number as sourcePageNumber',
            'qbq.source_evidence as sourceEvidence',
            'eq.passage_content as passageContent',
            sql<PassageType | null>`
                CASE
                    WHEN eq.passage_type IS NULL THEN NULL
                    WHEN eq.passage_type = 'html' THEN 'html'
                    ELSE 'plain'
                END
            `.as('passageType'),
            'eq.content as content',
            'eq.points as points',
            'eq.order_index as orderIndex',
        ])
        .where('eq.exam_id', '=', attemptRow.examId)
        .orderBy('eq.order_index', 'asc')
        .execute();

    const config = await dbClient
        .selectFrom('exam_configurations')
        .select(['randomize_choices'])
        .where('exam_id', '=', attemptRow.examId)
        .executeTakeFirst();

    const snapshotObj = (attemptRow.answerSnapshot ?? {}) as Record<string, any>;
    const evaluations = (snapshotObj._evaluations ?? {}) as Record<string, any>;
    const overallFeedback = (snapshotObj._feedback ?? null) as string | null;
    const itemOverrides = (snapshotObj._itemOverrides ?? {}) as Record<string, any>;
    const grading = (snapshotObj._grading ?? {}) as Record<string, any>;

    // Filter out internal metadata keys from student answers
    const answers: Record<string, any> = {};
    for (const key of Object.keys(snapshotObj)) {
        if (!key.startsWith('_')) {
            answers[key] = snapshotObj[key];
        }
    }

    const mappedQuestions: ExamQuestion[] = questions.map((q) => ({
        id: q.id,
        examId: q.examId,
        type: q.type as any,
        points: q.points,
        orderIndex: q.orderIndex,
        content: q.content as any,
        tags: [],
    }));

    let finalQuestions = mappedQuestions;
    if (config?.randomize_choices) {
        finalQuestions = mappedQuestions.map((q) =>
            randomizeQuestionChoices(q, `${attemptRow.attemptId}-${q.id}`),
        );
    }

    const questionReports = buildExamAttemptQuestionReports({
        questions: finalQuestions,
        answers,
        evaluations,
        itemOverrides,
    });

    return {
        attempt: {
            attemptId: attemptRow.attemptId,
            examId: attemptRow.examId,
            examTitle: attemptRow.examTitle,
            subjectTitle: attemptRow.subjectTitle ?? '',
            studentId: attemptRow.studentId,
            studentName: attemptRow.studentName ?? 'Unknown Student',
            studentNumber: attemptRow.studentNumber,
            completedAt: attemptRow.completedAt ? attemptRow.completedAt.toISOString() : null,
            score: attemptRow.score,
            totalScore: attemptRow.totalScore,
            initialScore: attemptRow.initialScore,
            status: attemptRow.status,
            answers,
            evaluations,
            feedback: overallFeedback,
            itemOverrides,
            grading: {
                finalizedAt: attemptRow.finalizedAt
                    ? attemptRow.finalizedAt.toISOString()
                    : typeof grading.finalizedAt === 'string'
                      ? grading.finalizedAt
                      : null,
                finalizedBy:
                    attemptRow.finalizedBy ??
                    (typeof grading.finalizedBy === 'string' ? grading.finalizedBy : null),
            },
            lifecycleState: attemptRow.lifecycleState ?? null,
            scoreState: attemptRow.scoreState ?? null,
            questionReports,
        },
        questions: finalQuestions.map((q) => {
            const dbQ = questions.find((entry) => entry.id === q.id)!;
            return {
                id: q.id,
                examId: q.examId,
                type: q.type,
                sourceFileName: dbQ.sourceFileName ?? null,
                sourcePageNumber: dbQ.sourcePageNumber ?? null,
                sourceEvidence: dbQ.sourceEvidence ?? null,
                passageContent: dbQ.passageContent ?? null,
                passageType: dbQ.passageType,
                content: q.content,
                points: q.points,
                orderIndex: q.orderIndex,
            };
        }),
    };
}
