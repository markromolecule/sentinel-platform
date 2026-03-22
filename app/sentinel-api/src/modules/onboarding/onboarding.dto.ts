import { z } from '@hono/zod-openapi';
import { departmentSchemaOpenApi } from '../departments/departments.dto';

// --- Shared Entity Schemas ---
export const studentSchemaObject = {
    student_id: z.uuid(),
    student_number: z.string(),
    institution_id: z.uuid(),
    department_id: z.uuid().nullable(),
    course_id: z.uuid().nullable(),
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

export const courseSchemaObject = {
    course_id: z.uuid(),
    code: z.string(),
    title: z.string(),
    department_id: z.uuid().nullable(),
    institution_id: z.uuid().nullable(),
    created_at: z.union([z.coerce.date(), z.string()]).nullable().openapi({
        example: new Date().toISOString(),
    }),
};

export const courseSchema = z.object(courseSchemaObject);
export const courseSchemaOpenApi = courseSchema.openapi('Course');

// --- Operation Schemas ---

// Create Student Profile Operation
export const createStudentSchema = {
    body: z.object({
        firstName: z.string().min(1, 'First name is required'),
        lastName: z.string().min(1, 'Last name is required'),
        studentNumber: z.string().min(1, 'Student number is required'),
        institutionId: z.uuid('Invalid institution ID format'),
        departmentId: z.uuid('Invalid department ID format').optional(),
        courseId: z.uuid('Invalid course ID format').optional(),
    }),
    response: z.object({
        message: z.string(),
        data: studentSchemaOpenApi,
    }),
};

// Get Institutions Operation
export const getInstitutionsSchema = {
    response: z.object({
        message: z.string(),
        data: z.array(institutionSchemaOpenApi),
    }),
};

// Get Departments Operation
export const getDepartmentsSchema = {
    query: z.object({
        institutionId: z.string().uuid().optional(),
    }),
    response: z.object({
        message: z.string(),
        data: z.array(departmentSchemaOpenApi),
    }),
};

// Get Courses Operation
export const getCoursesSchema = {
    query: z.object({
        departmentId: z.string().uuid().optional(),
        institutionId: z.string().uuid().optional(),
    }),
    response: z.object({
        message: z.string(),
        data: z.array(courseSchemaOpenApi),
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

export type GetInstitutionsResponse = z.infer<typeof getInstitutionsSchema.response>;
export type GetDepartmentsResponse = z.infer<typeof getDepartmentsSchema.response>;
export type GetCoursesResponse = z.infer<typeof getCoursesSchema.response>;
export type GetInstitutionResponse = z.infer<typeof getInstitutionSchema.response>;
