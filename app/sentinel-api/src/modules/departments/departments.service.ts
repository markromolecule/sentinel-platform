import { getDepartmentsData } from './data/get-departments';
import { createDepartmentData } from './data/create-department';
import { updateDepartmentData } from './data/update-department';
import { deleteDepartmentData } from './data/delete-department';
import { type DbClient } from '../../lib/create-db-client';

export class DepartmentService {
    static async getDepartments(dbClient: DbClient) {
        return await getDepartmentsData({ dbClient });
    }

    static async createDepartment(
        dbClient: DbClient,
        data: { name: string; code?: string; createdBy?: string },
    ) {
        return await createDepartmentData({
            dbClient,
            values: {
                department_name: data.name,
                department_code: data.code ?? null,
                created_by: data.createdBy,
            },
        });
    }

    static async updateDepartment(
        dbClient: DbClient,
        id: string,
        data: {
            name?: string;
            code?: string;
        },
    ) {
        return await updateDepartmentData({
            dbClient,
            id,
            values: {
                department_name: data.name,
                department_code: data.code ?? null,
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
