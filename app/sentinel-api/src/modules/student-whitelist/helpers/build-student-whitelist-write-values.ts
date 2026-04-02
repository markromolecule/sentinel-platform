import { type DB } from '@sentinel/db';
import type {
    CreateStudentWhitelistSchemaValues,
    UpdateStudentWhitelistSchemaValues,
} from '@sentinel/shared/schema';
import { type Insertable, type Updateable } from 'kysely';
import { getRequiredStudentWhitelistRecord } from './get-required-student-whitelist-record';

type ExistingStudentWhitelistRecord = Awaited<ReturnType<typeof getRequiredStudentWhitelistRecord>>;

export function buildCreateStudentWhitelistValues({
    institutionId,
    requesterUserId,
    studentNumber,
    values,
}: {
    institutionId: string;
    requesterUserId: string;
    studentNumber: string;
    values: CreateStudentWhitelistSchemaValues;
}): Insertable<DB['student_whitelist']> {
    return {
        institution_id: institutionId,
        department_id: values.department_id,
        course_id: values.course_id,
        student_number: studentNumber,
        last_name: values.last_name.trim(),
        first_name: values.first_name?.trim() || null,
        status: values.status ?? 'ACTIVE',
        created_by: requesterUserId,
        updated_by: requesterUserId,
    };
}

export function buildUpdateStudentWhitelistValues({
    institutionId,
    departmentId,
    courseId,
    requesterUserId,
    studentNumber,
    values,
    existingRecord,
}: {
    institutionId: string;
    departmentId: string;
    courseId: string;
    requesterUserId: string;
    studentNumber: string;
    values: UpdateStudentWhitelistSchemaValues;
    existingRecord: ExistingStudentWhitelistRecord;
}): Updateable<DB['student_whitelist']> {
    return {
        institution_id: institutionId,
        department_id: departmentId,
        course_id: courseId,
        student_number: studentNumber,
        last_name: values.last_name?.trim() ?? existingRecord.last_name,
        first_name:
            values.first_name !== undefined
                ? values.first_name?.trim() || null
                : existingRecord.first_name,
        status: values.status ?? existingRecord.status,
        updated_by: requesterUserId,
    };
}
