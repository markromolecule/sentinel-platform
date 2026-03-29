"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Subject } from "@sentinel/shared/types"
import { Button } from "@sentinel/ui"
import { Trash2 } from "lucide-react"
import { DataTableColumnHeader } from "@sentinel/ui"

export const columns = (onRemove: (id: string) => void): ColumnDef<Subject>[] => [
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
  },
  {
    accessorKey: "department",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Department" />
    ),
    cell: ({ row }) => {
        const departments = row.original.departments || [row.original.department];
        return (
            <div className="flex flex-wrap gap-1">
                {departments.filter(Boolean).map((d) => (
                    <span key={d} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground">
                        {d}
                    </span>
                ))}
            </div>
        );
    }
  },
  {
    accessorKey: "courses",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Course" />
    ),
    cell: ({ row }) => {
        const courses = row.original.courses || [];
        return (
            <div className="flex flex-wrap gap-1">
                {courses.length > 0 ? courses.map((c) => (
                    <span key={c} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground">
                        {c}
                    </span>
                )) : <span className="text-muted-foreground text-sm">N/A</span>}
            </div>
        );
    }
  },
  {
    accessorKey: "section",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sections" />
    ),
    cell: ({ row }) => {
        const sections = row.original.sections || [row.original.section];
        return (
            <div className="flex flex-wrap gap-1 max-w-[200px]">
                {sections.filter(Boolean).map((s) => (
                    <span key={s} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground">
                        {s}
                    </span>
                ))}
            </div>
        );
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const subject = row.original
      return (
        <div className="text-right">
             <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-red-500"
                onClick={() => onRemove(subject.id)}
            >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
            </Button>
        </div>
      )
    },
  },
]
