'use client';

import { type DataTableFacet } from '@sentinel/ui';
import { type InstructorAssignment } from '@sentinel/shared/types';

export function buildAssignmentFacets(assignments: InstructorAssignment[]): DataTableFacet[] {
    return [
        {
            columnKey: 'status',
            title: 'Status',
            options: [
                { label: 'Active', value: 'active' },
                { label: 'Completed', value: 'completed' },
                { label: 'Pending', value: 'pending' },
            ],
        },
        {
            columnKey: 'examName',
            title: 'Exam',
            options: Array.from(new Set(assignments.map((assignment) => assignment.examName))).map(
                (name) => ({
                    label: name,
                    value: name,
                }),
            ),
        },
    ];
}
