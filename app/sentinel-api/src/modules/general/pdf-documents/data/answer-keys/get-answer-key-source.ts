import { type DbClient } from '@sentinel/db';
import { UnrecoverableError } from 'bullmq';
import type { ExamAnswerKeyData, QuestionViewModel } from '../../rendering/exam-answer-key-view-model';

export type AnswerKeySource = {
    examId: string;
    institutionId: string;
    examTitle: string;
    subjectCode: string;
    subjectName: string;
    durationMinutes: number;
    difficulty: string;
    passingScore: number;
    institutionName: string;
    questions: QuestionViewModel[];
};

/**
 * Loads an exam answer-key source for PDF generation.
 *
 * Verifies that:
 * - The exam belongs to the given institution.
 * - Raw, unsanitized question content (with correct answers) is returned.
 *
 * This loader is intentionally private to the answer-key export pipeline.
 * It must NOT be called from any student or staff exam-read route.
 *
 * @param dbClient - Database client
 * @param examId - UUID of the exam
 * @param institutionId - UUID of the requesting institution
 * @returns Typed answer-key source with unsanitized question data
 * @throws UnrecoverableError if exam not found or belongs to a different institution
 */
export async function getAnswerKeySource(
    dbClient: DbClient,
    examId: string,
    institutionId: string,
): Promise<AnswerKeySource> {
    // 1. Load exam metadata and verify institution ownership
    const exam = await dbClient
        .selectFrom('exams as e')
        .leftJoin('subjects as s', 's.subject_id', 'e.subject_id')
        .leftJoin('institutions as i', 'i.id', 'e.institution_id')
        .select([
            'e.exam_id',
            'e.title',
            'e.duration_minutes',
            'e.difficulty',
            'e.passing_score',
            'e.institution_id',
            's.subject_code',
            's.subject_title as subject_name',
            'i.name as institution_name',
        ])
        .where('e.exam_id', '=', examId)
        .executeTakeFirst();

    if (!exam) {
        throw new UnrecoverableError(`Answer key source: exam not found: ${examId}`);
    }

    if (exam.institution_id !== institutionId) {
        throw new UnrecoverableError(
            `Answer key source: exam ${examId} belongs to institution ${exam.institution_id}, not ${institutionId}`,
        );
    }

    // 2. Load questions with full unsanitized content (correct answers included)
    const rawQuestions = await dbClient
        .selectFrom('exam_questions as eq')
        .leftJoin(
            'question_bank_questions as qbq',
            'qbq.question_bank_question_id',
            'eq.source_question_bank_question_id',
        )
        .select([
            'eq.question_id',
            'eq.question_type',
            'eq.content',
            'eq.passage_content',
            'eq.points',
            'eq.order_index',
        ])
        .where('eq.exam_id', '=', examId)
        .orderBy('order_index', 'asc')
        .execute();

    // 3. Map raw questions to view model (unsanitized — never expose via student API)
    const questions: QuestionViewModel[] = rawQuestions.map((q, idx) => {
        const content: Record<string, any> =
            typeof q.content === 'string' ? JSON.parse(q.content) : (q.content as Record<string, any>) ?? {};

        return {
            questionId: q.question_id,
            type: (q.question_type?.toUpperCase() ?? 'MULTIPLE_CHOICE') as QuestionViewModel['type'],
            points: q.points ?? 1,
            text: content.text ?? '',
            passageText: q.passage_content ?? null,

            // Multiple-choice / multiple-select options WITH isCorrect flag
            options: Array.isArray(content.options)
                ? content.options.map((opt: any) => ({
                    optionId: opt.optionId ?? opt.id ?? `opt-${idx}`,
                    optionText: opt.optionText ?? opt.text ?? '',
                    isCorrect: opt.isCorrect ?? opt.is_correct ?? false,
                }))
                : Array.isArray(content.choices)
                    ? content.choices.map((opt: any) => ({
                        optionId: opt.optionId ?? opt.id ?? `opt-${idx}`,
                        optionText: opt.optionText ?? opt.text ?? '',
                        isCorrect: opt.isCorrect ?? opt.is_correct ?? false,
                    }))
                    : undefined,

            // True/False
            trueFalseAnswer: content.trueFalseAnswer ?? content.correctAnswer,

            // Short answer
            shortAnswerPattern: content.shortAnswerPattern ?? content.correctAnswer ?? '',

            // Essay rubric
            rubric: Array.isArray(content.rubric) ? content.rubric : undefined,

            // Fill-in-blank
            blankAnswers: content.blankAnswers ?? content.correctAnswers ?? [],

            // Matching
            matchingPairs: Array.isArray(content.matchingPairs) ? content.matchingPairs : undefined,

            // Ordering
            orderedItems: content.orderedItems ?? content.correctOrder ?? [],
        };
    });

    return {
        examId: exam.exam_id,
        institutionId: exam.institution_id!,
        examTitle: exam.title,
        subjectCode: exam.subject_code ?? 'GEN-101',
        subjectName: exam.subject_name ?? 'General Course',
        durationMinutes: exam.duration_minutes ?? 60,
        difficulty: exam.difficulty ?? 'MEDIUM',
        passingScore: exam.passing_score ?? 50,
        institutionName: exam.institution_name ?? 'Sentinel Institution',
        questions,
    };
}

/**
 * Converts an AnswerKeySource to an ExamAnswerKeyData view model suitable for rendering.
 *
 * @param source - Answer key source loaded by getAnswerKeySource
 * @param generatedBy - Actor label (e.g. requesting user display name or "Sentinel Support")
 * @returns ExamAnswerKeyData view model
 */
export function mapAnswerKeySourceToViewModel(
    source: AnswerKeySource,
    generatedBy: string = 'Sentinel Support',
): ExamAnswerKeyData {
    return {
        examId: source.examId,
        title: source.examTitle,
        subjectCode: source.subjectCode,
        subjectName: source.subjectName,
        durationMinutes: source.durationMinutes,
        difficulty: source.difficulty,
        passingScore: source.passingScore,
        generatedAt: new Date().toISOString(),
        generatedBy,
        institutionName: source.institutionName,
        questions: source.questions,
    };
}
