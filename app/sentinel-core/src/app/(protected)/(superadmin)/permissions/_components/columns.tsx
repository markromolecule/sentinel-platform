"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Permission } from "@sentinel/shared/mock-data";
import { DataTableColumnHeader, Badge } from "@sentinel/ui";

export const columns: ColumnDef<Permission>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Permission Name" />
        ),
        cell: ({ row }) => <div className="font-mono text-xs">{row.getValue("name")}</div>,
    },
    {
        accessorKey: "module",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Module" />
        ),
        cell: ({ row }) => <Badge variant="outline">{row.getValue("module")}</Badge>,
    },
    {
        accessorKey: "description",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Description" />
        ),
        cell: ({ row }) => <div className="text-sm text-muted-foreground">{row.getValue("description")}</div>,
    },
];
