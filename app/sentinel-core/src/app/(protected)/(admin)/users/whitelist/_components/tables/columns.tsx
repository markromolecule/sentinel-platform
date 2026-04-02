"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge, Checkbox, DataTableColumnHeader } from "@sentinel/ui";
import { StudentWhitelist } from "@sentinel/shared/types";
import { StudentWhitelistActionsCell } from "./student-whitelist-actions-cell";

export const columns: ColumnDef<StudentWhitelist>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all whitelist rows"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select whitelist row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "institutionId",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Institution" />
        ),
        cell: ({ row }) => (
            <div className="text-sm">
                {row.original.institutionName || row.original.institutionId || "—"}
            </div>
        ),
        filterFn: (row, id, value) => value.includes(String(row.getValue(id))),
    },
    {
        accessorKey: "studentNumber",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Student Number" />
        ),
        cell: ({ row }) => (
            <div className="font-mono text-sm">{row.getValue("studentNumber")}</div>
        ),
    },
    {
        accessorKey: "lastName",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Last Name" />
        ),
        cell: ({ row }) => <div className="font-medium">{row.getValue("lastName")}</div>,
    },
    {
        accessorKey: "firstName",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="First Name" />
        ),
        cell: ({ row }) => (
            <div className="text-muted-foreground">{row.getValue("firstName") || "—"}</div>
        ),
    },
    {
        accessorKey: "departmentId",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Department" />
        ),
        cell: ({ row }) => (
            <div className="text-sm">
                {row.original.departmentCode || row.original.departmentName || "—"}
            </div>
        ),
        filterFn: (row, id, value) => value.includes(String(row.getValue(id))),
    },
    {
        accessorKey: "courseId",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Course" />
        ),
        cell: ({ row }) => (
            <div className="text-sm">
                {row.original.courseCode || row.original.courseTitle || "—"}
            </div>
        ),
        filterFn: (row, id, value) => value.includes(String(row.getValue(id))),
    },
    {
        accessorKey: "status",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            const classes: Record<string, string> = {
                ACTIVE: "bg-emerald-100 text-emerald-700 border-emerald-200",
                INACTIVE: "bg-amber-100 text-amber-700 border-amber-200",
                ARCHIVED: "bg-slate-100 text-slate-700 border-slate-200",
            };

            return (
                <Badge variant="outline" className={classes[status] || ""}>
                    {status}
                </Badge>
            );
        },
        filterFn: (row, id, value) => value.includes(String(row.getValue(id))),
    },
    {
        id: "claimStatus",
        accessorFn: (row) => (row.claimedUserId ? "CLAIMED" : "UNCLAIMED"),
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Claim Status" />
        ),
        cell: ({ row }) => {
            const isClaimed = Boolean(row.original.claimedUserId);

            return (
                <Badge variant="outline">
                    {isClaimed ? "Claimed" : "Unclaimed"}
                </Badge>
            );
        },
        filterFn: (row, id, value) => value.includes(String(row.getValue(id))),
    },
    {
        accessorKey: "claimedName",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Claimed By" />
        ),
        cell: ({ row }) => (
            <div className="text-sm text-muted-foreground">
                {row.original.claimedName || row.original.claimedEmail || "—"}
            </div>
        ),
    },
    {
        accessorKey: "claimedAt",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Claimed At" />
        ),
        cell: ({ row }) => {
            const date = row.getValue<string | Date | null>("claimedAt");
            if (!date) return <div className="text-muted-foreground">—</div>;

            return (
                <div className="text-muted-foreground">
                    {format(new Date(date), "MMM d, yyyy")}
                </div>
            );
        },
    },
    {
        accessorKey: "updatedAt",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Updated At" />
        ),
        cell: ({ row }) => {
            const date = row.getValue<string | Date | null>("updatedAt");
            if (!date) return <div className="text-muted-foreground">—</div>;

            return (
                <div className="text-muted-foreground">
                    {format(new Date(date), "MMM d, yyyy")}
                </div>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row }) => <StudentWhitelistActionsCell record={row.original} />,
    },
];
