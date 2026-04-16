'use client';

import { DataTable } from '@sentinel/ui';
import { InstructorAssignment } from '@sentinel/shared/types';
import { columns } from '@/app/(protected)/(admin)/proctor/assignment/_components/columns';
import { buildAssignmentFacets } from '@/app/(protected)/(admin)/proctor/assignment/_components/assignment-facets';

interface AssignmentListProps {
    assignments: InstructorAssignment[];
    onEdit: (assignment: InstructorAssignment) => void;
}

export function AssignmentList({ assignments, onEdit }: AssignmentListProps) {
    return (
        <DataTable
            columns={columns(onEdit)}
            data={assignments}
            searchKey="instructorName"
            searchPlaceholder="Filter instructors..."
            facets={buildAssignmentFacets(assignments)}
        />
    );
}
