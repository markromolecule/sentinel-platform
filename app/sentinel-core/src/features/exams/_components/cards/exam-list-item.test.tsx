import { fireEvent, cleanup, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ExamListItem } from './exam-list-item';
import type { ProctorExam } from '@sentinel/shared/types';

const { pushMock } = vi.hoisted(() => ({
    pushMock: vi.fn(),
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: pushMock,
    }),
}));

vi.mock('@/features/exams/_hooks/use-exam-card', () => ({
    useExamCard: () => ({
        showDeleteAlert: false,
        setShowDeleteAlert: vi.fn(),
        showEdit: false,
        setShowEdit: vi.fn(),
        handleDelete: vi.fn(),
        primaryActions: [],
    }),
}));

vi.mock('@/features/exams/_components/dialogs/exam-edit-dialog', () => ({
    ExamEditDialog: () => null,
}));

vi.mock('./exam-card/exam-card-delete-alert', () => ({
    ExamCardDeleteAlert: () => null,
}));

vi.mock('@sentinel/ui', () => ({
    Badge: ({ children }: { children: ReactNode }) => <span>{children}</span>,
    Button: ({ children }: { children: ReactNode }) => <button>{children}</button>,
    DropdownMenu: ({ children }: { children: ReactNode }) => <>{children}</>,
    DropdownMenuContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    DropdownMenuItem: ({
        children,
        onClick,
        ...props
    }: {
        children: ReactNode;
        onClick?: () => void;
    }) => (
        <button {...props} onClick={onClick}>
            {children}
        </button>
    ),
    DropdownMenuTrigger: ({ children }: { children: ReactNode }) => <>{children}</>,
    Spinner: () => null,
}));

function buildExam(overrides: Partial<ProctorExam> = {}): ProctorExam {
    return {
        id: 'exam-1',
        title: 'Midterm Exam',
        description: 'An exam for testing attribution visibility.',
        duration: 60,
        status: 'draft',
        createdAt: '2026-06-14T07:00:00.000Z',
        updatedAt: '2026-06-14T07:30:00.000Z',
        questionCount: 12,
        assignedRoomNames: ['ROOM101'],
        assignedInstructorNames: ['Juan dela Cruz'],
        ...overrides,
    } as ProctorExam;
}

describe('ExamListItem', () => {
    afterEach(() => {
        cleanup();
        pushMock.mockReset();
    });

    it('does not render draft attribution text for draft exams', () => {
        render(<ExamListItem exam={buildExam({ createdByName: 'John Creator' })} />);

        expect(screen.queryByText('Draft by John Creator')).toBeNull();
        expect(screen.queryByText('John Creator')).toBeNull();
    });

    it('renders share and assign and navigates with the exam id', () => {
        render(<ExamListItem exam={buildExam({ createdByName: 'John Creator' })} />);

        fireEvent.click(screen.getByText('Share / Assign'));

        expect(pushMock).toHaveBeenCalledWith('/exams/assign?examId=exam-1');
    });
});
