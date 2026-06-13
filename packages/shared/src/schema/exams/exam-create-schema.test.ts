import { describe, it, expect } from 'vitest';
import { examCreateFormSchema } from './exam-create-schema';

describe('examCreateFormSchema', () => {
    const validBaseData = {
        title: 'Midterm Examination',
        description: 'Comprehensive evaluation covering all course modules from weeks 1 through 8.',
        classroomIds: ['d3b07384-d113-4956-a5a0-b423366cae66'],
        roomId: 'e8ff47a1-248b-496e-a5a0-b423366cae66',
        startDateTime: '2026-06-14T08:00',
        endDateTime: '2026-06-14T09:00',
        durationMinutes: 60,
        passingScore: 75,
        shuffleQuestions: true,
        showCorrectAnswers: false,
        allowReview: true,
        randomizeChoices: true,
    };

    it('should validate with optional instructorId present', () => {
        const data = {
            ...validBaseData,
            instructorId: 'b09e63eb-b7d4-41c7-9712-53bf8a0b03ed',
        };
        const result = examCreateFormSchema.safeParse(data);
        expect(result.success).toBe(true);
        expect(result.data?.instructorId).toBe('b09e63eb-b7d4-41c7-9712-53bf8a0b03ed');
    });

    it('should validate without instructorId', () => {
        const result = examCreateFormSchema.safeParse(validBaseData);
        expect(result.success).toBe(true);
        expect(result.data?.instructorId).toBeUndefined();
    });

    it('should reject invalid instructorId format', () => {
        const data = {
            ...validBaseData,
            instructorId: 'invalid-uuid',
        };
        const result = examCreateFormSchema.safeParse(data);
        expect(result.success).toBe(false);
    });
});
