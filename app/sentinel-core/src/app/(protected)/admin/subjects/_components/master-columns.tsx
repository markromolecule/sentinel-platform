"use client";

import { format } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import { type MasterSubject } from "@sentinel/shared/types";
import { DataTableColumnHeader } from "@sentinel/ui";
import { useCoursesQuery } from "@/hooks/query/courses/use-courses-query";
import { useDepartmentsQuery } from "@/hooks/query/departments/use-departments-query";
import { useSectionsQuery } from "@/hooks/query/sections/use-sections-query";
import { MasterSubjectActionsCell } from "@/app/(protected)/admin/subjects/_components/master-subject-actions-cell";

function BadgeList({ labels }: { labels: string[] }) {
    return (
        <div className="flex flex-wrap gap-1">
            {labels.slice(0, 3).map((label) => (
                <span
                    key={label}
                    className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold border-transparent bg-secondary text-secondary-foreground"
                >
                    {label}
                </span>
            ))}
            {labels.length > 3 && (
                <span className="text-xs text-muted-foreground self-center">
                    +{labels.length - 3} more
                </span>
            )}
        </div>
    );
}

function DepartmentIdsCell({ departmentIds }: { departmentIds?: string[] }) {
    const { data: departments = [] } = useDepartmentsQuery();
    const labels = (departmentIds ?? [])
        .map((departmentId) => {
            const department = departments.find((item) => item.id === departmentId);
            return department?.code || department?.name || departmentId;
        })
        .filter(Boolean);

    if (labels.length === 0) {
        return <span className="text-muted-foreground">None</span>;
    }

    return <BadgeList labels={labels} />;
}

function CourseIdsCell({ courseIds }: { courseIds?: string[] }) {
    const { data: courses = [] } = useCoursesQuery();
    const labels = (courseIds ?? [])
        .map((courseId) => {
            const course = courses.find((item) => item.id === courseId);
            return course?.code || course?.title || courseId;
        })
        .filter(Boolean);

    if (labels.length === 0) {
        return <span className="text-muted-foreground">None</span>;
    }

    return <BadgeList labels={labels} />;
}

function SectionIdsCell({ sectionIds }: { sectionIds?: string[] }) {
    const { data: sections = [] } = useSectionsQuery();
    const labels = (sectionIds ?? [])
        .map((sectionId) => {
            const section = sections.find((item) => item.id === sectionId);
            return section?.name || sectionId;
        })
        .filter(Boolean);

    if (labels.length === 0) {
        return <span className="text-muted-foreground">None</span>;
    }

    return <BadgeList labels={labels} />;
}

export const masterColumns: ColumnDef<MasterSubject>[] = [
    {
        accessorKey: "code",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Subject Code" />,
    },
    {
        accessorKey: "title",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Description / Title" />
        ),
    },
    {
        accessorKey: "departmentIds",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Departments" />,
        filterFn: (row, id, value) => {
            if (!value?.length) return true;
            const rowValue = (row.getValue(id) as string[] | undefined) ?? [];
            return rowValue.some((entry) => value.includes(entry));
        },
        cell: ({ row }) => <DepartmentIdsCell departmentIds={row.original.departmentIds} />,
    },
    {
        accessorKey: "courseIds",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Courses" />,
        filterFn: (row, id, value) => {
            if (!value?.length) return true;
            const rowValue = (row.getValue(id) as string[] | undefined) ?? [];
            return rowValue.some((entry) => value.includes(entry));
        },
        cell: ({ row }) => <CourseIdsCell courseIds={row.original.courseIds} />,
    },
    {
        accessorKey: "yearLevels",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Year Levels" />,
        filterFn: (row, id, value) => {
            if (!value?.length) return true;
            const rowValue = ((row.getValue(id) as number[] | undefined) ?? []).map(String);
            return rowValue.some((entry) => value.includes(entry));
        },
        cell: ({ row }) => {
            const levels = row.original.yearLevels ?? [];
            if (levels.length === 0) {
                return <span className="text-muted-foreground">None</span>;
            }

            return <BadgeList labels={levels.map((level) => `Year ${level}`)} />;
        },
    },
    {
        accessorKey: "sectionIds",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Sections" />,
        filterFn: (row, id, value) => {
            if (!value?.length) return true;
            const rowValue = (row.getValue(id) as string[] | undefined) ?? [];
            return rowValue.some((entry) => value.includes(entry));
        },
        cell: ({ row }) => <SectionIdsCell sectionIds={row.original.sectionIds} />,
    },
    {
        accessorKey: "createdBy",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Created By" />,
        cell: ({ row }) => row.original.createdBy || "—",
    },
    {
        accessorKey: "createdAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Created At" />,
        cell: ({ row }) => {
            const date = row.original.createdAt;
            if (!date) return <span className="text-muted-foreground">None</span>;
            return format(new Date(date), "MMM d, yyyy");
        },
    },
    {
        id: "actions",
        cell: ({ row }) => <MasterSubjectActionsCell subject={row.original} />,
    },
];
