import { type DB } from '@sentinel/db';
import { type Insertable, type Updateable } from 'kysely';
import type {
    CreateQuestionBankCollectionBody,
    UpdateQuestionBankCollectionBody,
} from '../question-bank.dto';

export function resolveQuestionBankCollectionInstitutionId(
    institutionId: string | undefined,
    bodyInstitutionId?: string,
) {
    return institutionId ?? bodyInstitutionId ?? null;
}

export function buildCreateQuestionBankCollectionValues(args: {
    body: CreateQuestionBankCollectionBody;
    institutionId: string | null;
    userId: string;
}): Insertable<DB['question_bank_collections']> {
    const now = new Date();

    return {
        institution_id: args.institutionId,
        name: args.body.name,
        description: args.body.description ?? null,
        tags: args.body.tags ?? [],
        is_public: args.body.isPublic ?? false,
        created_by: args.userId,
        updated_by: args.userId,
        created_at: now,
        updated_at: now,
    };
}

export function buildUpdateQuestionBankCollectionValues(args: {
    body: UpdateQuestionBankCollectionBody;
    userId: string;
}): Updateable<DB['question_bank_collections']> {
    return {
        name: args.body.name,
        description: args.body.description === undefined ? undefined : args.body.description,
        tags: args.body.tags,
        is_public: args.body.isPublic,
        updated_by: args.userId,
        updated_at: new Date(),
    };
}
