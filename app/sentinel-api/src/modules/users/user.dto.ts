import { z } from '@hono/zod-openapi';
import { Schema } from '@sentinel/shared';

const { userFormSchema: userBodySchema } = Schema;

// User Schema
const userSchemaObject = {
    user_id: z.string().uuid(),
    firstName: z.string().openapi({ example: 'John' }),
    lastName: z.string().openapi({ example: 'Doe' }),
    email: z.string().email().openapi({ example: 'john.doe@example.com' }),
    role: z
        .enum(['admin', 'superadmin', 'proctor', 'instructor', 'student', 'disciplinary_officer'])
        .openapi({ example: 'student' }),
    department: z
        .string()
        .nullable()
        .openapi({ example: 'SOECA' }),
    departmentCode: z.string().nullable().openapi({ example: 'SOECA' }),
    department_id: z.string().uuid().nullable(),
    studentNo: z.string().nullable().openapi({ example: '2023-0001' }),
    employeeNo: z.string().nullable().openapi({ example: 'EMP-2023-0001' }),
    course: z.string().nullable().openapi({ example: 'BSIT-MWA, BSCS' }),
    course_id: z.string().uuid().nullable(),
    course_ids: z.array(z.string().uuid()).openapi({ example: ['00000000-0000-0000-0000-000000000001'] }),
    courses: z.array(z.string()).openapi({ example: ['Bachelor of Science in Information Technology'] }),
    institution: z.string().nullable().openapi({ example: 'National University - Dasmariñas' }),
    institution_id: z.string().uuid().nullable(),
    status: z
        .enum(['active', 'inactive', 'offline', 'suspended', 'archived'])
        .openapi({ example: 'active' }),
    created_at: z
        .union([z.coerce.date(), z.string()])
        .nullable()
        .openapi({ example: new Date().toISOString() }),
    updated_at: z.union([z.coerce.date(), z.string()]).nullable(),
    created_by: z.string().nullable(),
    updated_by: z.string().nullable(),
};

export const userSchemaOpenApi = z.object(userSchemaObject).openapi('User');

export type UserType = z.infer<typeof userSchemaOpenApi>;

export const getUsersSchema = {
    request: {
        query: z.object({
            search: z.string().optional().openapi({ description: 'Search term' }),
        }),
    },
    response: z.object({
        message: z.string(),
        data: z.array(userSchemaOpenApi),
    }),
};

export type GetUsersResponse = z.infer<typeof getUsersSchema.response>;

// Get Single
export const getUserSchema = {
    params: z.object({
        id: z.string().uuid('Invalid user ID format'),
    }),
    response: z.object({
        message: z.string(),
        data: userSchemaOpenApi,
    }),
};

export type GetUserParams = z.infer<typeof getUserSchema.params>;
export type GetUserResponse = z.infer<typeof getUserSchema.response>;

// Create
export const createUserSchema = {
    body: userBodySchema,
    response: z.object({
        message: z.string(),
        data: userSchemaOpenApi,
    }),
};

export type CreateUserBody = z.infer<typeof createUserSchema.body>;
export type CreateUserResponse = z.infer<typeof createUserSchema.response>;

// Update
export const updateUserSchema = {
    params: z.object({
        id: z.string().uuid('Invalid user ID format'),
    }),
    body: Schema.userFormBaseSchema.partial(),
    response: z.object({
        message: z.string(),
        data: userSchemaOpenApi,
    }),
};

export type UpdateUserParams = z.infer<typeof updateUserSchema.params>;
export type UpdateUserBody = z.infer<typeof updateUserSchema.body>;
export type UpdateUserResponse = z.infer<typeof updateUserSchema.response>;

// Delete
export const deleteUserSchema = {
    params: z.object({
        id: z.string().uuid('Invalid user ID format'),
    }),
    response: z.object({
        message: z.string(),
        data: z.null(),
    }),
};

export type DeleteUserParams = z.infer<typeof deleteUserSchema.params>;
export type DeleteUserResponse = z.infer<typeof deleteUserSchema.response>;

// Invite
export const inviteUserSchema = {
    body: userBodySchema,
    response: z.object({
        message: z.string(),
        data: userSchemaOpenApi,
    }),
};

export type InviteUserBody = z.infer<typeof inviteUserSchema.body>;
export type InviteUserResponse = z.infer<typeof inviteUserSchema.response>;
