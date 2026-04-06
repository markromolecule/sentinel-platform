import { HTTPException } from 'hono/http-exception';
import { describe, expect, it } from 'vitest';
import { createExamSchema } from '@/modules/examination/exams/exam.dto';
import { assertExamScheduleWindow } from '@/modules/examination/exams/services/assert-exam-schedule-window';
import { assertExamStructureInput } from '@/modules/examination/exams/services/assert-exam-structure-input';

describe('exam contracts', () => {
    it('rejects create payloads with a non-uuid subject id', () => {
        const result = createExamSchema.body.safeParse({
            title: 'Midterm Exam',
            description: 'This is a valid exam description for backend validation.',
            subjectId: 'CS101',
            section: 'BSCS-3A',
            startDateTime: '2026-04-03T09:00:00.000Z',
            endDateTime: '2026-04-03T10:00:00.000Z',
            durationMinutes: 60,
            passingScore: 60,
            shuffleQuestions: false,
            showCorrectAnswers: false,
            allowReview: true,
            randomizeChoices: false,
        });

        expect(result.success).toBe(false);
    });

    it('accepts a valid exam schedule window', () => {
        expect(() =>
            assertExamScheduleWindow({
                startDateTime: '2026-04-03T09:00:00.000Z',
                endDateTime: '2026-04-03T10:30:00.000Z',
            }),
        ).not.toThrow();
    });

    it('rejects an exam schedule that ends before it starts', () => {
        expect(() =>
            assertExamScheduleWindow({
                startDateTime: '2026-04-03T10:30:00.000Z',
                endDateTime: '2026-04-03T09:00:00.000Z',
            }),
        ).toThrowError(HTTPException);
    });

    it('rejects an exam schedule longer than four hours', () => {
        expect(() =>
            assertExamScheduleWindow({
                startDateTime: '2026-04-03T08:00:00.000Z',
                endDateTime: '2026-04-03T12:30:00.000Z',
            }),
        ).toThrowError(HTTPException);
    });

    it('rejects duplicate section order indexes in the submitted exam structure', () => {
        expect(() =>
            assertExamStructureInput({
                questionSections: [
                    {
                        id: 'ec6bf415-e2cf-4e80-abcc-1ddc94214706',
                        title: 'Part I',
                        orderIndex: 0,
                    },
                    {
                        id: '31699215-76b1-4d55-b38f-8772638b7751',
                        title: 'Part II',
                        orderIndex: 0,
                    },
                ],
            }),
        ).toThrowError(HTTPException);
    });

    it('rejects duplicate question ids in the submitted exam structure', () => {
        expect(() =>
            assertExamStructureInput({
                questions: [
                    {
                        id: '1f6e1d10-b508-4590-b9ff-20878b5b03c4',
                        sectionId: null,
                        sourceQuestionBankQuestionId: null,
                        type: 'MULTIPLE_CHOICE',
                        points: 1,
                        orderIndex: 0,
                        content: {
                            prompt: 'Question 1',
                            options: ['A', 'B'],
                            correctAnswer: 'A',
                        },
                    },
                    {
                        id: '1f6e1d10-b508-4590-b9ff-20878b5b03c4',
                        sectionId: null,
                        sourceQuestionBankQuestionId: null,
                        type: 'TRUE_FALSE',
                        points: 1,
                        orderIndex: 1,
                        content: {
                            prompt: 'Question 2',
                            correctAnswer: true,
                        },
                    },
                ],
            }),
        ).toThrowError(HTTPException);
    });
});
