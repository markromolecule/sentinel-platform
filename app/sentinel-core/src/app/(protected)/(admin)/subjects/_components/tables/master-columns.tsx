"use client";

import { format } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import { type MasterSubject } from "@sentinel/shared/types";
import { DataTableColumnHeader } from "@sentinel/ui";
import { MasterSubjectActionsCell } from "./master-subject-actions-cell";

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
        accessorKey: "createdBy",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Created By" />,
        cell: ({ row }) => row.original.createdBy || "—",
    },
    {
        accessorKey: "updatedAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Updated At" />,
        cell: ({ row }) => {
            const date = row.original.updatedAt;
            if (!date) return <span className="text-muted-foreground">None</span>;
            return format(new Date(date), "MMM d, yyyy");
        },
    },
    {
        id: "actions",
        cell: ({ row }) => <MasterSubjectActionsCell subject={row.original} />,
    },
];
