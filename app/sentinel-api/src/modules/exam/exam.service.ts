import { dbClient as db } from '../../lib/create-db-client';
import { sql } from 'kysely';

export class ExamService {
    // Create an initial draft
    static async createDraftExam(data: {
        title: string;
        subject_id?: string;
        duration_minutes: number;
        passing_score: number;
        difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
        created_by: string;
    }) {
        const exam = await db
            .insertInto('exams')
            .values({
                title: data.title,
                subject_id: data.subject_id,
                duration_minutes: data.duration_minutes,
                passing_score: data.passing_score,
                difficulty: data.difficulty,
                status: 'DRAFT',
                created_by: data.created_by,
                question_count: 0,
            })
            .returningAll()
            .executeTakeFirstOrThrow();

        // Also create default exam configuration
        await db
            .insertInto('exam_configurations')
            .values({
                exam_id: exam.exam_id,
                allowed_devices: [],
            })
            .execute();

        return exam;
    }

    // Save builder state (Upsert questions)
    static async saveBuilderState(
        examId: string,
        questions: Array<{
            id?: string; // if existing
            type: 'MULTIPLE_CHOICE' | 'IDENTIFICATION' | 'ESSAY' | 'ENUMERATION' | 'TRUE_FALSE';
            content: unknown;
            points: number;
            orderIndex: number;
        }>,
    ) {
        // Run in transaction
        const updatedExam = await db.transaction().execute(async (tx) => {
            // First, get existing questions for this exam
            const existingQuestions = await tx
                .selectFrom('exam_questions')
                .selectAll()
                .where('exam_id', '=', examId)
                .execute();

            const incomingQuestionIds = questions.filter((q) => q.id).map((q) => q.id);

            // Delete questions that were removed
            const toDelete = existingQuestions.filter(
                (eq) => !incomingQuestionIds.includes(eq.question_id),
            );
            if (toDelete.length > 0) {
                await tx
                    .deleteFrom('exam_questions')
                    .where(
                        'question_id',
                        'in',
                        toDelete.map((d) => d.question_id),
                    )
                    .execute();
            }

            // Upsert incoming
            for (const q of questions) {
                if (
                    q.id &&
                    incomingQuestionIds.includes(q.id) &&
                    existingQuestions.some((eq) => eq.question_id === q.id)
                ) {
                    // Update
                    await tx
                        .updateTable('exam_questions')
                        .where('question_id', '=', q.id)
                        .set({
                            question_type: q.type,
                            content: JSON.stringify(q.content),
                            points: q.points,
                            order_index: q.orderIndex,
                            updated_at: new Date(),
                        })
                        .execute();
                } else {
                    // Create
                    await tx
                        .insertInto('exam_questions')
                        .values({
                            exam_id: examId,
                            question_type: q.type,
                            content: JSON.stringify(q.content),
                            points: q.points,
                            order_index: q.orderIndex,
                        })
                        .execute();
                }
            }

            // Update question_count on exam
            const updatedExamResult = await tx
                .updateTable('exams')
                .where('exam_id', '=', examId)
                .set({
                    question_count: questions.length,
                    updated_at: new Date(),
                })
                .returningAll()
                .executeTakeFirstOrThrow();

            return updatedExamResult;
        });

        return updatedExam;
    }

    // Get an exam by ID including questions
    static async getExamWithQuestions(examId: string) {
        const exam = await db
            .selectFrom('exams')
            .selectAll()
            .where('exam_id', '=', examId)
            .executeTakeFirst();

        if (!exam) return null;

        const questions = await db
            .selectFrom('exam_questions')
            .selectAll()
            .where('exam_id', '=', examId)
            .orderBy('order_index', 'asc')
            .execute();

        return {
            ...exam,
            exam_questions: questions,
        };
    }
}
