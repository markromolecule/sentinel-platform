"use client";

import { DataTable } from "@sentinel/ui";
import { useSubjectStore } from "@/stores/use-subject-store";
import { type Subject } from "@sentinel/shared/types";
import { columns } from "./columns";

interface SubjectsTableProps {
    subjects: Subject[];
}

export function SubjectsTable({ subjects }: SubjectsTableProps) {
    const removeSubject = useSubjectStore((state) => state.removeSubject);

    return (
        <DataTable
            columns={columns(removeSubject)}
            data={subjects}
            searchKey="title"
            searchPlaceholder="Search subjects..."
            facets={[
                {
                    columnKey: "department",
                    title: "Department",
                    options: [
                        { label: "SECA", value: "School of Engineering, Computing, and Architecture" },
                        { label: "SBMA", value: "School of Business, Management, and Accountancy" },
                        { label: "SASE", value: "School of Arts, Sciences, and Education" },
                    ]
                }
            ]}
        />
    );
}
