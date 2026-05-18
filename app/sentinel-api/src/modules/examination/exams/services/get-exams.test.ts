import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { DbClient } from '@sentinel/db';
import { getExams } from './get-exams';
import { getExamsData } from '../data/get-exams';

vi.mock('../data/get-exams', () => ({
    getExamsData: vi.fn(),
}));

describe('getExams service', () => {
    const mockDb = {} as DbClient;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('passes the student user id through to the data layer when provided', async () => {
        vi.mocked(getExamsData).mockResolvedValue([]);

        await getExams(mockDb, {}, 'institution-1', 'student-user-1');

        expect(getExamsData).toHaveBeenCalledWith({
            dbClient: mockDb,
            institutionId: 'institution-1',
            filters: {},
            studentUserId: 'student-user-1',
        });
    });

    it('filters mapped exam summaries by requested status', async () => {
        vi.mocked(getExamsData).mockResolvedValue([
            {
                exam_id: 'exam-1',
                title: 'Published exam',
                description: 'Exam description',
                duration_minutes: 60,
                passing_score: 75,
                status: 'PUBLISHED',
                subject_id: 'subject-1',
                scheduled_date: new Date('2099-04-17T01:00:00.000Z'),
                end_date_time: new Date('2099-04-17T03:00:00.000Z'),
                published_at: new Date('2099-04-16T01:00:00.000Z'),
                question_count: 10,
                created_at: new Date('2099-04-15T01:00:00.000Z'),
                updated_at: new Date('2099-04-16T01:00:00.000Z'),
                subject_title: 'Science',
                room_id: null,
                room_name: null,
                section_id: null,
                section_name: null,
                linked_section_name: null,
            },
        ]);

        const exams = await getExams(mockDb, { status: 'published' }, 'institution-1');

        expect(exams).toHaveLength(1);
        expect(exams[0]?.status).toBe('published');
    });

    it('returns all exams for student current work feeds', async () => {
        vi.mocked(getExamsData).mockResolvedValue([
            {
                exam_id: 'exam-upcoming',
                title: 'Upcoming exam',
                description: 'Exam description',
                duration_minutes: 60,
                passing_score: 75,
                status: 'PUBLISHED',
                subject_id: 'subject-1',
                scheduled_date: new Date('2099-04-17T01:00:00.000Z'),
                end_date_time: new Date('2099-04-17T03:00:00.000Z'),
                published_at: new Date('2099-04-16T01:00:00.000Z'),
                question_count: 10,
                created_at: new Date('2099-04-15T01:00:00.000Z'),
                updated_at: new Date('2099-04-16T01:00:00.000Z'),
                subject_title: 'Science',
                room_id: null,
                room_name: null,
                section_id: null,
                section_name: null,
                linked_section_name: null,
                attempt_id: null,
                attempt_status: null,
                attempt_completed_at: null,
                attempt_score: null,
                attempt_total_score: null,
                attempt_time_spent_minutes: null,
                attempt_incident_count: 0,
                attempt_primary_incident_type: null,
            },
            {
                exam_id: 'exam-past-due',
                title: 'Past due exam',
                description: 'Exam description',
                duration_minutes: 60,
                passing_score: 75,
                status: 'PUBLISHED',
                subject_id: 'subject-1',
                scheduled_date: new Date('2000-04-17T01:00:00.000Z'),
                end_date_time: new Date('2000-04-17T03:00:00.000Z'),
                published_at: new Date('2000-04-16T01:00:00.000Z'),
                question_count: 10,
                created_at: new Date('2099-04-15T01:00:00.000Z'),
                updated_at: new Date('2099-04-16T01:00:00.000Z'),
                subject_title: 'Science',
                room_id: null,
                room_name: null,
                section_id: null,
                section_name: null,
                linked_section_name: null,
                attempt_id: null,
                attempt_status: null,
                attempt_completed_at: null,
                attempt_score: null,
                attempt_total_score: null,
                attempt_time_spent_minutes: null,
                attempt_incident_count: 0,
                attempt_primary_incident_type: null,
            },
            {
                exam_id: 'exam-turned-in',
                title: 'Turned in exam',
                description: 'Exam description',
                duration_minutes: 60,
                passing_score: 75,
                status: 'PUBLISHED',
                subject_id: 'subject-1',
                scheduled_date: new Date('2099-04-17T01:00:00.000Z'),
                end_date_time: new Date('2099-04-17T03:00:00.000Z'),
                published_at: new Date('2099-04-16T01:00:00.000Z'),
                question_count: 10,
                created_at: new Date('2099-04-15T01:00:00.000Z'),
                updated_at: new Date('2099-04-16T01:00:00.000Z'),
                subject_title: 'Science',
                room_id: null,
                room_name: null,
                section_id: null,
                section_name: null,
                linked_section_name: null,
                attempt_id: 'attempt-1',
                attempt_status: 'COMPLETED',
                attempt_completed_at: new Date('2099-04-17T01:45:00.000Z'),
                attempt_score: 8,
                attempt_total_score: 10,
                attempt_time_spent_minutes: 45,
                attempt_incident_count: 0,
                attempt_primary_incident_type: null,
            },
        ]);

        const exams = await getExams(mockDb, {}, 'institution-1', 'student-user-1');

        expect(exams).toHaveLength(3);
        expect(exams.map(e => e.id)).toContain('exam-upcoming');
        expect(exams.map(e => e.id)).toContain('exam-past-due');
        expect(exams.map(e => e.id)).toContain('exam-turned-in');
    });
});
