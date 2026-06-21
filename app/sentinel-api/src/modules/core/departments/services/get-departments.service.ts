import { type DbClient } from '@sentinel/db';
import { getDepartmentsData } from '../data/get-departments';
import { loadEffectiveRows } from '../../inheritance/effective-row-loader';
import { paginateItems } from '../../../../lib/pagination';

export type GetDepartmentsServiceArgs = {
    dbClient: DbClient;
    institutionId?: string;
    search?: string;
    departmentId?: string;
    page?: number;
    pageSize?: number;
};

/**
 * Retrieves departments for an institution, resolving inheritance status,
 * filters by department ID if provided, and applies pagination.
 */
export async function getDepartmentsService({
    dbClient,
    institutionId,
    search,
    departmentId,
    page,
    pageSize,
}: GetDepartmentsServiceArgs) {
    const rawDepartments = await loadEffectiveRows<any>({
        dbClient,
        institutionId,
        idKey: 'department_id',
        loadRows: (scopeInstitutionId) =>
            getDepartmentsData({ dbClient, institutionId: scopeInstitutionId, search }),
    });

    const scopedDepartments = departmentId
        ? rawDepartments.filter((department: any) => department.department_id === departmentId)
        : rawDepartments;

    return paginateItems(
        scopedDepartments.map((department: any) => ({
            institution_id: department.institution_id,
            institution_name: department.institution_name ?? null,
            department_id: department.department_id,
            department_name: department.department_name,
            department_code: department.department_code,
            source_record_id: department.sourceRecordId,
            inheritance_status: department.inheritanceStatus,
            origin_institution_id: department.originInstitutionId,
            effective_institution_id: department.effectiveInstitutionId,
            is_local: department.isLocal,
            is_inherited: department.isInherited,
            is_overridden: department.isOverridden,
            is_hidden: department.isHidden,
            isLocal: department.isLocal,
            isInherited: department.isInherited,
            isOverridden: department.isOverridden,
            isHidden: department.isHidden,
            created_at: department.created_at,
            created_by: department.creator_first_name
                ? `${department.creator_first_name} ${department.creator_last_name}`
                : department.created_by,
            updated_at: department.updated_at,
            updated_by: department.updater_first_name
                ? `${department.updater_first_name} ${department.updater_last_name}`
                : department.updated_by,
        })),
        page,
        pageSize,
    );
}

export type GetDepartmentsServiceResponse = Awaited<ReturnType<typeof getDepartmentsService>>;
