"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { AdminUser } from "@sentinel/shared/types";
import { DataTableColumnHeader, Badge } from "@sentinel/ui";
import { AdministratorActionsCell } from "./administrator-actions-cell";
import { AdministratorCourseCell } from "./administrator-course-cell";
import { StatusBadge } from "@/components/common/status-badge";

export const columns = (
    onEdit: (admin: AdminUser) => void, 
    onDelete: (admin: AdminUser) => void
): ColumnDef<AdminUser>[] => [
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
        id: "role",
        accessorKey: "role",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Role" />
        ),
        cell: ({ row }) => {
            const role = row.getValue<string>("role");
            return (
                <Badge variant="outline" className="capitalize">
                    {role}
                </Badge>
            );
        },
    },
    {
        accessorKey: "institution",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Institution" />
        ),
        cell: ({ row }) => <div>{row.getValue("institution") || "Global"}</div>,
    },
    {
        accessorKey: "departmentCode",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Department" />
        ),
        cell: ({ row }) => <div>{row.getValue("departmentCode") || row.original.department || "System"}</div>,
    },
    {
        accessorKey: "course",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Course" />
        ),
        cell: ({ row }) => <AdministratorCourseCell administrator={row.original} />,
    },
    {
        accessorKey: "status",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
            const status = row.getValue<string>("status");
            const normalizedStatus = status.toLowerCase();
            const label = normalizedStatus === "active" ? "Online" : "Offline";

            return (
                <StatusBadge status={normalizedStatus} label={label} />
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
        cell: ({ row }) => (
            <AdministratorActionsCell 
                administrator={row.original} 
                onEdit={onEdit}
                onDelete={onDelete}
            />
        )
    },
];
