"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Course } from "@sentinel/shared/types";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { format } from "date-fns";
import { CourseDepartmentCell } from "@/app/(protected)/admin/courses/_components/course-department-cell";
import { CourseActionsCell } from "@/app/(protected)/admin/courses/_components/course-actions-cell";

export const columns: ColumnDef<Course>[] = [
     {
          accessorKey: "code",
          header: ({ column }) => (
               <DataTableColumnHeader column={column} title="Code" />
          ),
          cell: ({ row }) => (
               <div className="font-medium">{row.getValue("code")}</div>
          ),
     },
     {
          accessorKey: "title",
          header: ({ column }) => (
               <DataTableColumnHeader column={column} title="Title" />
          ),
          cell: ({ row }) => (
               <div className="max-w-[400px] truncate" title={row.getValue("title")}>
                    {row.getValue("title")}
               </div>
          ),
     },
     {
          accessorKey: "department",
          header: ({ column }) => (
               <DataTableColumnHeader column={column} title="Department" />
          ),
          cell: ({ row }) => (
               <CourseDepartmentCell departmentId={row.getValue("department")} />
          ),
          filterFn: (row, id, value) => {
               return value.includes(row.getValue(id));
          },
     },
     {
          accessorKey: "createdBy",
          header: ({ column }) => (
               <DataTableColumnHeader column={column} title="Created By" />
          ),
          cell: ({ row }) => (
               <div className="text-muted-foreground">
                    {row.getValue("createdBy") || "—"}
               </div>
          ),
     },
     {
          accessorKey: "createdAt",
          header: ({ column }) => (
               <DataTableColumnHeader column={column} title="Created At" />
          ),
          cell: ({ row }) => {
               const date = row.getValue("createdAt") as string | null | undefined;
               return (
                    <div className="text-muted-foreground">
                         {date ? format(new Date(date), "MMM d, yyyy") : "—"}
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
               <div className="text-muted-foreground">
                    {row.getValue("updatedBy") || "—"}
               </div>
          ),
     },
     {
          accessorKey: "updatedAt",
          header: ({ column }) => (
               <DataTableColumnHeader column={column} title="Updated At" />
          ),
          cell: ({ row }) => {
               const date = row.getValue("updatedAt") as string | null | undefined;
               return (
                    <div className="text-muted-foreground">
                         {date ? format(new Date(date), "MMM d, yyyy") : "—"}
                    </div>
               );
          },
     },
     {
          id: "actions",
          cell: ({ row }) => <CourseActionsCell course={row.original} />,
     },
];
