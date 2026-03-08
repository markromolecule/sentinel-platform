"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Announcement } from "@sentinel/shared/types"
import { Badge } from "@sentinel/ui"
import { DataTableColumnHeader } from "@sentinel/ui"

export const columns: ColumnDef<Announcement>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => (
      <div className="flex flex-col pl-4">
        <span className="font-medium">{row.getValue("title")}</span>
        <span className="text-xs text-muted-foreground truncate max-w-[200px]">{row.original.content}</span>
      </div>
    ),
  },
  {
    accessorKey: "publishedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Published" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("publishedAt") as string;
      return (
        <div className="text-muted-foreground text-sm">
          {date || "N/A"}
        </div>
      )
    },
  },
  {
    accessorKey: "author",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="From" />
    ),
    cell: ({ row }) => <Badge variant="outline">{row.getValue("author")}</Badge>,
  },
]
