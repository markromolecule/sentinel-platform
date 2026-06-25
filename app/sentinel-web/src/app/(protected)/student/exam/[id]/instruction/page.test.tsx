'use client';

import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import StudentExamInstructionPage from './page';

const { mockStudentExamData } = vi.hoisted(() => ({
    mockStudentExamData: vi.fn(),
}));

vi.mock('../_components/student-exam-loading-state', () => ({
    StudentExamLoadingState: () => <div>Loading...</div>,
}));

vi.mock('../_components/student-flow-shell', () => ({
    StudentFlowShell: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('../_hooks/use-student-exam-data', () => ({
    useStudentExamData: () => mockStudentExamData(),
}));

vi.mock('../_hooks/use-turned-in-exam-redirect', () => ({
    useTurnedInExamRedirect: () => false,
}));

describe('StudentExamInstructionPage', () => {
    it('renders the streamlined orientation layout and next-step CTA', () => {
        mockStudentExamData.mockReturnValue({
            examId: 'exam-1',
            exam: {
                title: 'Midterm Exam',
                subject: 'Ethics',
                duration: 60,
            },
            configuration: {
                strictMode: true,
            },
            questions: [{ id: 'q1' }, { id: 'q2' }, { id: 'q3' }],
            isLoading: false,
        });

        render(<StudentExamInstructionPage />);

        expect(screen.getByText('Step 1 of 4')).toBeTruthy();
        expect(screen.getByText('Midterm Exam')).toBeTruthy();
        expect(screen.queryByText('What to expect')).toBeNull();
        expect(screen.getByText('Exam overview')).toBeTruthy();
        expect(screen.getByText('Ready now')).toBeTruthy();
        expect(
            screen.queryByText(
                'This screen gives you the fast pass: what the exam expects, what you should prepare, and what happens next.',
            ),
        ).toBeNull();
        expect(screen.getByRole('link', { name: /continue to privacy/i })).toBeTruthy();
    });
});
