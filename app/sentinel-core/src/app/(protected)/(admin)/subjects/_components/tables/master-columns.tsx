"use client";

import { format } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import { type MasterSubject } from "@sentinel/shared/types";
import { Checkbox, DataTableColumnHeader } from "@sentinel/ui";
import { MasterSubjectActionsCell } from "./master-subject-actions-cell";

export function createMasterColumns({
    canManageCatalog = true,
}: {
    canManageCatalog?: boolean;
} = {}): ColumnDef<MasterSubject>[] {
    return [
        ...(canManageCatalog
            ? [
                  {
                      id: "select",
                      header: ({ table }) => (
                          <Checkbox
                              checked={
                                  table.getIsAllPageRowsSelected() ||
                                  (table.getIsSomePageRowsSelected() && "indeterminate")
                              }
                              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                              aria-label="Select all subjects"
                          />
                      ),
                      cell: ({ row }) => (
                          <Checkbox
                              checked={row.getIsSelected()}
                              onCheckedChange={(value) => row.toggleSelected(!!value)}
                              aria-label="Select subject"
                          />
                      ),
                      enableSorting: false,
                      enableHiding: false,
                  } satisfies ColumnDef<MasterSubject>,
              ]
            : []),
        {
            accessorKey: "code",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Subject Code" />,
        },
        {
            accessorKey: "title",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Description / Title" />
            ),
        },
        {
            accessorKey: "createdBy",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Created By" />,
            cell: ({ row }) => row.original.createdBy || "—",
        },
        {
            accessorKey: "updatedAt",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Updated At" />,
            cell: ({ row }) => {
                const date = row.original.updatedAt;
                if (!date) return <span className="text-muted-foreground">None</span>;
                return format(new Date(date), "MMM d, yyyy");
            },
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <MasterSubjectActionsCell
                    subject={row.original}
                    canManageCatalog={canManageCatalog}
                />
            ),
        },
    ];
}

export const masterColumns: ColumnDef<MasterSubject>[] = createMasterColumns();
