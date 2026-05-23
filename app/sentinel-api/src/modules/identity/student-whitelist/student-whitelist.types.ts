import { type DbClient } from '@sentinel/db';
import type {
    BulkImportStudentWhitelistSchemaValues,
    CreateStudentWhitelistSchemaValues,
    PurgeStudentWhitelistSchemaValues,
    UpdateStudentWhitelistSchemaValues,
} from '@sentinel/shared/schema';

export type StudentWhitelistRequesterContext = {
    requesterRole?: string;
    requesterInstitutionId?: string;
    requesterDepartmentId?: string | null;
    requesterCourseId?: string | null;
};

export type GetStudentWhitelistArgs = StudentWhitelistRequesterContext & {
    queryInstitutionId?: string;
    departmentId?: string;
    courseId?: string;
    status?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
    search?: string;
};

export type CreateStudentWhitelistArgs = StudentWhitelistRequesterContext & {
    requesterUserId: string;
    values: CreateStudentWhitelistSchemaValues;
};

export type UpdateStudentWhitelistArgs = StudentWhitelistRequesterContext & {
    id: string;
    requesterUserId: string;
    values: UpdateStudentWhitelistSchemaValues;
};

export type BulkImportStudentWhitelistArgs = StudentWhitelistRequesterContext & {
    requesterUserId: string;
    values: BulkImportStudentWhitelistSchemaValues;
};

export type DeleteStudentWhitelistArgs = StudentWhitelistRequesterContext & {
    id: string;
    requesterUserId: string;
};

export type PurgeStudentWhitelistArgs = StudentWhitelistRequesterContext & {
    requesterUserId: string;
    values: PurgeStudentWhitelistSchemaValues;
};

export type StudentWhitelistMutationScopeArgs = StudentWhitelistRequesterContext & {
    dbClient: DbClient;
    requestedInstitutionId?: string;
    departmentId: string;
    courseId: string;
};
