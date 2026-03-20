"use client";

import { DataTable } from "@sentinel/ui";
import { StudentsTableProps } from '@sentinel/shared/types';;
import { columns } from "@/app/(protected)/(instructor)/students/_components/columns";

import { MOCK_SECTIONS } from '@sentinel/shared/constants';;

export function StudentsTable({ students }: StudentsTableProps) {
    return (
        <DataTable
            columns={columns}
            data={students}
            searchKey="name"
            searchPlaceholder="Search students..."
            facets={[
                {
                    columnKey: "yearLevel",
                    title: "Year Level",
                    options: [
                        { label: "1st Year", value: "1st Year" },
                        { label: "2nd Year", value: "2nd Year" },
                        { label: "3rd Year", value: "3rd Year" },
                        { label: "4th Year", value: "4th Year" },
                        { label: "5th Year", value: "5th Year" },
                    ]
                },
                {
                    columnKey: "section",
                    title: "Section",
                    options: MOCK_SECTIONS.map(s => ({ label: s, value: s }))
                },
                {
                    columnKey: "status",
                    title: "Status",
                    options: [
                        { label: "Active", value: "active" },
                        { label: "Inactive", value: "inactive" },
                        { label: "Archived", value: "archived" },
                    ]
                }
            ]}
        />
    );
}
