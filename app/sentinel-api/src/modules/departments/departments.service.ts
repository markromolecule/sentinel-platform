import { getDepartmentsData } from './data/get-departments';
import { createDepartmentData } from './data/create-department';
import { updateDepartmentData } from './data/update-department';
import { deleteDepartmentData } from './data/delete-department';
import { type DbClient } from '@sentinel/db';
import { type CreateDepartmentBody, type UpdateDepartmentBody } from './departments.dto';
import { HTTPException } from 'hono/http-exception';

export class DepartmentService {
    private static async getInstitutionName(dbClient: DbClient, institutionId?: string | null) {
        if (!institutionId) {
            return null;
        }

        const institution = await dbClient
            .selectFrom('institutions')
            .select('name')
            .where('id', '=', institutionId)
            .executeTakeFirst();

        return institution?.name ?? null;
    }

    static async getDepartments(dbClient: DbClient, institutionId?: string, search?: string) {
        const rawDepartments = await getDepartmentsData({ dbClient, institutionId, search });

        return rawDepartments.map((department: any) => ({
            institution_id: department.institution_id,
            institution_name: department.institution_name ?? null,
            department_id: department.department_id,
            department_name: department.department_name,
            department_code: department.department_code,
            created_at: department.created_at,
            created_by: department.creator_first_name
                ? `${department.creator_first_name} ${department.creator_last_name}`
                : department.created_by,
            updated_at: department.updated_at,
            updated_by: department.updater_first_name
                ? `${department.updater_first_name} ${department.updater_last_name}`
                : department.updated_by,
        }));
    }

    static async createDepartment(
        dbClient: DbClient,
        data: CreateDepartmentBody,
        createdBy: string,
        institutionId?: string,
    ) {
        const targetInstitutionId = institutionId ?? data.institution_id;

        if (!targetInstitutionId || targetInstitutionId === '') {
            console.error(
                `Attempted to create department for user ${createdBy} without an institutionId`,
            );
            throw new HTTPException(403, {
                message:
                    'Your account is not associated with an institution. Please contact your administrator.',
            });
        }

        try {
            const rawDepartment = await createDepartmentData({
                dbClient,
                values: {
                    department_name: data.name,
                    department_code: data.code ?? null,
                    created_by: createdBy,
                    institution_id: targetInstitutionId,
                },
            });

            const institutionName = await this.getInstitutionName(
                dbClient,
                rawDepartment.institution_id,
            );

            return {
                institution_id: rawDepartment.institution_id,
                institution_name: institutionName,
                department_id: rawDepartment.department_id,
                department_name: rawDepartment.department_name,
                department_code: rawDepartment.department_code,
                created_at: rawDepartment.created_at,
                created_by: rawDepartment.created_by,
                updated_at: rawDepartment.updated_at,
                updated_by: rawDepartment.updated_by,
            };
        } catch (error: any) {
            const code = error?.code ?? error?.cause?.code;
            if (code === 'P2002' || code === '23505') {
                throw new HTTPException(409, { message: 'Department name already exists' });
            }
            throw error;
        }
    }

    static async updateDepartment(
        dbClient: DbClient,
        id: string,
        data: UpdateDepartmentBody,
        updatedBy: string,
        institutionId?: string,
    ) {
        const currentScopeInstitutionId = institutionId;
        const targetInstitutionId = institutionId ?? data.institution_id;

        if (!targetInstitutionId || targetInstitutionId === '') {
            console.error(
                `Attempted to update department ${id} for user ${updatedBy} without an institutionId`,
            );
            throw new HTTPException(403, {
                message:
                    'Your account is not associated with an institution. Please contact your administrator.',
            });
        }

        try {
            const rawDepartment = await updateDepartmentData({
                dbClient,
                id,
                values: {
                    ...(data.name !== undefined ? { department_name: data.name } : {}),
                    ...(data.code !== undefined ? { department_code: data.code } : {}),
                    ...(targetInstitutionId !== undefined ? { institution_id: targetInstitutionId } : {}),
                    updated_by: updatedBy,
                    updated_at: new Date().toISOString(),
                },
                institutionId: currentScopeInstitutionId ?? targetInstitutionId,
            });

            const institutionName = await this.getInstitutionName(
                dbClient,
                rawDepartment.institution_id,
            );

            return {
                institution_id: rawDepartment.institution_id,
                institution_name: institutionName,
                department_id: rawDepartment.department_id,
                department_name: rawDepartment.department_name,
                department_code: rawDepartment.department_code,
                created_at: rawDepartment.created_at,
                created_by: rawDepartment.created_by,
                updated_at: rawDepartment.updated_at,
                updated_by: rawDepartment.updated_by,
            };
        } catch (error: any) {
            const code = error?.code ?? error?.cause?.code;
            if (code === 'P2002' || code === '23505') {
                throw new HTTPException(409, { message: 'Department name already exists' });
            }
            if (error.name === 'NotFoundError') {
                throw new HTTPException(404, { message: 'Department not found' });
            }
            throw error;
        }
    }

    static async deleteDepartment(
        dbClient: DbClient,
        id: string,
        deletedBy: string,
        institutionId?: string,
    ) {
        if (institutionId === '') {
            console.error(
                `Attempted to delete department ${id} for user ${deletedBy} without an institutionId`,
            );
            throw new HTTPException(403, {
                message:
                    'Your account is not associated with an institution. Please contact your administrator.',
            });
        }

        try {
            return await deleteDepartmentData({ dbClient, id, institutionId });
        } catch (error: any) {
            const code = error?.code ?? error?.cause?.code;
            if (code === 'P2003' || code === '23503') {
                throw new HTTPException(409, {
                    message: 'Cannot delete department because it is being used.',
                });
            }
            if (error.name === 'NotFoundError') {
                throw new HTTPException(404, { message: 'Department not found' });
            }
            throw error;
        }
    }
}
