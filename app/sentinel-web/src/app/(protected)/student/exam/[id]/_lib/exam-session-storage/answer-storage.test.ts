/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it } from 'vitest';
import {
    writeStoredExamAnswerDraft,
    readStoredExamAnswerDraft,
    clearStoredExamAnswerDraft,
    reconcileExamAnswerDraft,
} from './answer-storage';

describe('answer-storage', () => {
    const examId = 'exam-100';
    const sessionId = 'session-200';

    beforeEach(() => {
        if (typeof window !== 'undefined') {
            if (!window.localStorage) {
                const store = new Map<string, string>();
                Object.defineProperty(window, 'localStorage', {
                    value: {
                        getItem: (key: string) => store.get(key) ?? null,
                        setItem: (key: string, value: string) => store.set(key, String(value)),
                        removeItem: (key: string) => store.delete(key),
                        clear: () => store.clear(),
                    },
                    configurable: true,
                    writable: true,
                });
            } else {
                window.localStorage.clear();
            }
        }
    });

    it('writes and reads answer draft from local storage', () => {
        writeStoredExamAnswerDraft({
            examId,
            sessionId,
            answers: { q1: 'A' },
            elapsedSeconds: 45,
        });

        const draft = readStoredExamAnswerDraft(examId, sessionId);
        expect(draft).not.toBeNull();
        expect(draft?.answers).toEqual({ q1: 'A' });
        expect(draft?.elapsedSeconds).toBe(45);
    });

    it('clears stored answer draft', () => {
        writeStoredExamAnswerDraft({
            examId,
            sessionId,
            answers: { q1: 'A' },
            elapsedSeconds: 45,
        });

        clearStoredExamAnswerDraft(examId);
        expect(readStoredExamAnswerDraft(examId, sessionId)).toBeNull();
    });

    describe('reconcileExamAnswerDraft', () => {
        it('returns empty source when neither has answers', () => {
            const result = reconcileExamAnswerDraft(null, null);
            expect(result.source).toBe('empty');
            expect(result.answers).toEqual({});
        });

        it('returns local source when server snapshot is empty', () => {
            const localDraft = {
                examId,
                sessionId,
                answers: { q1: 'A' },
                elapsedSeconds: 30,
                storedAt: new Date().toISOString(),
            };

            const result = reconcileExamAnswerDraft(localDraft, {
                answers: {},
                elapsedSeconds: 10,
            });
            expect(result.source).toBe('local');
            expect(result.answers).toEqual({ q1: 'A' });
            expect(result.elapsedSeconds).toBe(30);
        });

        it('returns server source when local draft is empty', () => {
            const result = reconcileExamAnswerDraft(null, {
                answers: { q1: 'B' },
                elapsedSeconds: 60,
                updatedAt: new Date().toISOString(),
            });
            expect(result.source).toBe('server');
            expect(result.answers).toEqual({ q1: 'B' });
            expect(result.elapsedSeconds).toBe(60);
        });

        it('prefers local draft when local timestamp is newer', () => {
            const olderServerDate = new Date(Date.now() - 10000).toISOString();
            const newerLocalDate = new Date(Date.now()).toISOString();

            const localDraft = {
                examId,
                sessionId,
                answers: { q1: 'LocalChoice', q2: 'LocalOnly' },
                elapsedSeconds: 120,
                storedAt: newerLocalDate,
            };

            const result = reconcileExamAnswerDraft(localDraft, {
                answers: { q1: 'ServerChoice', q3: 'ServerOnly' },
                elapsedSeconds: 100,
                updatedAt: olderServerDate,
            });

            expect(result.source).toBe('local');
            expect(result.answers).toEqual({
                q1: 'LocalChoice',
                q2: 'LocalOnly',
                q3: 'ServerOnly',
            });
            expect(result.elapsedSeconds).toBe(120);
        });
    });
});
