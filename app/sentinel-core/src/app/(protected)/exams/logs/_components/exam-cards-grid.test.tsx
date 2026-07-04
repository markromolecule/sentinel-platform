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
    Card: ({ children, className, onClick, ...props }: any) => (
        <div className={className} onClick={onClick} {...props}>
            {children}
        </div>
    ),
    CardHeader: ({ children, className }: any) => <div className={className}>{children}</div>,
    CardContent: ({ children, className }: any) => <div className={className}>{children}</div>,
    CardTitle: ({ children, className }: any) => <h3 className={className}>{children}</h3>,
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
        render(
            <ExamCardsGrid
                exams={mockExams}
                onSelectExam={handleSelect}
                searchValue=""
                onSearchChange={vi.fn()}
            />,
        );

        expect(screen.getByText('Algorithms Midterm')).toBeTruthy();
        expect(screen.getByText('Database Final')).toBeTruthy();
        expect(screen.getByText(/35 student attempts/i, { selector: 'span' })).toBeTruthy();
        expect(screen.getByText(/50 student attempts/i, { selector: 'span' })).toBeTruthy();
        expect(screen.getByText(/5 incident alerts/i, { selector: 'span' })).toBeTruthy();
        expect(screen.getByText(/0 incident alerts/i, { selector: 'span' })).toBeTruthy();
        expect(screen.getAllByText('Open Incident Logs')).toHaveLength(2);
    });

    it('calls onSearchChange when search text is changed', () => {
        const handleSelect = vi.fn();
        const handleSearchChange = vi.fn();
        render(
            <ExamCardsGrid
                exams={mockExams}
                onSelectExam={handleSelect}
                searchValue=""
                onSearchChange={handleSearchChange}
            />,
        );

        const searchInput = screen.getByTestId('search-input');
        fireEvent.change(searchInput, { target: { value: 'Database' } });

        expect(handleSearchChange).toHaveBeenCalledWith('Database');
    });

    it('triggers onSelectExam when an exam card is clicked', () => {
        const handleSelect = vi.fn();
        render(
            <ExamCardsGrid
                exams={mockExams}
                onSelectExam={handleSelect}
                searchValue=""
                onSearchChange={vi.fn()}
            />,
        );

        const card = screen.getByTestId('exam-card-exam-1');
        fireEvent.click(card);

        expect(handleSelect).toHaveBeenCalledWith('exam-1');
    });

    it('renders an empty state when no exams are available', () => {
        render(
            <ExamCardsGrid exams={[]} onSelectExam={vi.fn()} searchValue="" onSearchChange={vi.fn()} />,
        );

        expect(screen.getByText('No exam logs found.')).toBeTruthy();
    });
});
