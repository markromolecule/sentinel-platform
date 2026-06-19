import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ExamCardHeader } from './exam-card-header';
import type { ExamCardProps } from '@sentinel/shared/types';

const { pushMock } = vi.hoisted(() => ({
    pushMock: vi.fn(),
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: pushMock,
    }),
}));

vi.mock('@sentinel/ui', () => ({
    Badge: ({ children }: { children: ReactNode }) => <span>{children}</span>,
    Button: ({ children }: { children: ReactNode }) => <button>{children}</button>,
    CardDescription: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    CardHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    CardTitle: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    DropdownMenu: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    DropdownMenuContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    DropdownMenuItem: ({
        children,
        onClick,
        onSelect,
        ...props
    }: {
        children: ReactNode;
        onClick?: () => void;
        onSelect?: () => void;
    }) => (
        <button {...props} onClick={onClick || onSelect}>
            {children}
        </button>
    ),
    DropdownMenuTrigger: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

function buildExam(overrides: Partial<ExamCardProps['exam']> = {}): ExamCardProps['exam'] {
    return {
        id: 'exam-1',
        title: 'Midterm Exam',
        description: 'An exam for testing the visibility badge.',
        duration: 60,
        passingScore: 75,
        status: 'draft',
        createdAt: '2026-06-14T07:00:00.000Z',
        updatedAt: '2026-06-14T07:30:00.000Z',
        ...overrides,
    } as ExamCardProps['exam'];
}

describe('ExamCardHeader', () => {
    afterEach(() => {
        cleanup();
        pushMock.mockReset();
    });

    it('shows the public badge when the exam is public', () => {
        render(
            <ExamCardHeader
                exam={buildExam({ isPublic: true })}
                statusClass="border-amber-200 bg-amber-50 text-amber-700"
                showActions
                onDeleteClick={vi.fn()}
                onEditClick={vi.fn()}
            />,
        );

        expect(screen.getByText('Public')).toBeTruthy();
    });

    it('shows the private badge when the exam is not public', () => {
        render(
            <ExamCardHeader
                exam={buildExam({ isPublic: false })}
                statusClass="border-amber-200 bg-amber-50 text-amber-700"
                showActions
                onDeleteClick={vi.fn()}
                onEditClick={vi.fn()}
            />,
        );

        expect(screen.getByText('Private')).toBeTruthy();
    });

    it('navigates to the assignment page with the exam id when sharing', () => {
        render(
            <ExamCardHeader
                exam={buildExam({ isPublic: true })}
                statusClass="border-amber-200 bg-amber-50 text-amber-700"
                showActions
                onDeleteClick={vi.fn()}
                onEditClick={vi.fn()}
            />,
        );

        fireEvent.click(screen.getByText('Share / Assign'));

        expect(pushMock).toHaveBeenCalledWith('/exams/assign?examId=exam-1');
    });

    it('hides the overflow menu when actions are not allowed', () => {
        render(
            <ExamCardHeader
                exam={buildExam({ isPublic: true })}
                statusClass="border-amber-200 bg-amber-50 text-amber-700"
                showActions={false}
                onDeleteClick={vi.fn()}
                onEditClick={vi.fn()}
            />,
        );

        expect(screen.queryByText('Share / Assign')).toBeNull();
        expect(screen.queryByText('Edit Details')).toBeNull();
        expect(screen.queryByText('Delete Exam')).toBeNull();
    });
});
