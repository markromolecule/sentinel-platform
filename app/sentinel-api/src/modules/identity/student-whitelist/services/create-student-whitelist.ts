import { type DbClient } from '@sentinel/db';
import { createStudentWhitelistData } from '../data/create-student-whitelist';
import { assertStudentWhitelistStudentNumberAvailable } from '../helpers/assert-student-whitelist-student-number-available';
import { buildCreateStudentWhitelistValues } from '../helpers/build-student-whitelist-write-values';
import { getRequiredStudentWhitelistRecord } from '../helpers/get-required-student-whitelist-record';
import { normalizeStudentNumber } from '../helpers/normalize-student-whitelist-values';
import { resolveStudentWhitelistMutationScope } from '../helpers/resolve-student-whitelist-mutation-scope';
import {
    isDuplicateStudentWhitelistError,
    throwDuplicateStudentWhitelistError,
} from '../helpers/student-whitelist-errors';
import type { CreateStudentWhitelistArgs } from '../student-whitelist.types';
import { ActivityNotificationService } from '../../../general/notification/services/activity-notification.service';

export async function createStudentWhitelist(
    dbClient: DbClient,
    {
        requesterRole,
        requesterInstitutionId,
        requesterDepartmentId,
        requesterCourseId,
        requesterUserId,
        values,
    }: CreateStudentWhitelistArgs,
) {
    const scope = await resolveStudentWhitelistMutationScope({
        dbClient,
        requesterRole,
        requesterInstitutionId,
        requesterDepartmentId,
        requesterCourseId,
        requestedInstitutionId: values.institution_id,
        departmentId: values.department_id,
        courseId: values.course_id,
    });

    const studentNumber = normalizeStudentNumber(values.student_number);
    await assertStudentWhitelistStudentNumberAvailable({
        dbClient,
        institutionId: scope.institutionId,
        studentNumber,
    });

    try {
        const createdRecord = await createStudentWhitelistData({
            dbClient,
            values: buildCreateStudentWhitelistValues({
                institutionId: scope.institutionId,
                requesterUserId,
                studentNumber,
                values,
            }),
        });

        const record = await getRequiredStudentWhitelistRecord(
            dbClient,
            createdRecord.whitelist_id,
            {
                institutionId: scope.institutionId,
                departmentId: scope.departmentId,
                courseId: scope.courseId,
            },
        );

        await ActivityNotificationService.notifyGenericInstitutionActivity({
            dbClient,
            actorUserId: requesterUserId,
            institutionId: record.institution_id,
            operation: 'CREATED',
            targetType: 'STUDENT_WHITELIST',
            targetId: record.whitelist_id,
            targetLabel: `${record.first_name || ''} ${record.last_name} (${record.student_number})`,
            title: 'Student whitelist record created',
            message: `A student whitelist record was created for ${record.first_name || ''} ${record.last_name} (${record.student_number})`,
            sourceModule: 'student_whitelist',
            sourceAction: 'create',
            metadata: {
                studentNumber: record.student_number,
                whitelistId: record.whitelist_id,
            },
        });

        return record;
    } catch (error) {
        if (isDuplicateStudentWhitelistError(error)) {
            throwDuplicateStudentWhitelistError();
        }

        throw error;
    }
}
