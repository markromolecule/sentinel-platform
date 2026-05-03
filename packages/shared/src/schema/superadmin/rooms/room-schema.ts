import * as z from 'zod';

/**
 * Base room body schema.
 * Used for form validation (frontend) AND API body validation (backend).
 * Fields use snake_case matching the database contract.
 */
export const roomSchema = z.object({
    institution_id: z.uuid('Invalid institution ID').optional(),
    name: z.string().min(1, 'Room name is required'),
    code: z.string().optional().nullable(),
    room_number: z
        .string()
        .min(1, 'Room number is required')
        .max(50, 'Room number must not exceed 50 characters'),
    room_type: z.enum(['LECTURE', 'LABORATORY', 'VIRTUAL']),
});

export type RoomFormValues = z.infer<typeof roomSchema>;
