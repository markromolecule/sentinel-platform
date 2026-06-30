import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import { getFeedbackData } from '../data/get-feedback';
import { serializeFeedbackRecord } from './create-feedback.service';

export async function getFeedback(
    dbClient: DbClient,
    args: {
        feedbackId: string;
        institutionId?: string;
        canViewAllInstitutions?: boolean;
    },
) {
    const record = await getFeedbackData(dbClient, args.feedbackId);

    if (!record) {
        throw new HTTPException(404, { message: 'Feedback not found.' });
    }

    if (
        !args.canViewAllInstitutions &&
        args.institutionId &&
        record.institutionId &&
        record.institutionId !== args.institutionId
    ) {
        throw new HTTPException(403, {
            message: 'Forbidden. You do not have access to this feedback.',
        });
    }

    return serializeFeedbackRecord(record);
}
