import { z } from '@hono/zod-openapi';
import { departmentSchemaOpenApi } from '../departments/departments.dto';

// --- Shared Entity Schemas ---
export const studentSchemaObject = {
    student_id: z.uuid(),
    student_number: z.string(),
    institution_id: z.uuid(),
    department_id: z.uuid().nullable(),
    created_at: z.union([z.coerce.date(), z.string()]).nullable().openapi({
        example: new Date().toISOString(),
    }),
};

export const studentSchema = z.object(studentSchemaObject);
export const studentSchemaOpenApi = studentSchema.openapi('Student');

export const institutionSchemaObject = {
    institution_id: z.uuid(),
    institution_name: z.string(),
    institution_code: z.string().nullable(),
    created_at: z.union([z.coerce.date(), z.string()]).nullable().openapi({
        example: new Date().toISOString(),
    }),
};

export const institutionSchema = z.object(institutionSchemaObject);
export const institutionSchemaOpenApi = institutionSchema.openapi('Institution');

// --- Operation Schemas ---

// Create Student Profile Operation
export const createStudentSchema = {
    body: z.object({
        studentNumber: z.string().min(1, 'Student number is required'),
        institutionId: z.uuid('Invalid institution ID format'),
        departmentId: z.uuid('Invalid department ID format').optional(),
    }),
    response: z.object({
        message: z.string(),
        data: studentSchemaOpenApi,
    }),
};

// Get Departments Operation
export const getDepartmentsSchema = {
    response: z.object({
        message: z.string(),
        data: z.array(departmentSchemaOpenApi),
    }),
};

// Get Default Institution Operation
export const getInstitutionSchema = {
    response: z.object({
        message: z.string(),
        data: institutionSchemaOpenApi,
    }),
};

// --- Type Exports ---
export type CreateStudentBody = z.infer<typeof createStudentSchema.body>;
export type CreateStudentResponse = z.infer<typeof createStudentSchema.response>;

export type GetInstitutionResponse = z.infer<typeof getInstitutionSchema.response>;
