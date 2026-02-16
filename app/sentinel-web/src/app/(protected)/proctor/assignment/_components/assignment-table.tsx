"use client";

import { DataTable } from "@/components/ui/data-table/data-table";
import { ProctorAssignmentExam } from "../_types";
import { columns } from "./columns";

interface ProctorAssignmentTableProps {
    data: ProctorAssignmentExam[];
}

import { MOCK_AVAILABLE_SUBJECTS } from "@/app/(protected)/proctor/_constants";

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
