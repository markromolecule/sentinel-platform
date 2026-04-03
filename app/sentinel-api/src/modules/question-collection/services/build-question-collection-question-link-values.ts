import { type DB } from '@sentinel/db';
import { type Insertable } from 'kysely';

type QuestionCollectionQuestionLinkInsert = Insertable<DB['question_bank_collection_questions']>;

type ExistingQuestionCollectionQuestionLink = {
    collection_id: string;
    question_bank_question_id: string;
    added_at: Date | string | null;
};

export function buildQuestionCollectionQuestionLinkValues(args: {
    collectionId: string;
    questionIds: string[];
    startOrderIndex?: number;
    addedAt?: Date;
}): QuestionCollectionQuestionLinkInsert[] {
    const { collectionId, questionIds, startOrderIndex = 0 } = args;

    return questionIds.map((questionId, index) => ({
        collection_id: collectionId,
        question_bank_question_id: questionId,
        order_index: startOrderIndex + index,
        added_at: args.addedAt ?? new Date(),
    }));
}

export function buildReorderedQuestionCollectionQuestionLinkValues(
    links: ExistingQuestionCollectionQuestionLink[],
): QuestionCollectionQuestionLinkInsert[] {
    return links.map((link, index) => ({
        collection_id: link.collection_id,
        question_bank_question_id: link.question_bank_question_id,
        order_index: index,
        added_at: link.added_at ?? new Date(),
    }));
}
