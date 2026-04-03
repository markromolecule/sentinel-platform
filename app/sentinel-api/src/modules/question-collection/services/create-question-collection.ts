import { type DbClient } from '@sentinel/db';
import type { CreateQuestionCollectionBody } from '../question-collection.dto';
import { addQuestionCollectionQuestionsData } from '../data/add-question-collection-questions';
import { createQuestionCollectionData } from '../data/create-question-collection';
import { buildQuestionCollectionQuestionLinkValues } from './build-question-collection-question-link-values';
import {
    buildCreateQuestionCollectionValues,
    resolveQuestionCollectionInstitutionId,
} from './build-question-collection-write-values';
import { createCollectionQuestions } from './create-collection-questions';
import { getQuestionCollectionDetailOrThrow } from './get-question-collection-detail';

export async function createQuestionCollection(args: {
    dbClient: DbClient;
    body: CreateQuestionCollectionBody;
    institutionId: string | undefined;
    userId: string;
}) {
    const scopedInstitutionId = resolveQuestionCollectionInstitutionId(
        args.institutionId,
        args.body.institutionId,
    );

    const createdCollection = await args.dbClient.transaction().execute(async (trx) => {
        const collection = await createQuestionCollectionData({
            dbClient: trx,
            values: buildCreateQuestionCollectionValues({
                body: args.body,
                institutionId: scopedInstitutionId,
                userId: args.userId,
            }),
        });

        const createdQuestionIds = await createCollectionQuestions({
            dbClient: trx,
            questions: args.body.questions,
            institutionId: scopedInstitutionId,
            userId: args.userId,
        });
        const orderedQuestionIds = [...(args.body.questionIds ?? []), ...createdQuestionIds];

        if (orderedQuestionIds.length > 0) {
            await addQuestionCollectionQuestionsData({
                dbClient: trx,
                values: buildQuestionCollectionQuestionLinkValues({
                    collectionId: collection.collection_id,
                    questionIds: orderedQuestionIds,
                }),
            });
        }

        return collection;
    });

    return await getQuestionCollectionDetailOrThrow({
        dbClient: args.dbClient,
        id: createdCollection.collection_id,
        institutionId: scopedInstitutionId ?? undefined,
    });
}
