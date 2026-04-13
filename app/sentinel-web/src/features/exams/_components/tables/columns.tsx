"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ProctorExam } from '@sentinel/shared/types'
import { StatusBadge } from "@/components/common/displays/status-badge"
import { FileText, Clock, Users, CalendarDays } from "lucide-react"
import { DataTableColumnHeader } from "@sentinel/ui"
import { ExamActionCell } from "./exam-action-cell"

export const columns: ColumnDef<ProctorExam>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Exam Title" />
    ),
    cell: ({ row }) => {
      const exam = row.original;
      return (
        <div className="flex flex-col pl-4">
          <span>{exam.title}</span>
          {exam.description && (
            <span className="text-xs text-muted-foreground line-clamp-1">
              {exam.description}
            </span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "subject",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Subject" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-muted-foreground" />
        <span>{row.getValue("subject")}</span>
      </div>
    ),
  },
  {
    accessorKey: "scheduledDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("scheduledDate") as Date | string | null;
      return date ? (
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-muted-foreground" />
          <span>{new Date(date).toLocaleDateString()}</span>
        </div>
      ) : (
        <span className="text-muted-foreground italic">Unscheduled</span>
      )
    },
  },
  {
    accessorKey: "duration",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Duration" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-muted-foreground" />
        <span>{row.getValue("duration")}m</span>
      </div>
    ),
  },
  {
    accessorKey: "studentsCount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Students" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-muted-foreground" />
        <span>{row.getValue("studentsCount")}</span>
      </div>
    ),
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
    cell: ({ row }) => <ExamActionCell exam={row.original} />,
  },
]
