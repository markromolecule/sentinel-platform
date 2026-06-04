'use client';

import { type DataTableFacet } from '@sentinel/ui';

type UserManagementFacetsArgs = {
    departments: Array<{ name: string; code: string | null }>;
};

export function buildUserManagementFacets({
    departments,
}: UserManagementFacetsArgs): DataTableFacet[] {
    return [
        {
            columnKey: 'role',
            title: 'Role',
            options: [
                { label: 'Admin', value: 'admin' },
                { label: 'Proctor', value: 'proctor' },
                { label: 'Instructor', value: 'instructor' },
                { label: 'Student', value: 'student' },
            ],
        },
        {
            columnKey: 'status',
            title: 'Status',
            options: [
                { label: 'Active', value: 'active' },
                { label: 'Offline', value: 'offline' },
                { label: 'Suspended', value: 'suspended' },
                { label: 'Archived', value: 'archived' },
            ],
        },
        {
            columnKey: 'departmentCode',
            title: 'Department',
            options: departments.map((department) => ({
                label: department.code || department.name,
                value: department.code || department.name,
            })),
        },
    ];
}
