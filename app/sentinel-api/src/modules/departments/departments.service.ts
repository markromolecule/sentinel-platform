import { getDepartmentsData } from './data/get-departments';
import { createDepartmentData } from './data/create-department';
import { updateDepartmentData } from './data/update-department';
import { deleteDepartmentData } from './data/delete-department';
import { dbClient } from '../../lib/create-db-client';

export class DepartmentService {
    static async getDepartments() {
        return await getDepartmentsData({ dbClient });
    }

    static async createDepartment(data: { name: string; code?: string; createdBy?: string }) {
        return await createDepartmentData({
            dbClient,
            values: {
                department_name: data.name,
                department_code: data.code,
                created_by: data.createdBy,
            },
        });
    }

    static async updateDepartment(id: string, data: { name?: string; code?: string }) {
        return await updateDepartmentData({
            dbClient,
            id,
            values: {
                department_name: data.name,
                department_code: data.code,
            },
        });
    }

    static async deleteDepartment(id: string) {
        return await deleteDepartmentData({
            dbClient,
            id,
        });
    }
}
