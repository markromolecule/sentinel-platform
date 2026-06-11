import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ExamCombobox } from './exam-combobox';
import type { ProctorExam } from '@sentinel/shared/types';

afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
});

// Mock popover and command ui sub-modules to simplify rendering in JSDOM
vi.mock('@sentinel/ui', () => ({
    cn: (...args: any[]) => args.filter(Boolean).join(' '),
    Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
    Popover: ({ children, open, onOpenChange }: any) => (
        <div data-testid="popover-mock" data-open={open}>
            {children}
        </div>
    ),
    PopoverTrigger: ({ children }: any) => <>{children}</>,
    PopoverContent: ({ children }: any) => <div data-testid="popover-content">{children}</div>,
    Command: ({ children }: any) => <div data-testid="command-mock">{children}</div>,
    CommandInput: ({ placeholder, value, onChange }: any) => (
        <input placeholder={placeholder} value={value} onChange={onChange} data-testid="command-input" />
    ),
    CommandList: ({ children }: any) => <div>{children}</div>,
    CommandEmpty: ({ children }: any) => <div>{children}</div>,
    CommandGroup: ({ children }: any) => <div>{children}</div>,
    CommandItem: ({ children, onSelect }: any) => (
        <div onClick={onSelect} data-testid="command-item">
            {children}
        </div>
    ),
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

describe('ExamCombobox Component', () => {
    it('renders current selection trigger button correctly', () => {
        const handleSelect = vi.fn();
        render(
            <ExamCombobox
                exams={mockExams}
                selectedExamId="exam-1"
                onSelectExam={handleSelect}
            />
        );

        expect(screen.getByText('Algorithms Midterm (CS 201)')).toBeDefined();
    });

    it('renders placeholder when no selection is present', () => {
        const handleSelect = vi.fn();
        render(
            <ExamCombobox
                exams={mockExams}
                selectedExamId=""
                onSelectExam={handleSelect}
            />
        );

        expect(screen.getByText('Choose an exam...')).toBeDefined();
    });

    it('calls onSelectExam when an option is clicked', () => {
        const handleSelect = vi.fn();
        render(
            <ExamCombobox
                exams={mockExams}
                selectedExamId="exam-1"
                onSelectExam={handleSelect}
            />
        );

        // Under JSDOM render of mocks, we render all children synchronously
        const items = screen.getAllByTestId('command-item');

        
        // Let's find and click the second item (exam-2)
        // First item is 'Clear selection'
        fireEvent.click(items[2]);

        expect(handleSelect).toHaveBeenCalledWith('exam-2');
    });

    it('calls onSelectExam with empty string when Clear Selection is clicked', () => {
        const handleSelect = vi.fn();
        render(
            <ExamCombobox
                exams={mockExams}
                selectedExamId="exam-1"
                onSelectExam={handleSelect}
            />
        );

        const items = screen.getAllByTestId('command-item');
        
        // First item is 'Clear selection'
        fireEvent.click(items[0]);

        expect(handleSelect).toHaveBeenCalledWith('');
    });
});
