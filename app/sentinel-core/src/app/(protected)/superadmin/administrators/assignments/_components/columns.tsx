"use client";

import { ColumnDef } from "@tanstack/react-table";
import { AdminAssignment } from "@sentinel/shared/mock-data";
import { DataTableColumnHeader, Badge, Button } from "@sentinel/ui";
import { format } from "date-fns";
import { Trash } from "lucide-react";

export const columns: ColumnDef<AdminAssignment>[] = [
    {
        accessorKey: "adminName",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Administrator" />
        ),
        cell: ({ row }) => <div className="font-medium">{row.getValue("adminName")}</div>,
    },
    {
        accessorKey: "institutionName",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Institution" />
        ),
        cell: ({ row }) => <div className="font-medium text-primary">{row.getValue("institutionName")}</div>,
    },
    {
        accessorKey: "assignedAt",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Assigned At" />
        ),
        cell: ({ row }) => {
            const date = row.getValue<string | Date>("assignedAt");
            return <div className="text-muted-foreground text-sm">{format(new Date(date), "MMM d, yyyy")}</div>;
        },
    },
    {
        accessorKey: "status",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
            const status = row.getValue<string>("status");
            return (
                <Badge variant={status === "active" ? "default" : "secondary"}>
                    {status.toUpperCase()}
                </Badge>
            );
        },
    },
    {
        id: "actions",
        cell: () => (
            <Button variant="ghost" className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10">
                <Trash className="h-4 w-4" />
            </Button>
        )
    },
];
