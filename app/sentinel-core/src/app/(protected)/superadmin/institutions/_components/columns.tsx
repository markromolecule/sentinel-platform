"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Institution } from '@sentinel/shared/types'
import { Checkbox } from "@sentinel/ui"
import { DataTableColumnHeader } from "@sentinel/ui"
import { Button } from "@sentinel/ui"
import { Edit2, MoreHorizontal, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@sentinel/ui"

export const columns = (
  onEdit: (institution: Institution) => void,
  onDelete: (institution: Institution) => void
): ColumnDef<Institution>[] => [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Institution Name" />
      ),
      cell: ({ row }) => {
        const institution = row.original
        return (
          <div className="flex flex-col">
            <span className="font-medium text-sm">{institution.name}</span>
            <span className="text-muted-foreground text-xs">{institution.code}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "code",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Code" />
      ),
      cell: ({ row }) => (
        <div className="font-mono text-xs uppercase bg-muted px-2 py-0.5 rounded w-fit">
          {row.getValue("code")}
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date Created" />
      ),
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as string | Date;
        if (!date) return <span className="text-muted-foreground">-</span>;

        const formattedDate = new Date(date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });

        return <span className="text-sm">{formattedDate}</span>;
      },
    },
    {
      accessorKey: "createdBy",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created By" />
      ),
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">{row.getValue("createdBy")}</span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const institution = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(institution.id)}
              >
                Copy ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit(institution)}>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit Institution
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-600 dark:text-red-400" 
                onClick={() => onDelete(institution)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove Institution
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
