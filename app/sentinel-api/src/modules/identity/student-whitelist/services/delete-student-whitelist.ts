import { type DbClient } from '@sentinel/db';
import { deleteStudentWhitelistData } from '../data/delete-student-whitelist';
import { getRequiredStudentWhitelistRecord } from '../helpers/get-required-student-whitelist-record';
import {
    verifyRequesterInstitutionAccess,
    verifyRequesterPermissions,
} from '../helpers/verify-requester-permissions';
import type { DeleteStudentWhitelistArgs } from '../student-whitelist.types';

export async function deleteStudentWhitelist(
    dbClient: DbClient,
    { id, requesterRole, requesterInstitutionId }: DeleteStudentWhitelistArgs,
) {
    verifyRequesterPermissions({
        requesterRole,
        requesterInstitutionId,
    });

    const existingRecord = await getRequiredStudentWhitelistRecord(dbClient, id);

    verifyRequesterInstitutionAccess({
        requesterRole,
        requesterInstitutionId,
        institutionId: existingRecord.institution_id,
    });

    if (existingRecord.claimed_user_id) {
        throw new Error(
            'Cannot delete a claimed whitelist record. Delete the linked student account first so the record returns to an unclaimed state.',
        );
    }

    await deleteStudentWhitelistData({
        dbClient,
        id,
    });
}
