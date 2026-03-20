"use client";

import { DataTable } from '@sentinel/ui';
import { ProctorAssignment } from '@sentinel/shared/types';
import { columns } from "@/app/(protected)/(admin)/proctor/assignment/_components/columns";

interface AssignmentListProps {
    assignments: ProctorAssignment[];
    onEdit: (assignment: ProctorAssignment) => void;
}

export function AssignmentList({ assignments, onEdit }: AssignmentListProps) {
    return (
        <DataTable
            columns={columns(onEdit)}
            data={assignments}
            searchKey="proctorName"
            searchPlaceholder="Filter proctors..."
            facets={[
                {
                    columnKey: "status",
                    title: "Status",
                    options: [
                        { label: "Active", value: "active" },
                        { label: "Completed", value: "completed" }, // Assuming these statuses exist
                        { label: "Pending", value: "pending" },
                    ],
                },
            ]}
        />
    );
}
