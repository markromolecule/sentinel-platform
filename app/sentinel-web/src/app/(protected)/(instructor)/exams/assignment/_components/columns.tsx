"use client"

import { ColumnDef } from "@tanstack/react-table"
import { InstructorAssignmentExam } from '@sentinel/shared/types';
import { StatusBadge } from "@/components/common/displays/status-badge"
import { Button } from "@sentinel/ui"
import { DataTableColumnHeader } from "@sentinel/ui"

export const columns: ColumnDef<InstructorAssignmentExam>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Exam Title" />
    ),
    cell: ({ row }) => <div className="font-medium pl-4">{row.getValue("title")}</div>,
  },
  {
    accessorKey: "subject",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Subject" />
    ),
  },
  {
    accessorKey: "scheduledDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("scheduledDate") as string;
      return <div>{date || "Unscheduled"}</div>
    },
  },
  {
    accessorKey: "assignedInstructor",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Assigned Instructor" />
    ),
    cell: ({ row }) => {
      const instructorName = row.original.assignedInstructor;
      const initials = instructorName.split(" ").map((n) => n[0]).join("");

      return (
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
            {initials}
          </div>
          {instructorName}
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <StatusBadge status={status} />
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <div className="text-right pr-4">
          <Button variant="ghost" size="sm">
            Reassign
          </Button>
        </div>
      )
    },
  },
]
