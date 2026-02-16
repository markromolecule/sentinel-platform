"use client";

import { DataTable } from "@/components/ui/data-table/data-table";
import { ExamsGridProps } from "../_types"; // Reuse props for now as it's just { exams: ProctorExam[] }
import { columns } from "./columns";

interface ExamsTableProps extends ExamsGridProps {
    toolbarActions?: React.ReactNode;
}

import { MOCK_AVAILABLE_SUBJECTS } from "@/app/(protected)/proctor/_constants";

export function ExamsTable({ exams, toolbarActions }: ExamsTableProps) {
    return (
        <DataTable
            columns={columns}
            data={exams}
            searchKey="title"
            searchPlaceholder="Search exams..."
            toolbarActions={toolbarActions}
            facets={[
                {
                    columnKey: "status",
                    title: "Status",
                    options: [
                        { label: "Active", value: "active" },
                        { label: "Draft", value: "draft" },
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
