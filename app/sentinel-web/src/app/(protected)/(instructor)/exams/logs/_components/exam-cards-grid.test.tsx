import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ExamCardsGrid } from './exam-cards-grid';
import type { ProctorExam } from '@sentinel/shared/types';

afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
});

// Mock UI elements if necessary or render normally
vi.mock('@sentinel/ui', () => ({
    Input: ({ placeholder, value, onChange, className }: any) => (
        <input
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className={className}
            data-testid="search-input"
        />
    ),
    Button: ({ children, className, onClick }: any) => (
        <button className={className} onClick={onClick}>
            {children}
        </button>
    ),
    Badge: ({ children, className }: any) => <span className={className}>{children}</span>,
}));

const mockExams: ProctorExam[] = [
    {
        id: 'exam-1',
        title: 'Algorithms Midterm',
        subject: 'CS 201',
        description: 'Test on trees and sorting algorithms.',
        status: 'active',
        studentsCount: 35,
        incidentCount: 5,
        createdAt: '2026-06-11T12:00:00Z',
        updatedAt: '2026-06-11T12:00:00Z',
    },
    {
        id: 'exam-2',
        title: 'Database Final',
        subject: 'CS 302',
        description: 'Final project evaluation.',
        status: 'completed',
        studentsCount: 50,
        incidentCount: 0,
        createdAt: '2026-06-11T12:00:00Z',
        updatedAt: '2026-06-11T12:00:00Z',
    },
];

describe('ExamCardsGrid Component', () => {
    it('renders list of exams correctly', () => {
        const handleSelect = vi.fn();
        render(<ExamCardsGrid exams={mockExams} onSelectExam={handleSelect} />);

        expect(screen.getByText('Algorithms Midterm')).toBeTruthy();
        expect(screen.getByText('Database Final')).toBeTruthy();
        expect(screen.getByText(/35 students/i, { selector: 'span' })).toBeTruthy();
        expect(screen.getByText(/50 students/i, { selector: 'span' })).toBeTruthy();
        expect(screen.getByText(/5 alerts/i, { selector: 'span' })).toBeTruthy();
        expect(screen.getByText(/0 alerts/i, { selector: 'span' })).toBeTruthy();
    });

    it('filters exams based on search text', () => {
        const handleSelect = vi.fn();
        render(<ExamCardsGrid exams={mockExams} onSelectExam={handleSelect} />);

        const searchInput = screen.getByTestId('search-input');
        fireEvent.change(searchInput, { target: { value: 'Database' } });

        expect(screen.queryByText('Algorithms Midterm')).toBeNull();
        expect(screen.getByText('Database Final')).toBeDefined();
    });

    it('triggers onSelectExam when an exam card is clicked', () => {
        const handleSelect = vi.fn();
        render(<ExamCardsGrid exams={mockExams} onSelectExam={handleSelect} />);

        const card = screen.getByTestId('exam-card-exam-1');
        fireEvent.click(card);

        expect(handleSelect).toHaveBeenCalledWith('exam-1');
    });

    it('paginates exams correctly (6 per page)', () => {
        const handleSelect = vi.fn();
        // Generate 8 exams
        const manyExams: ProctorExam[] = Array.from({ length: 8 }).map((_, idx) => ({
            id: `exam-${idx + 1}`,
            title: `Exam Title ${idx + 1}`,
            subject: 'General',
            description: `Description ${idx + 1}`,
            status: 'active',
            studentsCount: 10,
            incidentCount: 1,
            createdAt: '2026-06-11T12:00:00Z',
            updatedAt: '2026-06-11T12:00:00Z',
        }));

        render(<ExamCardsGrid exams={manyExams} onSelectExam={handleSelect} />);

        // Only first 6 should be visible on page 1
        expect(screen.getByText('Exam Title 1')).toBeTruthy();
        expect(screen.getByText('Exam Title 6')).toBeTruthy();
        expect(screen.queryByText('Exam Title 7')).toBeNull();

        // Click next button
        const nextButton = screen.getByText('Next');
        fireEvent.click(nextButton);

        // Only last 2 should be visible on page 2
        expect(screen.queryByText('Exam Title 1')).toBeNull();
        expect(screen.getByText('Exam Title 7')).toBeTruthy();
        expect(screen.getByText('Exam Title 8')).toBeTruthy();

        // Click previous button
        const prevButton = screen.getByText('Previous');
        fireEvent.click(prevButton);

        // Back to page 1
        expect(screen.getByText('Exam Title 1')).toBeTruthy();
        expect(screen.queryByText('Exam Title 7')).toBeNull();
    });

    it('resets page to 1 when search text changes', () => {
        const handleSelect = vi.fn();
        const manyExams: ProctorExam[] = Array.from({ length: 8 }).map((_, idx) => ({
            id: `exam-${idx + 1}`,
            title: `Math Exam ${idx + 1}`,
            subject: 'Math',
            description: `Description ${idx + 1}`,
            status: 'active',
            studentsCount: 10,
            incidentCount: 1,
            createdAt: '2026-06-11T12:00:00Z',
            updatedAt: '2026-06-11T12:00:00Z',
        }));

        render(<ExamCardsGrid exams={manyExams} onSelectExam={handleSelect} />);

        // Click Next to go to Page 2
        const nextButton = screen.getByText('Next');
        fireEvent.click(nextButton);
        expect(screen.getByText('Page 2 of 2')).toBeTruthy();

        // Change search input
        const searchInput = screen.getByTestId('search-input');
        fireEvent.change(searchInput, { target: { value: 'Math' } });

        // Page should reset to 1
        expect(screen.getByText('Page 1 of 2')).toBeTruthy();
    });
});
