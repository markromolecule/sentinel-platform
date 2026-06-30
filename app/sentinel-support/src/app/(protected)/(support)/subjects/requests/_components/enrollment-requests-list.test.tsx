import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EnrollmentRequestsList } from './enrollment-requests-list';

const mockUseDataTableFilterSync = vi.fn();

vi.mock('@sentinel/hooks', () => ({
    useActivePermissions: () => ({
        hasPermission: () => true,
    }),
    useDeleteEnrollmentRequestsMutation: () => ({
        mutate: vi.fn(),
        isPending: false,
    }),
    useStableValue: (factory: () => unknown) => factory(),
}));

vi.mock('@/hooks', () => ({
    useInstitutionFacet: () => [{ label: 'Main Campus', value: 'inst-1' }],
    useDataTableFilterSync: (...args: unknown[]) => mockUseDataTableFilterSync(...args),
}));

vi.mock('@sentinel/ui', async () => {
    const actual = await vi.importActual<typeof import('@sentinel/ui')>('@sentinel/ui');

    return {
        ...actual,
        DataTable: ({
            columns,
            facets,
            data,
            initialColumnVisibility,
        }: {
            columns: Array<{ id?: string; accessorKey?: string }>;
            facets: Array<{ columnKey: string }>;
            data: Array<{ institution?: string }>;
            initialColumnVisibility: Record<string, boolean>;
        }) => {
            const columnKeys = new Set(
                columns.flatMap((column) =>
                    column.id ? [column.id] : column.accessorKey ? [column.accessorKey] : [],
                ),
            );
            const missingFacet = facets.find((facet) => !columnKeys.has(facet.columnKey));

            return (
                <div data-testid="mock-data-table">
                    <div>Missing facet: {missingFacet?.columnKey ?? 'none'}</div>
                    <div>Institution value: {data[0]?.institution ?? 'unset'}</div>
                    <div>
                        Institution hidden: {String(initialColumnVisibility.institution === false)}
                    </div>
                </div>
            );
        },
    };
});

describe('EnrollmentRequestsList', () => {
    it('keeps the institution facet aligned with a real hidden column', () => {
        render(
            <EnrollmentRequestsList
                requests={[
                    {
                        user_id: 'user-1',
                        status: 'PENDING',
                        created_at: '2026-06-30T00:00:00.000Z',
                        instructor_name: 'Jamie Reyes',
                        subject_offering_id: 'offering-1',
                        subject_id: 'subject-1',
                        subject_code: 'CS101',
                        subject_title: 'Intro to CS',
                        term_id: 'term-1',
                        term_academic_year: '2026-2027',
                        term_semester: '1st Semester',
                        target_department_ids: ['dept-1'],
                        target_department_names: ['Computer Science'],
                        target_department_codes: ['CS'],
                        department_name: 'Computer Science',
                        department_code: 'CS',
                        department_id: 'dept-1',
                        target_course_ids: ['course-1'],
                        target_course_titles: ['BSCS'],
                        target_course_codes: ['BSCS'],
                        target_year_levels: [1],
                        course_title: 'BSCS',
                        course_code: 'BSCS',
                        course_id: 'course-1',
                        resolved_section_count: 1,
                        sections: [
                            {
                                request_id: 'request-1',
                                class_group_id: 'group-1',
                                section_id: 'section-1',
                                section_name: 'CS-1A',
                            },
                        ],
                    },
                ]}
                departments={[{ id: 'dept-1', name: 'Computer Science' }]}
                courses={[{ id: 'course-1', title: 'BSCS' }]}
                sections={[{ id: 'section-1', name: 'CS-1A' }]}
                institutions={[{ id: 'inst-1', name: 'Main Campus' } as any]}
                selectedInstitutionId="inst-1"
                setSelectedInstitutionId={vi.fn()}
            />,
        );

        expect(screen.getByText('Missing facet: none')).toBeTruthy();
        expect(screen.getByText('Institution value: inst-1')).toBeTruthy();
        expect(screen.getByText('Institution hidden: true')).toBeTruthy();
    });
});
