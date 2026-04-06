import { type DB } from '@sentinel/db';
import { type Insertable } from 'kysely';

type QuestionBankCollectionQuestionLinkInsert = Insertable<
    DB['question_bank_collection_questions']
>;

type ExistingQuestionBankCollectionQuestionLink = {
    collection_id: string;
    question_bank_question_id: string;
    added_at: Date | string | null;
};

export function buildQuestionBankCollectionQuestionLinkValues(args: {
    collectionId: string;
    questionIds: string[];
    startOrderIndex?: number;
    addedAt?: Date;
}): QuestionBankCollectionQuestionLinkInsert[] {
    const { collectionId, questionIds, startOrderIndex = 0 } = args;

    return questionIds.map((questionId, index) => ({
        collection_id: collectionId,
        question_bank_question_id: questionId,
        order_index: startOrderIndex + index,
        added_at: args.addedAt ?? new Date(),
    }));
}

export function buildReorderedQuestionBankCollectionQuestionLinkValues(
    links: ExistingQuestionBankCollectionQuestionLink[],
): QuestionBankCollectionQuestionLinkInsert[] {
    return links.map((link, index) => ({
        collection_id: link.collection_id,
        question_bank_question_id: link.question_bank_question_id,
        order_index: index,
        added_at: link.added_at ?? new Date(),
    }));
}
