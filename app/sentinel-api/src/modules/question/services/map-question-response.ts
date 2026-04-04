import type { QuestionRecord } from '../question.dto';

type RawQuestionRecord = {
    question_bank_question_id: string;
    subject_id: string | null;
    institution_id: string | null;
    question_type: QuestionRecord['type'];
    difficulty: QuestionRecord['difficulty'];
    points: number;
    tags: string[];
    content: unknown;
    prompt: string | null;
    created_at: Date | string | null;
    updated_at: Date | string | null;
    created_by: string | null;
    updated_by: string | null;
    creator_first_name?: string | null;
    creator_last_name?: string | null;
    updater_first_name?: string | null;
    updater_last_name?: string | null;
};

function buildDisplayName(
    firstName?: string | null,
    lastName?: string | null,
    fallback?: string | null,
) {
    if (firstName || lastName) {
        return `${firstName ?? ''} ${lastName ?? ''}`.trim();
    }

    return fallback ?? null;
}

export function mapQuestionResponse(record: RawQuestionRecord): QuestionRecord {
    return {
        id: record.question_bank_question_id,
        subjectId: record.subject_id,
        institutionId: record.institution_id,
        type: record.question_type,
        difficulty: record.difficulty,
        points: record.points,
        tags: record.tags ?? [],
        content: record.content as QuestionRecord['content'],
        prompt: record.prompt,
        createdAt: record.created_at ?? null,
        updatedAt: record.updated_at ?? null,
        createdBy: buildDisplayName(
            record.creator_first_name,
            record.creator_last_name,
            record.created_by,
        ),
        updatedBy: buildDisplayName(
            record.updater_first_name,
            record.updater_last_name,
            record.updated_by,
        ),
    };
}
