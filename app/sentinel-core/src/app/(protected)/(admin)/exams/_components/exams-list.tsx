"use client";

import { DataTable } from "@sentinel/ui";
import { type ProctorExam } from '@sentinel/shared/types';;
import { columns } from "@/app/(protected)/(admin)/exams/_components/columns";

interface ExamsListProps {
    exams: ProctorExam[];
}

export function ExamsList({ exams }: ExamsListProps) {


    return (
        <DataTable
            columns={columns}
            data={exams}
            searchKey="title"
            searchPlaceholder="Search exams..."
            facets={[
                {
                    columnKey: "status",
                    title: "Status",
                    options: [
                        { label: "Active", value: "active" },
                        { label: "Completed", value: "completed" },
                        { label: "Draft", value: "draft" },
                    ],
                },
            ]}
        />
    );
}
