import { render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CoursesView } from './courses-view';
import { useCoursesPageState } from '@/app/(protected)/(support)/courses/_hooks/use-courses-page-state/index';

vi.mock('@/app/(protected)/(support)/courses/_hooks/use-courses-page-state/index', () => ({
    useCoursesPageState: vi.fn(),
}));

vi.mock('../../_components/dialogs/add-course-dialog', () => ({
    AddCourseDialog: () => <div data-testid="add-course-dialog">Add Course Button</div>,
}));

vi.mock('@sentinel/hooks', () => ({
    isPermissionDeniedError: vi.fn(() => false),
    useStableValue: vi.fn((factory: () => any) => factory()),
    useDeleteCoursesMutation: vi.fn(() => ({
        mutate: vi.fn(),
        isPending: false,
    })),
}));

describe('CoursesView Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useCoursesPageState).mockReturnValue({
            searchTerm: '',
            setSearchTerm: vi.fn(),
            selectedInstitutionId: 'inst-1',
            setSelectedInstitutionId: vi.fn(),
            courseToEdit: null,
            editDialogOpen: false,
            setEditDialogOpen: vi.fn(),
            courseToRevert: null,
            setCourseToRevert: vi.fn(),
            managedCourse: null,
            setManagedCourse: vi.fn(),
            institutions: [],
            courses: [
                {
                    id: 'course-1',
                    code: 'CS101',
                    title: 'Intro to Computer Science',
                    origin: 'Local',
                    institutionId: 'inst-1',
                },
            ],
            isLoading: false,
            isError: false,
            error: null,
            parentCourse: undefined,
            handleEdit: vi.fn(),
            handleDelete: vi.fn(),
            handleRevert: vi.fn(),
            deleteCourseMutation: { isPending: false } as any,
            rowSelection: {},
            setRowSelection: vi.fn(),
            isDeleteDialogOpen: false,
            setIsDeleteDialogOpen: vi.fn(),
            deleteCoursesMutation: { isPending: false } as any,
            selectedIds: [],
            handleBulkDelete: vi.fn(),
        });
    });

    it('renders the courses view page with PageHeader and AddCourseDialog', () => {
        render(<CoursesView />);

        expect(screen.getByText('Course Management')).toBeTruthy();
        expect(screen.getByTestId('add-course-dialog')).toBeTruthy();
        expect(screen.getByText('Intro to Computer Science')).toBeTruthy();
    });
});
