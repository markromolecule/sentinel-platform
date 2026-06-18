import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ProctorExam } from '@sentinel/shared/types';
import { ExamPrintExport } from './exam-print-export';

vi.mock('next/link', () => ({
    default: ({ children, href }: { children: React.ReactNode; href: string }) => (
        <a href={href}>{children}</a>
    ),
}));

const exam: ProctorExam = {
    id: '11111111-1111-4111-8111-111111111111',
    title: 'Algorithms Final',
    description: '',
    duration: 90,
    passingScore: 75,
    status: 'draft',
    createdAt: '2026-04-22T00:00:00.000Z',
    updatedAt: '2026-04-22T00:00:00.000Z',
    scheduledDate: '2026-04-23T00:00:00.000Z',
    subject: 'Data Structures',
    questionCount: 2,
    studentsCount: 0,
    questionSections: [
        {
            id: 'section-a',
            title: 'Part A',
            description: 'Read each question carefully.',
            orderIndex: 0,
        },
    ],
    questions: [
        {
            id: 'mc-1',
            examId: '11111111-1111-4111-8111-111111111111',
            sectionId: 'section-a',
            type: 'MULTIPLE_CHOICE',
            points: 2,
            orderIndex: 0,
            tags: [],
            sourceEvidence: 'Instructor-only source evidence should stay hidden.',
            passageContent: '<p><strong>Read this passage first.</strong></p>',
            passageType: 'html',
            content: {
                prompt: 'Which structure is FIFO?',
                options: ['Queue', 'Stack'],
                correctAnswer: 'Queue',
            },
        },
        {
            id: 'essay-1',
            examId: '11111111-1111-4111-8111-111111111111',
            sectionId: 'section-a',
            type: 'ESSAY',
            points: 10,
            orderIndex: 1,
            tags: [],
            content: {
                prompt: 'Explain stable sorting.',
                rubric: 'Award full credit for preserving equal-item order.',
            },
        },
    ],
};

describe('ExamPrintExport', () => {
    it('renders the printable exam copy with section instructions and without metadata', () => {
        render(<ExamPrintExport exam={exam} />);

        expect(screen.getByText('Algorithms Final')).toBeTruthy();
        expect(screen.getByText('Read each question carefully.')).toBeTruthy();
        expect(document.body.innerHTML).toContain('Read this passage first.');
        expect(screen.getByText('Which structure is FIFO?')).toBeTruthy();
        expect(screen.getByText('A. Queue')).toBeTruthy();
        expect(screen.getByText('B. Stack')).toBeTruthy();

        // Verify question numbering
        expect(screen.getByText('1.')).toBeTruthy();
        expect(screen.getByText('2.')).toBeTruthy();

        // Verify no duplicate type headings (Multiple Choice / Essay labels)
        expect(screen.queryByText('Multiple Choice')).toBeNull();
        expect(screen.queryByText('Essay')).toBeNull();

        expect(screen.queryByText('Award full credit for preserving equal-item order.')).toBeNull();
        expect(
            screen.queryByText('Instructor-only source evidence should stay hidden.'),
        ).toBeNull();
    });
});
