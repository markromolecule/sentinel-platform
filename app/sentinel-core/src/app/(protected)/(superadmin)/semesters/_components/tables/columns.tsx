"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Semester } from "@sentinel/shared/types";
import { Badge } from "@sentinel/ui";
import { SemesterActionsCell } from "./semester-actions-cell";
import { format } from "date-fns";

export const columns: ColumnDef<Semester>[] = [
    {
        accessorKey: "academicYear",
        header: "Academic Year",
    },
    {
        accessorKey: "semester",
        header: "Semester",
    },
    {
        accessorKey: "startDate",
        header: "Start Date",
        cell: ({ row }) => {
            const date = row.getValue("startDate") as string;
            return date ? format(new Date(date), "MMM dd, yyyy") : "-";
        }
    },
    {
        accessorKey: "endDate",
        header: "End Date",
        cell: ({ row }) => {
            const date = row.getValue("endDate") as string;
            return date ? format(new Date(date), "MMM dd, yyyy") : "-";
        }
    },
    {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => {
            const isActive = row.getValue("isActive") as boolean;
            return (
                <Badge variant={isActive ? "default" : "secondary"}>
                    {isActive ? "Active" : "Inactive"}
                </Badge>
            );
        },
    },
    {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) => {
            const date = row.getValue("createdAt") as string;
            return date ? format(new Date(date), "MMM dd, yyyy") : "-";
        },
    },
    {
        id: "actions",
        cell: ({ row }) => <SemesterActionsCell semester={row.original} />,
    },
];
