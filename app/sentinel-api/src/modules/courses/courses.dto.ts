import { z } from '@hono/zod-openapi';

// Course Schema Object
export const courseSchemaObject = {
    course_id: z.string().uuid(),
    code: z.string().max(20).openapi({
        example: 'CS101',
    }),
    title: z.string().max(255).openapi({
        example: 'Computer Science 101',
    }),
    department_id: z.string().uuid().nullable().openapi({
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    description: z.string().nullable().openapi({
        example: 'Introduction to Computer Science',
    }),
    created_by: z.string().uuid().nullable(),
    created_at: z.union([z.coerce.date(), z.string()]).nullable().openapi({
        example: new Date().toISOString(),
    }),
    updated_at: z.union([z.coerce.date(), z.string()]).nullable().openapi({
        example: new Date().toISOString(),
    }),
};

export const courseSchema = z.object(courseSchemaObject);
export const courseSchemaOpenApi = courseSchema.openapi('Course');

export type CourseType = z.infer<typeof courseSchema>;

// Get Courses Operation
export const getCoursesSchema = {
    response: z.object({
        message: z.string(),
        data: z.array(courseSchemaOpenApi),
    }),
};

// Create Course Operation
export const createCourseSchema = {
    body: z.object({
        code: z.string().min(1, 'Course code is required').max(20),
        title: z.string().min(1, 'Course title is required').max(255),
        department_id: z.string().uuid().optional().nullable(),
        description: z.string().optional().nullable(),
    }),
    response: z.object({
        message: z.string(),
        data: courseSchemaOpenApi,
    }),
};

// Update Course Operation
export const updateCourseSchema = {
    params: z.object({
        id: z.string().uuid('Invalid course ID format'),
    }),
    body: z.object({
        code: z.string().min(1, 'Course code is required').max(20).optional(),
        title: z.string().min(1, 'Course title is required').max(255).optional(),
        department_id: z.string().uuid().optional().nullable(),
        description: z.string().optional().nullable(),
    }),
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
