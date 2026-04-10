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
    room_type: z.enum(['LECTURE', 'LABORATORY', 'VIRTUAL']).default('LECTURE'),
});

export type RoomFormValues = z.infer<typeof roomSchema>;
