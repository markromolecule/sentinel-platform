"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Course } from '@sentinel/shared/types';
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { format } from "date-fns";

export const columns: ColumnDef<Course>[] = [
     {
          accessorKey: "code",
          header: ({ column }) => (
               <DataTableColumnHeader column={column} title="Code" />
          ),
          cell: ({ row }) => <div className="font-medium">{row.getValue("code")}</div>,
     },
     {
          accessorKey: "title",
          header: ({ column }) => (
               <DataTableColumnHeader column={column} title="Title" />
          ),
          cell: ({ row }) => <div className="max-w-[400px] truncate" title={row.getValue("title")}>{row.getValue("title")}</div>,
     },
     {
          accessorKey: "department",
          header: ({ column }) => (
               <DataTableColumnHeader column={column} title="Department" />
          ),
     },
     {
          accessorKey: "createdAt",
          header: ({ column }) => (
               <DataTableColumnHeader column={column} title="Created At" />
          ),
          cell: ({ row }) => {
               const date = row.getValue("createdAt") as string;
               return <div className="text-muted-foreground">{format(new Date(date), "MMM d, yyyy")}</div>;
          },
     },
];
