import { type DbClient } from '@sentinel/db';
import {
    type CreateBulkDepartmentsBody,
    type CreateDepartmentBody,
    type UpdateDepartmentBody,
} from './departments.dto';
import { getDepartmentsService } from './services/get-departments.service';
import { createDepartmentService } from './services/create-department.service';
import { bulkCreateDepartmentsService } from './services/bulk-create-departments.service';
import { updateDepartmentService } from './services/update-department.service';
import { deleteDepartmentService } from './services/delete-department.service';
import { deleteDepartmentsService } from './services/delete-departments.service';

export class DepartmentService {
    /**
     * @deprecated Use getDepartmentsService directly
     */
    static async getDepartments(
        dbClient: DbClient,
        institutionId?: string,
        search?: string,
        departmentId?: string,
        page?: number,
        pageSize?: number,
    ) {
        return getDepartmentsService({
            dbClient,
            institutionId,
            search,
            departmentId,
            page,
            pageSize,
        });
    }

    /**
     * @deprecated Use createDepartmentService directly
     */
    static async createDepartment(
        dbClient: DbClient,
        data: CreateDepartmentBody,
        createdBy: string,
        institutionId?: string,
    ) {
        return createDepartmentService({
            dbClient,
            data,
            createdBy,
            institutionId,
        });
    }

    /**
     * @deprecated Use bulkCreateDepartmentsService directly
     */
    static async bulkCreateDepartments(
        dbClient: DbClient,
        data: CreateBulkDepartmentsBody,
        createdBy: string,
        institutionId?: string,
    ) {
        return bulkCreateDepartmentsService({
            dbClient,
            data,
            createdBy,
            institutionId,
        });
    }

    /**
     * @deprecated Use updateDepartmentService directly
     */
    static async updateDepartment(
        dbClient: DbClient,
        id: string,
        data: UpdateDepartmentBody,
        updatedBy: string,
        institutionId?: string,
    ) {
        return updateDepartmentService({
            dbClient,
            id,
            data,
            updatedBy,
            institutionId,
        });
    }

    /**
     * @deprecated Use deleteDepartmentService directly
     */
    static async deleteDepartment(
        dbClient: DbClient,
        id: string,
        deletedBy: string,
        institutionId?: string,
    ) {
        return deleteDepartmentService({
            dbClient,
            id,
            deletedBy,
            institutionId,
        });
    }

    /**
     * @deprecated Use deleteDepartmentsService directly
     */
    static async deleteDepartments(
        dbClient: DbClient,
        ids: string[],
        institutionId?: string,
        actorUserId?: string,
    ) {
        return deleteDepartmentsService({
            dbClient,
            ids,
            institutionId,
            actorUserId,
        });
    }
}
