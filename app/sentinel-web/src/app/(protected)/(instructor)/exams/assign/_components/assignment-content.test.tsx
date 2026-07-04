import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InstructorAssignmentContent } from './assignment-content';
import { useExamSectionAssignmentsQuery, useExamsQuery, useProfileQuery } from '@sentinel/hooks';

vi.mock('@sentinel/hooks', () => ({
    useExamsQuery: vi.fn(),
    useExamSectionAssignmentsQuery: vi.fn(),
    useProfileQuery: vi.fn(),
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: vi.fn() }),
    usePathname: () => '/exams/assign',
    useSearchParams: () => ({
        get: () => null,
        toString: () => '',
    }),
}));

vi.mock('../../_components/layout', () => ({
    ExamsPageShell: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}));

vi.mock('./add-exam-section-assignment-dialog', () => ({
    AddExamSectionAssignmentDialog: () => null,
}));

vi.mock('./exam-section-assignment-list', () => ({
    ExamSectionAssignmentList: () => <div>assignment-list</div>,
}));

vi.mock('@sentinel/ui', () => ({
    Label: ({ children }: { children?: ReactNode }) => <label>{children}</label>,
    PageHeader: ({
        children,
        title,
        description,
    }: {
        children?: ReactNode;
        title: string;
        description: string;
    }) => (
        <div>
            <h1>{title}</h1>
            <p>{description}</p>
            {children}
        </div>
    ),
    Select: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
    SelectContent: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
    SelectItem: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
    SelectTrigger: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
    SelectValue: ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>,
    Separator: () => <hr />,
    Spinner: () => <div>spinner</div>,
}));

describe('InstructorAssignmentContent', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useExamsQuery).mockReturnValue({
            data: [],
            isLoading: false,
        } as any);
        vi.mocked(useProfileQuery).mockReturnValue({
            profile: {
                institutionId: 'institution-1',
            },
            isLoading: false,
        } as any);
        vi.mocked(useExamSectionAssignmentsQuery).mockReturnValue({
            data: [],
            isLoading: false,
        } as any);
    });

    it('loads manageable exams within the active institution so the selected exam subject can scope classroom assignment', () => {
        render(<InstructorAssignmentContent />);

        expect(useExamsQuery).toHaveBeenCalledWith({
            institutionId: 'institution-1',
        });
    });
});
