import { describe, expect, it } from 'vitest';
import { isActiveStudentExamStatus, normalizeStudentExam } from './normalize-student-exam';

describe('normalizeStudentExam', () => {
    it('maps published exams without a scheduled date into the available student status', () => {
        const normalizedExam = normalizeStudentExam({
            id: 'exam-published-no-schedule',
            title: 'Published Exam',
            subject: 'Physics',
            status: 'published',
            scheduledDate: null,
            endDateTime: null,
            completedAt: null,
            duration: 60,
            totalScore: 100,
            createdAt: '2099-06-24T08:00:00.000Z',
            publishedAt: '2099-06-24T08:00:00.000Z',
        } as any);

        expect(normalizedExam.status).toBe('available');
        expect(isActiveStudentExamStatus(normalizedExam.status)).toBe(true);
    });
});
