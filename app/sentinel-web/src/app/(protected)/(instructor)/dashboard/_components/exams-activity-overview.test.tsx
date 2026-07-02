// @vitest-environment jsdom
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { ExamsActivityOverview } from './exams-activity-overview';

afterEach(() => {
    cleanup();
});

describe('ExamsActivityOverview', () => {
    const mockExams = [
        {
            exam_id: '12345678-1234-1234-1234-123456789012',
            title: 'Midterm Calculus',
            status: 'PUBLISHED',
            scheduled_date: '2026-06-20T12:00:00.000Z',
            duration_minutes: 90,
            question_count: 30,
            subject_title: 'Calculus I',
            subject_code: 'MATH101',
            attempts_count: 15,
            incidents_count: 2,
        },
        {
            exam_id: '87654321-4321-4321-4321-210987654321',
            title: 'Final Algebra',
            status: 'DRAFT',
            scheduled_date: null,
            duration_minutes: 60,
            question_count: 20,
            subject_title: 'College Algebra',
            subject_code: 'MATH102',
            attempts_count: 0,
            incidents_count: 0,
        },
        {
            exam_id: '11111111-1111-1111-1111-111111111111',
            title: 'Physics Quiz',
            status: 'PUBLISHED',
            scheduled_date: '2026-06-18T10:00:00.000Z',
            duration_minutes: 45,
            question_count: 12,
            subject_title: 'Physics',
            subject_code: 'PHY101',
            attempts_count: 4,
            incidents_count: 1,
        },
        {
            exam_id: '22222222-2222-2222-2222-222222222222',
            title: 'Chemistry Long Exam',
            status: 'PUBLISHED',
            scheduled_date: '2026-06-15T09:00:00.000Z',
            duration_minutes: 120,
            question_count: 50,
            subject_title: 'Chemistry',
            subject_code: 'CHEM101',
            attempts_count: 10,
            incidents_count: 0,
        },
        {
            exam_id: '33333333-3333-3333-3333-333333333333',
            title: 'Biology Final',
            status: 'DRAFT',
            scheduled_date: '2026-06-10T08:00:00.000Z',
            duration_minutes: 75,
            question_count: 40,
            subject_title: 'Biology',
            subject_code: 'BIO101',
            attempts_count: 0,
            incidents_count: 0,
        },
    ];

    it('renders list of exams correctly', () => {
        render(<ExamsActivityOverview exams={mockExams} />);

        expect(screen.getByText('Midterm Calculus')).toBeTruthy();
        expect(screen.getByText('MATH101')).toBeTruthy();
        expect(screen.getByText('15')).toBeTruthy();
        expect(screen.getByText('2')).toBeTruthy();

        expect(screen.getByText('Final Algebra')).toBeTruthy();
        expect(screen.getByText('MATH102')).toBeTruthy();
        expect(screen.getAllByText('0').length).toBeGreaterThan(0);

        expect(screen.getByText('Biology Final')).toBeTruthy();
    });

    it('renders fallback empty state when no exams are provided', () => {
        render(<ExamsActivityOverview exams={[]} />);

        expect(screen.getByText('No exams found')).toBeTruthy();
        expect(screen.getByText('Create Exam')).toBeTruthy();
    });
});
