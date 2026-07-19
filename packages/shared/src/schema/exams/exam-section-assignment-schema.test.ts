import { describe, expect, it } from 'vitest';
import {
    createExamSectionAssignmentBatchBodySchema,
    createExamSectionAssignmentBodySchema,
} from './exam-section-assignment-schema';

describe('examSectionAssignmentSchema', () => {
    describe('createExamSectionAssignmentBodySchema (single, permissive)', () => {
        it('allows null or optional fields for single assignment creation to remain backward compatible', () => {
            const validPermissive = {
                sectionId: '11111111-1111-4111-8111-111111111111',
                classGroupId: null,
                roomId: undefined,
                instructorId: null,
            };
            const result = createExamSectionAssignmentBodySchema.safeParse(validPermissive);
            expect(result.success).toBe(true);
        });
    });

    describe('createExamSectionAssignmentBatchBodySchema (batch, strict)', () => {
        it('rejects an empty batch payload', () => {
            const emptyBatch = { assignments: [] };
            const result = createExamSectionAssignmentBatchBodySchema.safeParse(emptyBatch);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('At least one classroom assignment is required.');
            }
        });

        it('rejects assignments missing required fields like classroom, room, or instructor', () => {
            const invalidItem = {
                sectionId: '11111111-1111-4111-8111-111111111111',
                classGroupId: null, // missing classroom
                roomId: '22222222-2222-4222-8222-222222222222',
                instructorId: '33333333-3333-4333-8333-333333333333',
            };
            const result = createExamSectionAssignmentBatchBodySchema.safeParse({ assignments: [invalidItem] });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Classroom is required.');
            }
        });

        it('successfully parses a complete batch payload with valid UUIDs', () => {
            const validBatch = {
                assignments: [
                    {
                        sectionId: '11111111-1111-4111-8111-111111111111',
                        classGroupId: '22222222-2222-4222-8222-222222222222',
                        roomId: '33333333-3333-4333-8333-333333333333',
                        instructorId: '44444444-4444-4444-8444-444444444444',
                    },
                ],
            };
            const result = createExamSectionAssignmentBatchBodySchema.safeParse(validBatch);
            expect(result.success).toBe(true);
        });
    });
});
