import { beforeEach, describe, expect, it } from 'vitest';
import type { ExamQuestion, ProctorExam } from '@sentinel/shared/types';
import { useExamStore } from './use-exam-store';

function createExam(overrides: Partial<ProctorExam> = {}): ProctorExam {
    return {
        id: 'exam-1',
        title: 'Midterm Exam',
        description: '',
        subject: 'Mathematics',
        subjectId: 'subject-1',
        section: '',
        sectionIds: [],
        classroomId: 'classroom-1',
        classroomName: 'BSIT 1A',
        scheduledDate: '2026-04-13T05:00:00.000Z',
        endDateTime: '2026-04-13T06:00:00.000Z',
        duration: 60,
        passingScore: 75,
        settings: {
            shuffleQuestions: true,
            showCorrectAnswers: false,
            allowReview: true,
            randomizeChoices: true,
        },
        questionSections: [
            {
                id: 'section-1',
                title: 'Section 1',
                orderIndex: 0,
                isCollapsed: false,
            },
        ],
        questions: [],
        status: 'draft',
        ...overrides,
    } as ProctorExam;
}

function createQuestion(id: string): ExamQuestion {
    return {
        id,
        examId: 'exam-1',
        type: 'MULTIPLE_CHOICE',
        difficulty: 'EASY',
        points: 1,
        orderIndex: 0,
        sectionId: 'section-1',
        tags: [],
        content: {
            question: 'What is 2 + 2?',
            options: [
                { id: 'a', text: '3', isCorrect: false },
                { id: 'b', text: '4', isCorrect: true },
            ],
        },
    } as unknown as ExamQuestion;
}

describe('useExamStore', () => {
    beforeEach(() => {
        useExamStore.setState(useExamStore.getInitialState(), true);
    });

    it('preserves unsaved imported questions when the same exam workspace rehydrates', () => {
        const initialExam = createExam();
        const importedQuestion = createQuestion('local-imported-question');

        useExamStore.getState().hydrateExam(initialExam);
        useExamStore.getState().addQuestion(importedQuestion);
        useExamStore.getState().hydrateExam(
            createExam({
                questions: [],
            }),
        );

        expect(useExamStore.getState().questions).toHaveLength(1);
        expect(useExamStore.getState().questions[0]?.id).toBe('local-imported-question');
    });

    it('replaces questions when hydrating a different exam', () => {
        useExamStore.getState().hydrateExam(createExam());
        useExamStore.getState().addQuestion(createQuestion('local-imported-question'));
        useExamStore.getState().hydrateExam(
            createExam({
                id: 'exam-2',
                questions: [createQuestion('server-question')],
            }),
        );

        expect(useExamStore.getState().examId).toBe('exam-2');
        expect(useExamStore.getState().questions).toHaveLength(1);
        expect(useExamStore.getState().questions[0]?.id).toBe('server-question');
    });
});
