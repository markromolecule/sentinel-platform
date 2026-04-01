import { z } from '@hono/zod-openapi';
import { Schema } from '@sentinel/shared';

// Pull the shared base schema — single source of truth for field shapes & constraints
// Aliased to avoid conflict with the local response schema below
const { departmentSchema: departmentBodySchema } = Schema;

// Department Response Schema Object (DB/API response shape — includes server-generated fields)
export const departmentSchemaObject = {
    institution_id: z.uuid(),
    institution_name: z.string().nullable(),
    department_id: z.uuid(),
    department_name: z.string(),
    department_code: z.string().nullable().openapi({
        example: 'CS',
    }),
    created_at: z.union([z.coerce.date(), z.string()]).nullable().openapi({
        example: new Date().toISOString(),
    }),
    created_by: z.string().nullable(),
    updated_at: z.union([z.coerce.date(), z.string()]).nullable().openapi({
        example: new Date().toISOString(),
    }),
    updated_by: z.string().nullable(),
};

export const departmentSchema = z.object(departmentSchemaObject);
export const departmentSchemaOpenApi = departmentSchema.openapi('Department');

export type DepartmentType = z.infer<typeof departmentSchema>;

// Get Departments Operation
export const getDepartmentsSchema = {
    request: {
        query: z.object({
            search: z.string().optional().openapi({ description: 'Search term' }),
            institutionId: z.string().uuid().optional().openapi({ description: 'Filter by institution ID' }),
        }),
    },
    response: z.object({
        message: z.string(),
        data: z.array(departmentSchemaOpenApi),
    }),
};

// Create Department Operation — body derived from shared schema
export const createDepartmentSchema = {
    body: departmentBodySchema,
    response: z.object({
        message: z.string(),
        data: departmentSchemaOpenApi,
    }),
};

// Update Department Operation — partial of shared schema (all fields optional)
export const updateDepartmentSchema = {
    params: z.object({
        id: z.string().uuid('Invalid department ID format'),
    }),
    body: departmentBodySchema.partial(),
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
