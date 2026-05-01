import { describe, expect, it } from 'vitest';
import type { ProctorExam } from '@sentinel/shared/types';
import {
    buildExamExportSections,
    buildMatchingChoices,
    getExamTotalPoints,
    getExpectedAnswerCount,
} from './exam-export-utils';

const baseExam: ProctorExam = {
    id: '11111111-1111-4111-8111-111111111111',
    title: 'Algorithms Final',
    description: '',
    duration: 90,
    passingScore: 75,
    status: 'draft',
    questions: [],
    questionSections: [],
    createdAt: '2026-04-22T00:00:00.000Z',
    updatedAt: '2026-04-22T00:00:00.000Z',
    subject: 'Data Structures',
    questionCount: 0,
    studentsCount: 0,
};

describe('exam export utils', () => {
    it('groups questions by section, question type, and order index', () => {
        const sections = buildExamExportSections({
            ...baseExam,
            questionSections: [
                { id: 'section-b', title: 'Part B', orderIndex: 1 },
                { id: 'section-a', title: 'Part A', orderIndex: 0 },
            ],
            questions: [
                {
                    id: 'essay-1',
                    examId: baseExam.id,
                    sectionId: 'section-a',
                    type: 'ESSAY',
                    points: 10,
                    orderIndex: 2,
                    tags: [],
                    content: { prompt: 'Explain recursion.' },
                },
                {
                    id: 'mc-1',
                    examId: baseExam.id,
                    sectionId: 'section-a',
                    type: 'MULTIPLE_CHOICE',
                    points: 2,
                    orderIndex: 1,
                    tags: [],
                    content: { prompt: 'Pick one.', options: ['A', 'B'] },
                },
                {
                    id: 'tf-1',
                    examId: baseExam.id,
                    sectionId: 'section-b',
                    type: 'TRUE_FALSE',
                    points: 1,
                    orderIndex: 0,
                    tags: [],
                    content: { prompt: 'A tree can be empty.' },
                },
            ],
        });

        expect(sections.map((section) => section.title)).toEqual(['Part A', 'Part B']);
        expect(sections[0]?.groups.map((group) => group.type)).toEqual([
            'MULTIPLE_CHOICE',
            'ESSAY',
        ]);
        expect(sections[0]?.groups[0]?.questions.map((question) => question.id)).toEqual(['mc-1']);
    });

    it('keeps matching choices separate from matching prompts', () => {
        const question = {
            id: 'matching-1',
            examId: baseExam.id,
            type: 'MATCHING',
            points: 5,
            orderIndex: 0,
            tags: [],
            content: {
                prompt: 'Match each term.',
                pairs: [
                    { left: 'Stack', right: 'LIFO' },
                    { left: 'Queue', right: 'FIFO' },
                ],
            },
        } as const;

        expect(buildMatchingChoices(question)).toEqual(['FIFO', 'LIFO']);
    });

    it('summarizes points and expected answer counts without exposing answer keys', () => {
        const enumerationQuestion = {
            id: 'enum-1',
            examId: baseExam.id,
            type: 'ENUMERATION',
            points: 6,
            orderIndex: 0,
            tags: [],
            content: {
                prompt: 'Name sorting algorithms.',
                acceptedAnswers: ['Merge sort', 'Quick sort'],
            },
        } as const;

        expect(
            getExamTotalPoints({
                ...baseExam,
                questions: [enumerationQuestion],
            }),
        ).toBe(6);
        expect(getExpectedAnswerCount(enumerationQuestion)).toBe(2);
    });
});
