'use client';

import { cleanup } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
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

vi.mock('../_hooks/use-student-exam-stage-guard', () => ({
    useStudentExamStageGuard: () => {
        const data = mockStudentExamData();
        return {
            ...data,
            isResolving: data?.isLoading ?? false,
            resolution: {
                targetStage: 'instruction',
                reasonCode: 'INSTRUCTION',
                shouldRedirect: false,
            },
            storedFlow: { privacyAccepted: false, checkupCompleted: false },
        };
    },
}));

vi.mock('../_hooks/use-turned-in-exam-redirect', () => ({
    useTurnedInExamRedirect: () => false,
}));

describe('StudentExamInstructionPage', () => {
    beforeEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('renders the streamlined orientation layout and next-step CTA', () => {
        mockStudentExamData.mockReturnValue({
            examId: 'exam-1',
            blockedState: {
                isBlocked: false,
            },
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

    it('shows the lifecycle block message and removes attempt navigation when the exam is locked', () => {
        mockStudentExamData.mockReturnValue({
            examId: 'exam-1',
            blockedState: {
                isBlocked: true,
                title: 'Exam Locked',
                message: 'This exam attempt is locked right now.',
            },
            exam: null,
            configuration: {
                strictMode: true,
            },
            questions: [],
            isLoading: false,
        });

        render(<StudentExamInstructionPage />);

        expect(screen.getByText('Exam Locked')).toBeTruthy();
        expect(screen.getByText('This exam attempt is locked right now.')).toBeTruthy();
        expect(screen.queryByRole('link', { name: /continue to privacy/i })).toBeNull();
    });
});
