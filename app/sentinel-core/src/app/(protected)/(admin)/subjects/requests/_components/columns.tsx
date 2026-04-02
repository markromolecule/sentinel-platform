"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge, DataTableColumnHeader } from "@sentinel/ui";
import { format } from "date-fns";
import { EnrollmentRequest } from "@sentinel/shared/types";
import { RequestActions } from "@/app/(protected)/(admin)/subjects/requests/_components/request-actions";

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

export const requestColumns: ColumnDef<EnrollmentRequest>[] = [
    {
        accessorKey: "instructor_name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Instructor" />,
    },
    {
        accessorKey: "subject_code",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Subject Code" />,
        cell: ({ row }) => <span className="font-medium">{row.original.subject_code}</span>
    },
    {
        accessorKey: "subject_title",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Description / Title" />,
    },
    {
        id: "term",
        accessorFn: (row) => `${row.term_academic_year} ${row.term_semester}`.trim(),
        header: ({ column }) => <DataTableColumnHeader column={column} title="Term" />,
        cell: ({ row }) => (
            <div className="space-y-1">
                <div className="font-medium">{row.original.term_academic_year}</div>
                <div className="text-xs text-muted-foreground">{row.original.term_semester}</div>
            </div>
        ),
    },
    {
        accessorKey: "course_code",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Course" />,
        cell: ({ row }) => {
            const labels = row.original.target_course_codes?.length
                ? row.original.target_course_codes
                : row.original.course_code
                  ? [row.original.course_code]
                  : [];

            return labels.length > 0 ? <BadgeList labels={labels} /> : "—";
        },
    },
    {
        accessorKey: "sections",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Sections" />,
        cell: ({ row }) => {
            const sections = row.original.sections;
            const labels = sections
                .map((s) => s.section_name)
                .filter((name): name is string => name !== null);
            return <BadgeList labels={labels} />;
        }
    },
    {
        accessorKey: "department_code",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Department" />,
        cell: ({ row }) => {
            const labels = row.original.target_department_codes?.length
                ? row.original.target_department_codes
                : row.original.department_code
                  ? [row.original.department_code]
                  : [];

            return labels.length > 0 ? <BadgeList labels={labels} /> : "—";
        },
    },
    {
        accessorKey: "department_id",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Department ID" />,
    },
    {
        accessorKey: "course_id",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Course ID" />,
    },
    {
        accessorKey: "section_id",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Section ID" />,
        cell: ({ row }) => {
            // For faceted filter to work with grouped sections, we might need a workaround or just filter by subject.
            // For now, we'll return the first section ID for the row so the filter catches it.
            return row.original.sections[0]?.section_id;
        }
    },
    {
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
            const status = row.original.status;
            return (
                <Badge
                    variant={
                        status === 'PENDING' ? 'secondary' :
                            status === 'APPROVED' ? 'default' :
                                'destructive'
                    }
                >
                    {status}
                </Badge>
            );
        }
    },
    {
        accessorKey: "created_at",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Requested At" />,
        cell: ({ row }) => row.original.created_at ? format(new Date(row.original.created_at), "MMM d, yyyy") : "N/A"
    },
    {
        id: "actions",
        cell: ({ row }) => <RequestActions request={row.original} />
    }
];
