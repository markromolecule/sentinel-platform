import { describe, expect, it } from 'vitest';
import { mapExam } from './mappers';

describe('mapExam', () => {
    it('preserves the public exam flag from the API response', () => {
        const exam = mapExam({
            id: 'exam-1',
            title: 'Public Exam',
            description: 'A sample public exam description.',
            durationMinutes: 60,
            passingScore: 75,
            status: 'PUBLISHED',
            classroomId: null,
            classroomName: null,
            subjectId: 'subject-1',
            subjectTitle: 'Science',
            sectionId: null,
            sectionName: null,
            roomId: null,
            roomName: null,
            scheduledDate: '2026-06-14T08:00:00.000Z',
            endDateTime: '2026-06-14T09:00:00.000Z',
            publishedAt: '2026-06-14T07:30:00.000Z',
            questionCount: 10,
            createdAt: '2026-06-14T07:00:00.000Z',
            updatedAt: '2026-06-14T07:45:00.000Z',
            isPublic: true,
            assignedRoomNames: [],
            assignedInstructorNames: [],
            sectionNames: [],
        } as any);

        expect(exam.isPublic).toBe(true);
    });
});
