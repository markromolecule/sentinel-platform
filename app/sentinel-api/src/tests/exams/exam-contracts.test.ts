import { HTTPException } from 'hono/http-exception';
import { describe, expect, it } from 'vitest';
import { createExamSchema, updateExamSchema } from '../../modules/examination/exams/exam.dto';
import { assertExamScheduleWindow } from '../../modules/examination/exams/services/assert-exam-schedule-window';
import { mapExamSummaryResponse } from '../../modules/examination/exams/services/map-exam-response';
import { assertExamStructureInput } from '../../modules/examination/exams/services/assert-exam-structure-input';
import { resolveExamStatus } from '../../modules/examination/exams/services/resolve-exam-status';

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

    it('accepts create payloads that target a single section through sectionIds', () => {
        const result = createExamSchema.body.safeParse({
            title: 'Midterm Exam',
            description: 'This is a valid exam description for backend validation.',
            subjectId: '11111111-1111-4111-8111-111111111111',
            sectionIds: ['22222222-2222-4222-8222-222222222222'],
            startDateTime: '2026-04-03T09:00:00.000Z',
            endDateTime: '2026-04-03T10:00:00.000Z',
            durationMinutes: 60,
            passingScore: 60,
            shuffleQuestions: false,
            showCorrectAnswers: false,
            allowReview: true,
            randomizeChoices: false,
        });

        expect(result.success).toBe(true);
    });

    it('accepts update payloads that replace the exam assignment with multiple sections', () => {
        const result = updateExamSchema.body.safeParse({
            title: 'Updated Midterm Exam',
            sectionIds: [
                '22222222-2222-4222-8222-222222222222',
                '33333333-3333-4333-8333-333333333333',
            ],
            roomId: null,
            section: null,
            durationMinutes: 90,
        });

        expect(result.success).toBe(true);
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

    it('resolves published exams as archived after the scheduled end time', () => {
        expect(
            resolveExamStatus({
                status: 'PUBLISHED',
                scheduledDate: '2026-04-03T09:00:00.000Z',
                endDateTime: '2026-04-03T10:00:00.000Z',
                now: new Date('2026-04-03T10:00:01.000Z'),
            }),
        ).toBe('archived');
    });

    it('keeps draft exams as draft even after the scheduled end time', () => {
        expect(
            resolveExamStatus({
                status: 'DRAFT',
                scheduledDate: '2026-04-03T09:00:00.000Z',
                endDateTime: '2026-04-03T10:00:00.000Z',
                now: new Date('2026-04-03T10:00:01.000Z'),
            }),
        ).toBe('draft');
    });

    it('archives published exams using scheduled date plus duration when end time is missing', () => {
        expect(
            resolveExamStatus({
                status: 'PUBLISHED',
                scheduledDate: '2026-04-03T09:00:00.000Z',
                durationMinutes: 60,
                now: new Date('2026-04-03T10:00:01.000Z'),
            }),
        ).toBe('archived');
    });

    it('maps legacy single-section exam records into the multi-section response shape', () => {
        const response = mapExamSummaryResponse({
            exam_id: '11111111-1111-1111-1111-111111111111',
            title: 'Legacy Exam',
            description: 'Legacy description',
            duration_minutes: 60,
            passing_score: 60,
            status: 'PUBLISHED',
            subject_id: '22222222-2222-2222-2222-222222222222',
            subject_title: 'Mathematics',
            section_id: '33333333-3333-3333-3333-333333333333',
            assigned_section_ids: null,
            section_name: 'BSCS 3A',
            room_id: null,
            room_name: null,
            scheduled_date: '2026-04-03T09:00:00.000Z',
            end_date_time: '2026-04-03T10:00:00.000Z',
            published_at: '2026-04-02T09:00:00.000Z',
            question_count: 20,
            created_at: '2026-04-01T09:00:00.000Z',
            updated_at: '2026-04-02T09:00:00.000Z',
        });

        expect(response.sectionId).toBe('33333333-3333-3333-3333-333333333333');
        expect(response.sectionIds).toEqual(['33333333-3333-3333-3333-333333333333']);
        expect(response.sectionName).toBe('BSCS 3A');
    });
});
