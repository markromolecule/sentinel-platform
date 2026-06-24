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

    it('prefers sectionIds from the API response and preserves them on the mapped exam', () => {
        const exam = mapExam({
            id: 'exam-2',
            title: 'Assigned Exam',
            description: 'A section-assigned exam.',
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
            sectionIds: ['section-1', 'section-2'],
            assigned_section_ids: ['legacy-section'],
            isPublic: false,
            assignedRoomNames: [],
            assignedInstructorNames: [],
            sectionNames: ['Section 1', 'Section 2'],
        } as any);

        expect(exam.sectionIds).toEqual(['section-1', 'section-2']);
    });

    it('falls back to assigned_section_ids when sectionIds is not present', () => {
        const exam = mapExam({
            id: 'exam-3',
            title: 'Legacy Assigned Exam',
            description: 'A legacy section-assigned exam.',
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
            assigned_section_ids: ['legacy-section-1', 'legacy-section-2'],
            isPublic: false,
            assignedRoomNames: [],
            assignedInstructorNames: [],
            sectionNames: ['Legacy Section 1', 'Legacy Section 2'],
        } as any);

        expect(exam.sectionIds).toEqual(['legacy-section-1', 'legacy-section-2']);
    });

    it('preserves assigned classroom ids from the API response', () => {
        const exam = mapExam({
            id: 'exam-4',
            title: 'Classroom Assigned Exam',
            description: 'An exam assigned after publishing.',
            durationMinutes: 60,
            passingScore: 75,
            status: 'upcoming',
            classroomId: 'classroom-1',
            classroomIds: ['classroom-1', 'classroom-2'],
            classroomName: 'Classroom 1',
            classroomNames: ['Classroom 1', 'Classroom 2'],
            subjectId: 'subject-1',
            subjectTitle: 'Science',
            sectionId: null,
            sectionName: null,
            roomId: null,
            roomName: null,
            scheduledDate: '2099-06-14T08:00:00.000Z',
            endDateTime: '2099-06-14T09:00:00.000Z',
            publishedAt: '2099-06-14T07:30:00.000Z',
            questionCount: 10,
            createdAt: '2099-06-14T07:00:00.000Z',
            updatedAt: '2099-06-14T07:45:00.000Z',
        } as any);

        expect(exam.classroomId).toBe('classroom-1');
        expect(exam.classroomIds).toEqual(['classroom-1', 'classroom-2']);
        expect(exam.classroomNames).toEqual(['Classroom 1', 'Classroom 2']);
    });

    it('maps completed student attempts to turned_in status', () => {
        const exam = mapExam({
            id: 'exam-5',
            title: 'Completed Student Exam',
            description: 'An exam that has already been turned in.',
            durationMinutes: 60,
            passingScore: 75,
            status: 'PUBLISHED',
            classroomId: 'classroom-1',
            classroomName: 'Classroom 1',
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
            attemptId: 'attempt-1',
            completedAt: '2026-06-14T08:45:00.000Z',
            isPublic: false,
            assignedRoomNames: [],
            assignedInstructorNames: [],
            sectionNames: [],
        } as any);

        expect(exam.status).toBe('turned_in');
    });
});
