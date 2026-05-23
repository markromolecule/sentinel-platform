import { type DbClient } from '@sentinel/db';
import { updateStudentWhitelistData } from '../data/update-student-whitelist';
import { assertStudentWhitelistStudentNumberAvailable } from '../helpers/assert-student-whitelist-student-number-available';
import { buildUpdateStudentWhitelistValues } from '../helpers/build-student-whitelist-write-values';
import { enforceAdminScope } from '../helpers/enforce-admin-scope';
import { getRequiredStudentWhitelistRecord } from '../helpers/get-required-student-whitelist-record';
import { normalizeStudentNumber } from '../helpers/normalize-student-whitelist-values';
import { resolveStudentWhitelistInstitutionId } from '../helpers/resolve-student-whitelist-scope';
import {
    isDuplicateStudentWhitelistError,
    throwDuplicateStudentWhitelistError,
} from '../helpers/student-whitelist-errors';
import { validateAcademicScope } from '../helpers/validate-academic-scope';
import {
    verifyRequesterInstitutionAccess,
    verifyRequesterPermissions,
} from '../helpers/verify-requester-permissions';
import type { UpdateStudentWhitelistArgs } from '../student-whitelist.types';
import { ActivityNotificationService } from '../../../general/notification/services/activity-notification.service';

export async function updateStudentWhitelist(
    dbClient: DbClient,
    {
        id,
        requesterRole,
        requesterInstitutionId,
        requesterDepartmentId,
        requesterCourseId,
        requesterUserId,
        values,
    }: UpdateStudentWhitelistArgs,
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

    const institutionId =
        resolveStudentWhitelistInstitutionId({
            requesterRole,
            requesterInstitutionId,
            requestedInstitutionId: values.institution_id,
        }) ?? existingRecord.institution_id;

    const departmentId = values.department_id ?? existingRecord.department_id;
    const courseId = values.course_id ?? existingRecord.course_id;

    enforceAdminScope({
        requesterRole,
        requesterDepartmentId,
        requesterCourseId,
        departmentId,
        courseId,
    });

    await validateAcademicScope(dbClient, {
        institutionId,
        departmentId,
        courseId,
    });

    const studentNumber = normalizeStudentNumber(
        values.student_number ?? existingRecord.student_number,
    );

    await assertStudentWhitelistStudentNumberAvailable({
        dbClient,
        institutionId,
        studentNumber,
        excludeId: id,
    });

    try {
        await updateStudentWhitelistData({
            dbClient,
            id,
            values: buildUpdateStudentWhitelistValues({
                institutionId,
                departmentId,
                courseId,
                requesterUserId,
                studentNumber,
                values,
                existingRecord,
            }),
        });
    } catch (error) {
        if (isDuplicateStudentWhitelistError(error)) {
            throwDuplicateStudentWhitelistError();
        }

        throw error;
    }

    const updatedRecord = await getRequiredStudentWhitelistRecord(dbClient, id, {
        institutionId,
        departmentId,
        courseId,
    });

    await ActivityNotificationService.notifyGenericInstitutionActivity({
        dbClient,
        actorUserId: requesterUserId,
        institutionId: updatedRecord.institution_id,
        operation: 'UPDATED',
        targetType: 'STUDENT_WHITELIST',
        targetId: updatedRecord.whitelist_id,
        targetLabel: `${updatedRecord.first_name || ''} ${updatedRecord.last_name} (${updatedRecord.student_number})`,
        title: 'Student whitelist record updated',
        message: `A student whitelist record was updated for ${updatedRecord.first_name || ''} ${updatedRecord.last_name} (${updatedRecord.student_number})`,
        sourceModule: 'student_whitelist',
        sourceAction: 'update',
        metadata: {
            studentNumber: updatedRecord.student_number,
            whitelistId: updatedRecord.whitelist_id,
        },
    });

    return updatedRecord;
}
