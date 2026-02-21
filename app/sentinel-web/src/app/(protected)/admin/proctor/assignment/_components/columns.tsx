"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ProctorAssignment } from '@sentinel/shared/types';
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/common/status-badge"
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header"

export const columns = (onEdit: (assignment: ProctorAssignment) => void): ColumnDef<ProctorAssignment>[] => [
  {
    accessorKey: "proctorName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Proctor" />
    ),
    cell: ({ row }) => <div className="font-medium">{row.getValue("proctorName")}</div>,
  },
  {
    accessorKey: "examName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Exam / Course" />
    ),
    cell: ({ row }) => {
      const assignment = row.original;
      return (
        <div className="flex flex-col">
          <span>{assignment.examName}</span>
          <span className="text-xs text-muted-foreground">{assignment.examId}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "assignedStudents",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Assigned Students" />
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return <StatusBadge status={status} />
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <div className="text-right">
          <Button variant="ghost" size="sm" onClick={() => onEdit(row.original)}>
            Edit
          </Button>
        </div>
      )
    },
  },
]
