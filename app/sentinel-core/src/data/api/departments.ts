import { createDepartmentService } from '@sentinel/services';
import { apiClient } from '@/data/api/client';

const departmentService = createDepartmentService(apiClient);

export const { getDepartments, createDepartment, updateDepartment, deleteDepartment } =
    departmentService;
