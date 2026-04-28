import { type DbClient } from '@sentinel/db';
import { validateQuestionContentByType } from '../../../examination/assessment/assessment-contracts';
import { createQuestionsData } from '../../question/data/create-questions';
import type { CreateQuestionBankCollectionBody } from '../question-bank.dto';

type QuestionBankQuestionInput = NonNullable<CreateQuestionBankCollectionBody['questions']>;

export async function createQuestionBankQuestions(args: {
    dbClient: DbClient;
    questions?: QuestionBankQuestionInput;
    institutionId: string | null;
    userId: string;
}) {
    const now = new Date();
    const values = (args.questions ?? []).map((questionInput) => ({
        institution_id: args.institutionId,
        subject_id: questionInput.subjectId ?? null,
        created_by: args.userId,
        updated_by: args.userId,
        source_origin: questionInput.sourceOrigin ?? 'MANUAL',
        source_file_name:
            questionInput.sourceOrigin === 'AI_PDF' ? (questionInput.sourceFileName ?? null) : null,
        source_page_number:
            questionInput.sourceOrigin === 'AI_PDF'
                ? (questionInput.sourcePageNumber ?? null)
                : null,
        source_evidence:
            questionInput.sourceOrigin === 'AI_PDF' ? (questionInput.sourceEvidence ?? null) : null,
        question_type: questionInput.type,
        difficulty: questionInput.difficulty,
        content: validateQuestionContentByType(questionInput.type, questionInput.content),
        points: questionInput.points,
        tags: questionInput.tags ?? [],
        created_at: now,
        updated_at: now,
        // TOS lifecycle fields
        topic: (questionInput as any).topic ?? null,
        cognitive_level: (questionInput as any).cognitiveLevel ?? null,
        predicted_difficulty: (questionInput as any).predictedDifficulty ?? null,
        status: 'ACTIVE' as const,
    }));

    const createdQuestions = await createQuestionsData({
        dbClient: args.dbClient,
        values,
    });

    return createdQuestions.map((question) => question.question_bank_question_id);
}
