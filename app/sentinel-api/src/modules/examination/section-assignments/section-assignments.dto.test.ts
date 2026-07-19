import { describe, expect, it } from 'vitest';
import { createExamSectionAssignmentsBatchSchema } from './section-assignments.dto';

describe('createExamSectionAssignmentsBatchSchema DTO', () => {
    it('successfully parses a complete and valid batch payload', () => {
        const payload = {
            assignments: [
                {
                    sectionId: '11111111-1111-4111-8111-111111111111',
                    classGroupId: '22222222-2222-4222-8222-222222222222',
                    roomId: '33333333-3333-4333-8333-333333333333',
                    instructorId: '44444444-4444-4444-8444-444444444444',
                },
            ],
        };
        const result = createExamSectionAssignmentsBatchSchema.body.safeParse(payload);
        expect(result.success).toBe(true);
    });

    it('rejects an empty assignments array', () => {
        const payload = {
            assignments: [],
        };
        const result = createExamSectionAssignmentsBatchSchema.body.safeParse(payload);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].message).toBe(
                'At least one classroom assignment is required.',
            );
        }
    });

    it('rejects missing or null required fields', () => {
        const payload = {
            assignments: [
                {
                    sectionId: '11111111-1111-4111-8111-111111111111',
                    classGroupId: null, // invalid
                    roomId: '33333333-3333-4333-8333-333333333333',
                    instructorId: '44444444-4444-4444-8444-444444444444',
                },
            ],
        };
        const result = createExamSectionAssignmentsBatchSchema.body.safeParse(payload);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].message).toBe('Classroom is required.');
        }
    });
});
