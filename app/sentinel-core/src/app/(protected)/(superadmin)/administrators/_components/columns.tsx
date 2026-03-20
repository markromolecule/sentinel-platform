"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { AdminUser } from "@sentinel/shared/types";
import { DataTableColumnHeader, Badge } from "@sentinel/ui";
import { AdministratorActionsCell } from "./administrator-actions-cell";

export const columns: ColumnDef<AdminUser>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Full Name" />
        ),
        cell: ({ row }) => {
            const admin = row.original;
            const fullName = admin.name || `${admin.firstName} ${admin.lastName}`;
            return <div className="font-medium">{fullName}</div>;
        },
    },
    {
        accessorKey: "email",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Email" />
        ),
        cell: ({ row }) => <div>{row.getValue("email")}</div>,
    },
    {
        accessorKey: "institution",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Institution" />
        ),
        cell: ({ row }) => <div>{row.getValue("institution") || "Global"}</div>,
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
                    {status.charAt(0) ? status.charAt(0).toUpperCase() + status.slice(1) : "N/A"}
                </Badge>
            );
        },
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
        id: "actions",
        cell: ({ row }) => <AdministratorActionsCell administrator={row.original} />
    },
];
