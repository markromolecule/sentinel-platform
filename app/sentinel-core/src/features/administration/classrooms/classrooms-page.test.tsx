import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { ClassroomsPage } from './classrooms-page';
import { useClassroomsQuery } from '@sentinel/hooks';
import { useAcademicScope } from '@/hooks/use-academic-scope';
import React from 'react';

afterEach(() => {
    cleanup();
});

vi.mock('@sentinel/hooks', () => ({
    useClassroomsQuery: vi.fn(),
    useDebounce: vi.fn((value: any) => value),
    useStableValue: vi.fn((factory: any) => factory()),
    isPermissionDeniedError: vi.fn(() => false),
}));

vi.mock('@/hooks/use-academic-scope', () => ({
    useAcademicScope: vi.fn(),
}));

vi.mock('@/features/administration/shared/permission-gate', () => ({
    PermissionGate: ({ children }: any) => <>{children}</>,
}));

vi.mock('@sentinel/ui', async (importOriginal) => {
    const original = await importOriginal<typeof import('@sentinel/ui')>();
    return {
        ...original,
        Tabs: ({ children, value, onValueChange }: any) => (
            <div
                data-testid="mock-tabs"
                onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.getAttribute('role') === 'tab') {
                        onValueChange?.(target.getAttribute('value'));
                    }
                }}
            >
                {children}
            </div>
        ),
        TabsList: ({ children }: any) => <div>{children}</div>,
        TabsTrigger: ({ children, value }: any) => (
            <button role="tab" value={value}>
                {children}
            </button>
        ),
        TabsContent: ({ children }: any) => <div>{children}</div>,
    };
});

vi.mock('./_components/classrooms-list', () => ({
    ClassroomsList: ({ classrooms, searchTerm }: any) => (
        <div>
            <span>ClassroomsCount:{classrooms.length}</span>
            <span>SearchTerm:{searchTerm}</span>
        </div>
    ),
}));

vi.mock('./_components/create-classroom-dialog', () => ({
    CreateClassroomDialog: ({ open }: any) => (open ? <div>Create Classroom Dialog</div> : null),
}));

vi.mock('./_components/classroom-columns', () => ({
    createClassroomColumns: vi.fn(() => []),
}));

const mockClassrooms = [
    {
        id: 'class-1',
        className: 'Physics 101',
    },
];

describe('ClassroomsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('passes the assigned department into the classroom query', () => {
        vi.mocked(useClassroomsQuery).mockReturnValue({
            data: mockClassrooms,
            isLoading: false,
            error: null,
        } as any);

        vi.mocked(useAcademicScope).mockReturnValue({
            assignedDepartmentId: 'department-1',
        } as any);

        render(<ClassroomsPage />);

        expect(useClassroomsQuery).toHaveBeenCalledWith({
            search: '',
            departmentId: 'department-1',
            status: 'active',
        });
        expect(screen.getAllByText(/ClassroomsCount:1/)[0]).toBeDefined();
    });

    it('still renders the create classroom trigger for scoped admins', () => {
        vi.mocked(useClassroomsQuery).mockReturnValue({
            data: mockClassrooms,
            isLoading: false,
            error: null,
        } as any);

        vi.mocked(useAcademicScope).mockReturnValue({
            assignedDepartmentId: 'department-1',
        } as any);

        render(<ClassroomsPage />);

        expect(screen.getByRole('button', { name: /Create Classroom/i })).toBeDefined();
    });

    it('switches status when clicking on tabs', () => {
        vi.mocked(useClassroomsQuery).mockReturnValue({
            data: mockClassrooms,
            isLoading: false,
            error: null,
        } as any);

        vi.mocked(useAcademicScope).mockReturnValue({
            assignedDepartmentId: 'department-1',
        } as any);

        render(<ClassroomsPage />);

        expect(useClassroomsQuery).toHaveBeenLastCalledWith({
            search: '',
            departmentId: 'department-1',
            status: 'active',
        });

        const archivedTab = screen.getByRole('tab', { name: /Archived/i });
        fireEvent.click(archivedTab);

        expect(useClassroomsQuery).toHaveBeenLastCalledWith({
            search: '',
            departmentId: 'department-1',
            status: 'archived',
        });
    });
});
