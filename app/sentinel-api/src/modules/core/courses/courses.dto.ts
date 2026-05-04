import { z } from '@hono/zod-openapi';
import { Schema } from '@sentinel/shared';
import { inheritanceSchemaObject } from '../inheritance/inheritance.dto';

// Pull the shared base schema — single source of truth for field shapes & constraints
const { courseSchema } = Schema;

// Course Response Schema Object (DB/API response shape)
export const courseSchemaObject = {
    institution_id: z.uuid(),
    course_id: z.uuid(),
    code: z.string().max(20).openapi({
        example: 'CS101',
    }),
    title: z.string().max(255).openapi({
        example: 'Computer Science 101',
    }),
    department_id: z.uuid().nullable().openapi({
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    description: z.string().nullable().openapi({
        example: 'Introduction to Computer Science',
    }),
    created_by: z.string().nullable(),
    created_at: z.union([z.coerce.date(), z.string()]).nullable().openapi({
        example: new Date().toISOString(),
    }),
    updated_at: z.union([z.coerce.date(), z.string()]).nullable().openapi({
        example: new Date().toISOString(),
    }),
    updated_by: z.string().nullable(),
    ...inheritanceSchemaObject,
};

export const courseSchemaOpenApi = z.object(courseSchemaObject).openapi('Course');

export type CourseType = z.infer<typeof courseSchemaOpenApi>;

// Get Courses Operation
export const getCoursesSchema = {
    request: {
        query: z.object({
            search: z.string().optional().openapi({ description: 'Search term' }),
            institutionId: z.string().uuid().optional().openapi({ description: 'Filter by institution' }),
        }),
    },
    response: z.object({
        message: z.string(),
        data: z.array(courseSchemaOpenApi),
    }),
};

// Create Course Operation — body derived from shared schema
export const createCourseSchema = {
    body: courseSchema,
    response: z.object({
        message: z.string(),
        data: courseSchemaOpenApi,
    }),
};

// Update Course Operation — partial of shared schema (all fields optional)
export const updateCourseSchema = {
    params: z.object({
        id: z.string().uuid('Invalid course ID format'),
    }),
    body: courseSchema.partial(),
    response: z.object({
        message: z.string(),
        data: courseSchemaOpenApi,
    }),
};

// Delete Course Operation
export const deleteCourseSchema = {
    params: z.object({
        id: z.string().uuid('Invalid course ID format'),
    }),
    response: z.object({
        message: z.string(),
        data: z.null(),
    }),
};

// Type Exports
export type GetCoursesResponse = z.infer<typeof getCoursesSchema.response>;

// Create Course Operation Types
export type CreateCourseBody = z.infer<typeof createCourseSchema.body>;
export type CreateCourseResponse = z.infer<typeof createCourseSchema.response>;

// Update Course Operation Types
export type UpdateCourseParams = z.infer<typeof updateCourseSchema.params>;
export type UpdateCourseBody = z.infer<typeof updateCourseSchema.body>;
export type UpdateCourseResponse = z.infer<typeof updateCourseSchema.response>;

// Delete Course Operation Types
export type DeleteCourseParams = z.infer<typeof deleteCourseSchema.params>;
export type DeleteCourseResponse = z.infer<typeof deleteCourseSchema.response>;

// Bulk Delete Courses Operation
export const deleteCoursesSchema = {
    body: z.object({
        ids: z.array(z.string().uuid()).min(1),
    }),
    response: z.object({
        message: z.string(),
        data: z.null(),
    }),
};

export type DeleteCoursesBody = z.infer<typeof deleteCoursesSchema.body>;
export type DeleteCoursesResponse = z.infer<typeof deleteCoursesSchema.response>;
