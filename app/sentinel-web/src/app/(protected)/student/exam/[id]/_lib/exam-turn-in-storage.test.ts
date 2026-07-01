import { beforeEach, describe, expect, it } from 'vitest';
import {
    clearStoredExamTurnInPreview,
    readStoredExamTurnInPreview,
    writeStoredExamTurnInPreview,
} from './exam-turn-in-storage';

const examId = '11111111-1111-1111-1111-111111111111';

describe('exam turn-in storage', () => {
    beforeEach(() => {
        window.sessionStorage.clear();
    });

    it('persists redacted previews with score visibility metadata', () => {
        writeStoredExamTurnInPreview({
            examId,
            sessionId: 'session-1',
            answers: { 'question-1': 'A' },
            elapsedSeconds: 120,
            releaseScoreMode: 'MANUAL_RELEASE',
            scoreVisible: false,
            summary: {
                score: null,
                totalScore: null,
                percentage: null,
                answeredCount: 10,
                autoGradableQuestionCount: 10,
                manualReviewQuestionCount: 1,
                requiresManualReview: true,
            },
            storedAt: '2026-07-01T00:00:00.000Z',
        });

        expect(readStoredExamTurnInPreview(examId)).toEqual({
            examId,
            sessionId: 'session-1',
            answers: { 'question-1': 'A' },
            elapsedSeconds: 120,
            releaseScoreMode: 'MANUAL_RELEASE',
            scoreVisible: false,
            summary: {
                score: null,
                totalScore: null,
                percentage: null,
                answeredCount: 10,
                autoGradableQuestionCount: 10,
                manualReviewQuestionCount: 1,
                requiresManualReview: true,
            },
            storedAt: '2026-07-01T00:00:00.000Z',
        });
    });

    it('normalizes older previews that did not store score visibility fields', () => {
        window.sessionStorage.setItem(
            `sentinel-web:exam-turn-in-preview:${examId}`,
            JSON.stringify({
                examId,
                sessionId: 'session-legacy',
                answers: { 'question-1': 'B' },
                elapsedSeconds: 90,
                summary: {
                    score: 8,
                    totalScore: 10,
                    percentage: 80,
                    answeredCount: 9,
                    autoGradableQuestionCount: 9,
                    manualReviewQuestionCount: 0,
                    requiresManualReview: false,
                },
                storedAt: '2026-07-01T00:00:00.000Z',
            }),
        );

        expect(readStoredExamTurnInPreview(examId)).toMatchObject({
            examId,
            sessionId: 'session-legacy',
            releaseScoreMode: 'AUTO_RELEASE',
            scoreVisible: true,
            summary: {
                score: 8,
                totalScore: 10,
                percentage: 80,
            },
        });
    });

    it('clears a stored preview', () => {
        writeStoredExamTurnInPreview({
            examId,
            sessionId: 'session-1',
            answers: {},
            elapsedSeconds: 0,
            releaseScoreMode: 'AUTO_RELEASE',
            scoreVisible: true,
            summary: {
                score: 0,
                totalScore: 0,
                percentage: null,
                answeredCount: 0,
                autoGradableQuestionCount: 0,
                manualReviewQuestionCount: 0,
                requiresManualReview: false,
            },
            storedAt: '2026-07-01T00:00:00.000Z',
        });

        clearStoredExamTurnInPreview(examId);

        expect(readStoredExamTurnInPreview(examId)).toBeNull();
    });
});
