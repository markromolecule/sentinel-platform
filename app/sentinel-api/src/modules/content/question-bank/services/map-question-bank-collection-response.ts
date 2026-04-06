import type {
    QuestionBankCollection,
    QuestionBankCollectionDetail,
} from '../question-bank.dto';
import type { QuestionRecord } from '@/modules/content/question/question.dto';

type RawCollectionRecord = {
    collection_id: string;
    institution_id: string | null;
    name: string;
    description: string | null;
    tags: string[];
    is_public: boolean;
    created_at: Date | string | null;
    updated_at: Date | string | null;
    created_by: string | null;
    updated_by: string | null;
    creator_first_name?: string | null;
    creator_last_name?: string | null;
    updater_first_name?: string | null;
    updater_last_name?: string | null;
    question_count?: number | null;
};

function buildDisplayName(firstName?: string | null, lastName?: string | null, fallback?: string | null) {
    if (firstName || lastName) {
        return `${firstName ?? ''} ${lastName ?? ''}`.trim();
    }

    return fallback ?? null;
}

export function mapQuestionBankCollectionResponse(args: {
    record: RawCollectionRecord;
    questionIds?: string[];
}): QuestionBankCollection {
    const { record, questionIds = [] } = args;

    return {
        id: record.collection_id,
        institutionId: record.institution_id,
        name: record.name,
        description: record.description,
        tags: record.tags ?? [],
        isPublic: record.is_public,
        questionCount: record.question_count ?? questionIds.length,
        questionIds,
        createdAt: record.created_at ?? null,
        updatedAt: record.updated_at ?? null,
        createdBy: buildDisplayName(record.creator_first_name, record.creator_last_name, record.created_by),
        updatedBy: buildDisplayName(record.updater_first_name, record.updater_last_name, record.updated_by),
    };
}

export function mapQuestionBankCollectionDetailResponse(args: {
    record: RawCollectionRecord;
    questionIds: string[];
    questions: QuestionRecord[];
}): QuestionBankCollectionDetail {
    return {
        ...mapQuestionBankCollectionResponse({
            record: args.record,
            questionIds: args.questionIds,
        }),
        questions: args.questions,
    };
}
