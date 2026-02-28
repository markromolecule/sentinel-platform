import { z } from '@hono/zod-openapi';

// Department Schema Object
export const departmentSchemaObject = {
    department_id: z.string().uuid(),
    department_name: z.string(),
    department_code: z.string().nullable().openapi({
        example: 'CS',
    }),
    created_at: z.union([z.coerce.date(), z.string()]).nullable().openapi({
        example: new Date().toISOString(),
    }),
    created_by: z.string().uuid().nullable(),
};

export const departmentSchema = z.object(departmentSchemaObject);
export const departmentSchemaOpenApi = departmentSchema.openapi('Department');

export type DepartmentType = z.infer<typeof departmentSchema>;

// Get Departments Operation
export const getDepartmentsSchema = {
    response: z.object({
        message: z.string(),
        data: z.array(departmentSchemaOpenApi),
    }),
};

// Create Department Operation
export const createDepartmentSchema = {
    body: z.object({
        name: z.string().min(1, 'Department name is required'),
        code: z.string().optional(),
    }),
    response: z.object({
        message: z.string(),
        data: departmentSchemaOpenApi,
    }),
};

// Update Department Operation
export const updateDepartmentSchema = {
    params: z.object({
        id: z.string().uuid('Invalid department ID format'),
    }),
    body: z.object({
        name: z.string().min(1, 'Department name is required').optional(),
        code: z.string().optional(),
    }),
    response: z.object({
        message: z.string(),
        data: departmentSchemaOpenApi,
    }),
};

// Delete Department Operation
export const deleteDepartmentSchema = {
    params: z.object({
        id: z.string().uuid('Invalid department ID format'),
    }),
    response: z.object({
        message: z.string(),
        data: z.null(),
    }),
};

// Type Exports
export type GetDepartmentsResponse = z.infer<typeof getDepartmentsSchema.response>;

// Create Department Operation Types
export type CreateDepartmentBody = z.infer<typeof createDepartmentSchema.body>;
export type CreateDepartmentResponse = z.infer<typeof createDepartmentSchema.response>;

// Update Department Operation Types
export type UpdateDepartmentParams = z.infer<typeof updateDepartmentSchema.params>;
export type UpdateDepartmentBody = z.infer<typeof updateDepartmentSchema.body>;
export type UpdateDepartmentResponse = z.infer<typeof updateDepartmentSchema.response>;

// Delete Department Operation Types
export type DeleteDepartmentParams = z.infer<typeof deleteDepartmentSchema.params>;
export type DeleteDepartmentResponse = z.infer<typeof deleteDepartmentSchema.response>;
