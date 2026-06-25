'use client';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import StudentExamPrivacyPage from './page';

const {
    mockRouterPush,
    mockPatchStoredStudentExamFlow,
    mockReadStoredStudentExamFlow,
    mockStudentExamData,
} = vi.hoisted(() => ({
    mockRouterPush: vi.fn(),
    mockPatchStoredStudentExamFlow: vi.fn(),
    mockReadStoredStudentExamFlow: vi.fn(),
    mockStudentExamData: vi.fn(),
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockRouterPush,
    }),
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

vi.mock('../_lib/student-exam-flow', async () => {
    const actual = await vi.importActual<typeof import('../_lib/student-exam-flow')>(
        '../_lib/student-exam-flow',
    );

    return {
        ...actual,
        buildStudentExamHref: (examId: string, step: string) => `/student/exam/${examId}/${step}`,
        patchStoredStudentExamFlow: mockPatchStoredStudentExamFlow,
        readStoredStudentExamFlow: mockReadStoredStudentExamFlow,
    };
});

vi.mock('@sentinel/ui', async () => {
    const actual = await vi.importActual<typeof import('@sentinel/ui')>('@sentinel/ui');

    return {
        ...actual,
        Checkbox: ({
            id,
            checked,
            onCheckedChange,
        }: {
            id: string;
            checked?: boolean;
            onCheckedChange?: (checked: boolean) => void;
        }) => (
            <input
                id={id}
                type="checkbox"
                checked={checked}
                onChange={(event) => onCheckedChange?.(event.target.checked)}
            />
        ),
        Label: ({
            children,
            htmlFor,
            className,
        }: {
            children: ReactNode;
            htmlFor: string;
            className?: string;
        }) => (
            <label htmlFor={htmlFor} className={className}>
                {children}
            </label>
        ),
    };
});

describe('StudentExamPrivacyPage', () => {
    beforeEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('renders the streamlined privacy layout and keeps continue disabled until consent', () => {
        mockReadStoredStudentExamFlow.mockReturnValue({
            privacyAccepted: false,
        });
        mockStudentExamData.mockReturnValue({
            examId: 'exam-1',
            exam: {
                status: 'published',
                attemptId: null,
                runtimeAccess: null,
            },
            configuration: {
                aiRules: {
                    gaze_tracking: true,
                    face_detection: true,
                },
                micRequired: true,
                webSecurity: {
                    full_screen_required: true,
                },
            },
            isLoading: false,
        });

        render(<StudentExamPrivacyPage />);

        expect(screen.getByText('Step 2 of 4')).toBeTruthy();
        expect(screen.getByText('Monitored signals')).toBeTruthy();
        expect(screen.queryByText('What this means')).toBeNull();
        expect(screen.getByText('Policies & terms')).toBeTruthy();
        expect(screen.getByText('RA 10173 compliance')).toBeTruthy();
        expect(screen.queryByText('RA 10173')).toBeNull();
        const continueButton = screen.getByRole('button', { name: /continue to checkup/i });
        expect((continueButton as HTMLButtonElement).disabled).toBe(true);
    });

    it('persists consent and enables the continue action', () => {
        mockReadStoredStudentExamFlow.mockReturnValue({
            privacyAccepted: false,
        });
        mockStudentExamData.mockReturnValue({
            examId: 'exam-1',
            exam: {
                status: 'published',
                attemptId: null,
                runtimeAccess: null,
            },
            configuration: {
                aiRules: {
                    gaze_tracking: false,
                    face_detection: false,
                },
                micRequired: false,
                webSecurity: {
                    full_screen_required: false,
                },
            },
            isLoading: false,
        });

        render(<StudentExamPrivacyPage />);

        fireEvent.click(screen.getByLabelText(/i agree to this exam's/i));

        expect(mockPatchStoredStudentExamFlow).toHaveBeenCalledWith('exam-1', {
            privacyAccepted: true,
        });
        const continueButton = screen.getByRole('button', { name: /continue to checkup/i });
        expect((continueButton as HTMLButtonElement).disabled).toBe(false);
    });
});
