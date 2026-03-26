"use client";

import { DataTable } from '@sentinel/ui';
import { InstructorAssignment } from '@sentinel/shared/types';
import { columns } from "@/app/(protected)/(admin)/proctor/assignment/_components/columns";

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
            facets={[
                {
                    columnKey: "status",
                    title: "Status",
                    options: [
                        { label: "Active", value: "active" },
                        { label: "Completed", value: "completed" },
                        { label: "Pending", value: "pending" },
                    ],
                },
                {
                    columnKey: "examName",
                    title: "Exam",
                    options: Array.from(new Set(assignments.map(a => a.examName))).map(name => ({
                        label: name,
                        value: name,
                    })),
                },
            ]}
        />
    );
}
