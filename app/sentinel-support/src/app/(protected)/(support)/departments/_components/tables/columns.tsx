"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Department } from "@sentinel/shared/types";
import { DataTableColumnHeader } from "@sentinel/ui";
import { DepartmentActionsCell } from "./department-actions-cell";

// columns for the data table
export const columns: ColumnDef<Department>[] = [
    {
        accessorFn: (row) => row.institution ?? "",
        id: "institution",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Institution" />
        ),
        cell: ({ row }) => <div>{row.original.institution || "—"}</div>,
        filterFn: (row, id, value) => value.includes(String(row.getValue(id))),
    },
    {
        accessorKey: "code",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Code" />
        ),
        cell: ({ row }) => <div className="font-medium">{row.getValue("code") || "N/A"}</div>,
    },
    {
        accessorKey: "name",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Department Name" />
        ),
        cell: ({ row }) => <div>{row.getValue("name")}</div>,
    },
    {
        accessorKey: "createdBy",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Created By" />
        ),
        cell: ({ row }) => (
            <div className="text-muted-foreground text-sm">
                {row.getValue("createdBy") || "System"}
            </div>
        )
    },
    {
        accessorKey: "createdAt",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Created At" />
        ),
        cell: ({ row }) => {
            const date = row.getValue<string | Date>("createdAt");
            if (!date) return <div className="text-muted-foreground">—</div>;
            return (
                <div className="text-muted-foreground">
                    {format(new Date(date), "MMM d, yyyy")}
                </div>
            );
        },
    },
    {
        accessorKey: "updatedBy",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Updated By" />
        ),
        cell: ({ row }) => (
            <div className="text-muted-foreground text-sm">
                {row.getValue("updatedBy") || "—"}
            </div>
        )
    },
    {
        accessorKey: "updatedAt",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Updated At" />
        ),
        cell: ({ row }) => {
            const date = row.getValue<string | Date>("updatedAt");
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
        cell: ({ row }) => <DepartmentActionsCell department={row.original} />
    },
];
