import { describe, expect, it } from 'vitest';
import type { Exam } from '@sentinel/shared/types';
import { adaptExamForMobile, resolveMobileExamStatus } from './mobile-exam-display-adapter';

function createMockExam(overrides: Partial<Exam> = {}): Exam {
    return {
        id: 'exam-1',
        title: 'Biology 101 Midterm',
        description: 'Biology Midterm Exam',
        subject: 'Biology',
        duration: 60,
        passingScore: 75,
        status: 'published',
        questions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        scheduledDate: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // 10 mins ago
        endDateTime: new Date(Date.now() + 1000 * 60 * 50).toISOString(), // 50 mins from now
        ...overrides,
    };
}

describe('mobile-exam-display-adapter', () => {
    describe('resolveMobileExamStatus', () => {
        it('normalizes status to turned_in when completedAt is set', () => {
            const exam = createMockExam({
                status: 'published',
                completedAt: new Date().toISOString(),
            });

            expect(resolveMobileExamStatus(exam)).toBe('turned_in');
        });

        it('normalizes status to turned_in when attempt_status is COMPLETED', () => {
            const exam = {
                ...createMockExam({ status: 'published' }),
                attempt_status: 'COMPLETED',
            } as Exam;

            expect(resolveMobileExamStatus(exam)).toBe('turned_in');
        });

        it('normalizes status to turned_in when attemptStatus is completed', () => {
            const exam = {
                ...createMockExam({ status: 'published' }),
                attemptStatus: 'completed',
            } as Exam;

            expect(resolveMobileExamStatus(exam)).toBe('turned_in');
        });

        it('preserves turned_in and completed exam statuses as turned_in', () => {
            expect(resolveMobileExamStatus(createMockExam({ status: 'turned_in' }))).toBe('turned_in');
            expect(resolveMobileExamStatus(createMockExam({ status: 'completed' }))).toBe('turned_in');
        });

        it('resolves active exam status as available when within schedule window', () => {
            const exam = createMockExam({
                status: 'published',
                scheduledDate: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
                endDateTime: new Date(Date.now() + 1000 * 60 * 50).toISOString(),
            });

            expect(resolveMobileExamStatus(exam)).toBe('available');
        });

        it('resolves upcoming exam status when scheduled in the future', () => {
            const exam = createMockExam({
                status: 'published',
                scheduledDate: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
                endDateTime: new Date(Date.now() + 1000 * 60 * 120).toISOString(),
            });

            expect(resolveMobileExamStatus(exam)).toBe('upcoming');
        });
    });

    describe('adaptExamForMobile', () => {
        it('adapts exam with normalized status and display properties', () => {
            const exam = {
                ...createMockExam({
                    status: 'published',
                    professor: 'Dr. Jane Smith',
                }),
                attempt_status: 'COMPLETED',
            } as Exam;

            const adapted = adaptExamForMobile(exam);

            expect(adapted.status).toBe('turned_in');
            expect(adapted.professor).toBe('Dr. Jane Smith');
            expect(adapted.difficulty).toBe('Medium');
            expect(adapted.instructions.length).toBeGreaterThan(0);
        });
    });
});
