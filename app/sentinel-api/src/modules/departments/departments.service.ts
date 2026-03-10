import { getDepartmentsData } from './data/get-departments';
import { createDepartmentData } from './data/create-department';
import { updateDepartmentData } from './data/update-department';
import { deleteDepartmentData } from './data/delete-department';
import { type DbClient } from '@sentinel/db';

export class DepartmentService {
    static async getDepartments(dbClient: DbClient, institutionId: string) {
        return await getDepartmentsData({ dbClient, institutionId });
    }

    static async createDepartment(
        dbClient: DbClient,
        data: { name: string; code?: string; createdBy?: string; institutionId: string },
    ) {
        return await createDepartmentData({
            dbClient,
            values: {
                department_name: data.name,
                department_code: data.code ?? null,
                created_by: data.createdBy,
                institution_id: data.institutionId,
            },
        });
    }

    static async updateDepartment(
        dbClient: DbClient,
        id: string,
        data: {
            name?: string;
            code?: string;
            updatedBy?: string;
        },
    ) {
        return await updateDepartmentData({
            dbClient,
            id,
            values: {
                ...(data.name !== undefined ? { department_name: data.name } : {}),
                ...(data.code !== undefined ? { department_code: data.code } : {}),
                updated_by: data.updatedBy,
                updated_at: new Date().toISOString(),
            },
        });
    }

    static async deleteDepartment(dbClient: DbClient, id: string) {
        return await deleteDepartmentData({
            dbClient,
            id,
        });
    }
}
