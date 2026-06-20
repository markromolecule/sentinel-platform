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
    ];

    it('renders list of exams correctly', () => {
        render(<ExamsActivityOverview exams={mockExams} />);

        expect(screen.getByText('Midterm Calculus')).toBeTruthy();
        expect(screen.getByText('Calculus I (MATH101)')).toBeTruthy();
        expect(screen.getByText('15 attempts')).toBeTruthy();
        expect(screen.getByText('2 incidents')).toBeTruthy();

        expect(screen.getByText('Final Algebra')).toBeTruthy();
        expect(screen.getByText('College Algebra (MATH102)')).toBeTruthy();
        expect(screen.getByText('0 attempts')).toBeTruthy();
        expect(screen.getByText('0 incidents')).toBeTruthy();
    });

    it('renders fallback empty state when no exams are provided', () => {
        render(<ExamsActivityOverview exams={[]} />);

        expect(screen.getByText('No exams found')).toBeTruthy();
        expect(screen.getByText('Create Exam')).toBeTruthy();
    });
});
