"use client";

import { DataTable } from "@sentinel/ui";
import { ProctorAssignmentExam } from '@sentinel/shared/types';
import { columns } from "@/app/(protected)/proctor/assignment/_components/columns";
import { MOCK_AVAILABLE_SUBJECTS } from '@sentinel/shared/constants';

interface ProctorAssignmentTableProps {
    data: ProctorAssignmentExam[];
}

export function ProctorAssignmentTable({ data }: ProctorAssignmentTableProps) {
    return (
        <DataTable
            columns={columns}
            data={data}
            searchKey="title"
            searchPlaceholder="Search exams..."
            facets={[
                {
                    columnKey: "status",
                    title: "Status",
                    options: [
                        { label: "Active", value: "active" },
                        { label: "Completed", value: "completed" },
                        { label: "Scheduled", value: "scheduled" },
                    ]
                },
                {
                    columnKey: "subject",
                    title: "Subject",
                    options: MOCK_AVAILABLE_SUBJECTS.map(s => ({ label: s.title, value: s.title }))
                }
            ]}
        />
    );
}
