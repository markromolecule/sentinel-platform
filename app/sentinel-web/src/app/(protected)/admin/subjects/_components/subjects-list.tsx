"use client";

import { DataTable } from "@/components/ui/data-table/data-table";
import { type Subject } from "@sentinel/shared/src/types";
import { columns } from "./columns";

interface SubjectsListProps {
    subjects: any[];
    columns?: any[];
}

import { columns as defaultColumns } from "./columns";

import { useSectionStore } from "@/stores/use-section-store";

export function SubjectsList({ subjects, columns = defaultColumns }: SubjectsListProps) {
    const sectionList = useSectionStore((state) => state.sections);

    const facets = [
        {
            columnKey: "yearLevel",
            title: "Year Level",
            options: [
                { label: "1st Year", value: "1st Year" },
                { label: "2nd Year", value: "2nd Year" },
                { label: "3rd Year", value: "3rd Year" },
                { label: "4th Year", value: "4th Year" },
            ]
        },
        {
            columnKey: "sections",
            title: "Section",
            options: sectionList.map(s => ({
                label: s.name,
                value: s.name
            }))
        }
    ];

    return (
        <DataTable
            columns={columns}
            data={subjects}
            searchKey="title"
            searchPlaceholder="Search subjects..."
            facets={facets}
        />
    );
}
