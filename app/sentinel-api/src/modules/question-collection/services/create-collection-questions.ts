import { type DbClient } from '@sentinel/db';
import { validateQuestionContentByType } from '../../assessment/assessment-contracts';
import { createQuestionData } from '../../question/data/create-question';
import type { CreateQuestionCollectionBody } from '../question-collection.dto';

type QuestionCollectionQuestionInput = NonNullable<CreateQuestionCollectionBody['questions']>;

export async function createCollectionQuestions(args: {
    dbClient: DbClient;
    questions?: QuestionCollectionQuestionInput;
    institutionId: string | null;
    userId: string;
}) {
    const createdQuestionIds: string[] = [];

    for (const questionInput of args.questions ?? []) {
        const validatedContent = validateQuestionContentByType(
            questionInput.type,
            questionInput.content,
        );
        const question = await createQuestionData({
            dbClient: args.dbClient,
            values: {
                institution_id: args.institutionId,
                subject_id: questionInput.subjectId ?? null,
                created_by: args.userId,
                updated_by: args.userId,
                question_type: questionInput.type,
                content: validatedContent,
                points: questionInput.points,
                tags: questionInput.tags ?? [],
                created_at: new Date(),
                updated_at: new Date(),
            },
        });

        createdQuestionIds.push(question.question_bank_question_id);
    }

    return createdQuestionIds;
}
