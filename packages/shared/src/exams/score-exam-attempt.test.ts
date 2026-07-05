import { describe, expect, it } from 'vitest';
import { buildExamAttemptQuestionReports, scoreExamAttempt } from './score-exam-attempt';
import type { ExamAttemptAnswers, ExamQuestion } from '../types';
import type { EssayQuestionEvaluation } from '../schema/exams/assessment-schema';

describe('scoreExamAttempt', () => {
    it('scores objective questions and tracks manual-review items', () => {
        const questions: ExamQuestion[] = [
            {
                id: '11111111-1111-1111-1111-111111111111',
                examId: 'exam-1',
                type: 'MULTIPLE_CHOICE',
                points: 5,
                orderIndex: 0,
                tags: [],
                content: {
                    prompt: 'What is 2 + 2?',
                    options: ['3', '4', '5'],
                    correctAnswer: 1,
                },
            },
            {
                id: '22222222-2222-2222-2222-222222222222',
                examId: 'exam-1',
                type: 'ESSAY',
                points: 10,
                orderIndex: 1,
                tags: [],
                content: {
                    prompt: 'Explain your reasoning.',
                },
            },
        ];

        const answers: ExamAttemptAnswers = {
            '11111111-1111-1111-1111-111111111111': '4',
            '22222222-2222-2222-2222-222222222222': 'Because arithmetic.',
        };

        expect(
            scoreExamAttempt({
                questions,
                answers,
            }),
        ).toEqual({
            score: 5,
            totalScore: 15,
            percentage: 33,
            answeredCount: 2,
            autoGradableQuestionCount: 1,
            manualReviewQuestionCount: 1,
            requiresManualReview: true,
        });
    });

    it('scores legacy labeled choice data the same as normalized clean choice data', () => {
        const questions: ExamQuestion[] = [
            {
                id: 'legacy-mc',
                examId: 'exam-1',
                type: 'MULTIPLE_CHOICE',
                points: 2,
                orderIndex: 0,
                tags: [],
                content: {
                    prompt: 'Select the capital of France.',
                    options: ['A. Paris', 'B. Rome', 'C. Madrid', 'D. Berlin'],
                    correctAnswer: 'A. Paris',
                },
            },
            {
                id: 'legacy-mr',
                examId: 'exam-1',
                type: 'MULTIPLE_RESPONSE',
                points: 3,
                orderIndex: 1,
                tags: [],
                content: {
                    prompt: 'Select the prime numbers.',
                    options: ['A. Two', 'B) Three', '(C) Four', 'D - Five'],
                    correctAnswer: ['A. Two', 'B) Three', 'D - Five'],
                },
            },
        ];

        const answers: ExamAttemptAnswers = {
            'legacy-mc': 'Paris',
            'legacy-mr': ['Two', 'Three', 'Five'],
        };

        expect(
            scoreExamAttempt({
                questions,
                answers,
            }),
        ).toEqual({
            score: 5,
            totalScore: 5,
            percentage: 100,
            answeredCount: 2,
            autoGradableQuestionCount: 2,
            manualReviewQuestionCount: 0,
            requiresManualReview: false,
        });
    });
});

describe('buildExamAttemptQuestionReports', () => {
    it('creates report rows with human-readable correct answers and essay evaluations', () => {
        const questions: ExamQuestion[] = [
            {
                id: '11111111-1111-1111-1111-111111111111',
                examId: 'exam-1',
                type: 'MULTIPLE_CHOICE',
                points: 5,
                orderIndex: 0,
                tags: [],
                content: {
                    prompt: 'What is 2 + 2?',
                    options: ['3', '4', '5'],
                    correctAnswer: 1,
                },
            },
            {
                id: '22222222-2222-2222-2222-222222222222',
                examId: 'exam-1',
                type: 'ESSAY',
                points: 10,
                orderIndex: 1,
                tags: [],
                content: {
                    prompt: 'Explain your reasoning.',
                },
            },
            {
                id: '33333333-3333-3333-3333-333333333333',
                examId: 'exam-1',
                type: 'MATCHING',
                points: 4,
                orderIndex: 2,
                tags: [],
                content: {
                    prompt: 'Match the terms.',
                    pairs: [
                        { left: 'A', right: '1' },
                        { left: 'B', right: '2' },
                    ],
                },
            },
        ];

        const answers: ExamAttemptAnswers = {
            '11111111-1111-1111-1111-111111111111': '4',
            '22222222-2222-2222-2222-222222222222': 'Because arithmetic.',
            '33333333-3333-3333-3333-333333333333': {
                A: '1',
                B: '3',
            },
        };

        const evaluations: Record<string, EssayQuestionEvaluation> = {
            '22222222-2222-2222-2222-222222222222': {
                scores: {
                    contentSubstance: 4,
                    structureOrganization: 4,
                    argumentationSupport: 3,
                    styleTone: 3,
                    grammarConventions: 4,
                },
                score: 9,
                feedback: 'Strong explanation.',
            },
        };

        expect(
            buildExamAttemptQuestionReports({
                questions,
                answers,
                evaluations,
            }),
        ).toEqual([
            {
                questionId: '11111111-1111-1111-1111-111111111111',
                questionType: 'MULTIPLE_CHOICE',
                prompt: 'What is 2 + 2?',
                answer: '4',
                correctAnswer: '4',
                isCorrect: true,
                awardedScore: 5,
                maxScore: 5,
                evaluation: null,
                override: null,
            },
            {
                questionId: '22222222-2222-2222-2222-222222222222',
                questionType: 'ESSAY',
                prompt: 'Explain your reasoning.',
                answer: 'Because arithmetic.',
                correctAnswer: null,
                isCorrect: null,
                awardedScore: 9,
                maxScore: 10,
                evaluation: evaluations['22222222-2222-2222-2222-222222222222'],
                override: null,
            },
            {
                questionId: '33333333-3333-3333-3333-333333333333',
                questionType: 'MATCHING',
                prompt: 'Match the terms.',
                answer: {
                    A: '1',
                    B: '3',
                },
                correctAnswer: {
                    A: '1',
                    B: '2',
                },
                isCorrect: false,
                awardedScore: 0,
                maxScore: 4,
                evaluation: null,
                override: null,
            },
        ]);
    });
});
