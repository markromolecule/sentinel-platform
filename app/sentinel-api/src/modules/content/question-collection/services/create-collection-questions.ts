import { type DbClient } from '@sentinel/db';
import { validateQuestionContentByType } from '@/modules/examination/assessment/assessment-contracts';
import { createQuestionsData } from '@/modules/content/question/data/create-questions';
import type { CreateQuestionCollectionBody } from '../question-collection.dto';

type QuestionCollectionQuestionInput = NonNullable<CreateQuestionCollectionBody['questions']>;

export async function createCollectionQuestions(args: {
    dbClient: DbClient;
    questions?: QuestionCollectionQuestionInput;
    institutionId: string | null;
    userId: string;
}) {
    const now = new Date();
    const values = (args.questions ?? []).map((questionInput) => ({
        institution_id: args.institutionId,
        subject_id: questionInput.subjectId ?? null,
        created_by: args.userId,
        updated_by: args.userId,
        question_type: questionInput.type,
        difficulty: questionInput.difficulty,
        content: validateQuestionContentByType(questionInput.type, questionInput.content),
        points: questionInput.points,
        tags: questionInput.tags ?? [],
        created_at: now,
        updated_at: now,
    }));

    const createdQuestions = await createQuestionsData({
        dbClient: args.dbClient,
        values,
    });

    return createdQuestions.map((question) => question.question_bank_question_id);
}
