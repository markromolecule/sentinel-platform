import { z } from '@hono/zod-openapi';
import { Schema } from '@sentinel/shared';
import { inheritanceSchemaObject } from '../inheritance/inheritance.dto';
import { paginationMetadataSchema, paginationQuerySchema } from '../../../lib/pagination';

// Pull the shared base schema — single source of truth for field shapes & constraints
const { roomSchema: roomBodySchema } = Schema;

// Room Response Schema Object (DB/API response shape — includes server-generated fields)
export const roomSchemaObject = {
    institution_id: z.uuid(),
    institution_name: z.string().nullable(),
    room_id: z.uuid(),
    room_name: z.string(),
    room_code: z.string().nullable().openapi({
        example: 'R101',
    }),
    room_number: z.string().openapi({
        example: '101',
    }),
    room_type: z.enum(['LECTURE', 'LABORATORY', 'VIRTUAL']).openapi({
        example: 'LECTURE',
    }),
    status: z.enum(['AVAILABLE', 'ASSIGNED', 'MAINTENANCE']).openapi({
        example: 'AVAILABLE',
    }),
    created_at: z.union([z.coerce.date(), z.string()]).nullable().openapi({
        example: new Date().toISOString(),
    }),
    created_by: z.string().nullable(),
    updated_at: z.union([z.coerce.date(), z.string()]).nullable().openapi({
        example: new Date().toISOString(),
    }),
    updated_by: z.string().nullable(),
    ...inheritanceSchemaObject,
};

export const roomSchema = z.object(roomSchemaObject);
export const roomSchemaOpenApi = roomSchema.openapi('Room');

export type RoomType = z.infer<typeof roomSchema>;

// Get Rooms Operation
export const getRoomsSchema = {
    request: {
        query: z.object({
            search: z.string().optional().openapi({ description: 'Search term' }),
            institutionId: z
                .string()
                .uuid()
                .optional()
                .openapi({ description: 'Filter by institution ID' }),
            ...paginationQuerySchema.shape,
        }),
    },
    response: z.object({
        message: z.string(),
        data: z.array(roomSchemaOpenApi),
        pagination: paginationMetadataSchema.optional(),
    }),
};

// Create Room Operation — body derived from shared schema
export const createRoomSchema = {
    body: roomBodySchema,
    response: z.object({
        message: z.string(),
        data: roomSchemaOpenApi,
    }),
};

// Update Room Operation — partial of shared schema (all fields optional)
export const updateRoomSchema = {
    params: z.object({
        id: z.string().uuid('Invalid room ID format'),
    }),
    body: roomBodySchema.partial(),
    response: z.object({
        message: z.string(),
        data: roomSchemaOpenApi,
    }),
};

// Delete Room Operation
export const deleteRoomSchema = {
    params: z.object({
        id: z.string().uuid('Invalid room ID format'),
    }),
    response: z.object({
        message: z.string(),
        data: z.null(),
    }),
};

// Bulk Delete Rooms Operation
export const deleteRoomsSchema = {
    body: z.object({
        ids: z.array(z.string().uuid()).min(1),
    }),
    response: z.object({
        message: z.string(),
        data: z.null(),
    }),
};

// Bulk Create Rooms Operation
export const bulkCreateRoomsSchema = {
    body: z.object({
        rooms: z.array(roomBodySchema).min(1),
    }),
    response: z.object({
        message: z.string(),
        data: z.array(roomSchemaOpenApi),
    }),
};

// Type Exports
export type GetRoomsResponse = z.infer<typeof getRoomsSchema.response>;

// Create Room Operation Types
export type CreateRoomBody = z.infer<typeof createRoomSchema.body>;
export type CreateRoomResponse = z.infer<typeof createRoomSchema.response>;

// Update Room Operation Types
export type UpdateRoomParams = z.infer<typeof updateRoomSchema.params>;
export type UpdateRoomBody = z.infer<typeof updateRoomSchema.body>;
export type UpdateRoomResponse = z.infer<typeof updateRoomSchema.response>;

// Delete Room Operation Types
export type DeleteRoomParams = z.infer<typeof deleteRoomSchema.params>;
export type DeleteRoomResponse = z.infer<typeof deleteRoomSchema.response>;

// Bulk Delete Rooms Operation Types
export type DeleteRoomsBody = z.infer<typeof deleteRoomsSchema.body>;
export type DeleteRoomsResponse = z.infer<typeof deleteRoomsSchema.response>;

// Bulk Create Rooms Operation Types
export type BulkCreateRoomsBody = z.infer<typeof bulkCreateRoomsSchema.body>;
export type BulkCreateRoomsResponse = z.infer<typeof bulkCreateRoomsSchema.response>;
