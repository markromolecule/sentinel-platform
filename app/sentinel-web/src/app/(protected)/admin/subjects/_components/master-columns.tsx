"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MasterSubject } from "../_types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import {
     DropdownMenu,
     DropdownMenuContent,
     DropdownMenuItem,
     DropdownMenuLabel,
     DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const masterColumns: ColumnDef<MasterSubject>[] = [
     {
          accessorKey: "code",
          header: ({ column }) => (
               <DataTableColumnHeader column={column} title="Subject Code" />
          ),
     },
     {
          accessorKey: "title",
          header: ({ column }) => (
               <DataTableColumnHeader column={column} title="Description / Title" />
          ),
     },
     {
          accessorKey: "department",
          header: "Department",
          size: 250, // Align with sections
     },
     {
          accessorKey: "yearLevel",
          header: "Year Level",
          size: 150, // Align with sections
          filterFn: (row, id, value) => {
               return value.includes(row.getValue(id));
          },
     },
     {
          accessorKey: "sections",
          header: "Allocated Sections",
          filterFn: (row, id, value) => {
               // value is the array of selected options from the faceted filter
               // row.getValue(id) is the array of sections for the subject
               const rowValue = row.getValue(id) as string[];
               if (!value || value.length === 0) return true;
               // Return true if the row has any of the selected sections
               return rowValue.some((item) => value.includes(item));
          },
          cell: ({ row }) => {
               const sections = row.original.sections || [];
               return (
                    <div className="flex flex-wrap gap-1">
                         {sections.slice(0, 3).map((section) => (
                              <span key={section} className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                   {section}
                              </span>
                         ))}
                         {sections.length > 3 && (
                              <span className="text-xs text-muted-foreground self-center">
                                   +{sections.length - 3} more
                              </span>
                         )}
                    </div>
               );
          },
     },
     {
          id: "actions",
          cell: ({ row }) => {
               const subject = row.original;

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
                                   onClick={() => navigator.clipboard.writeText(subject.code)}
                              >
                                   Copy subject code
                              </DropdownMenuItem>
                              <DropdownMenuItem>Edit details</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">Delete subject</DropdownMenuItem>
                         </DropdownMenuContent>
                    </DropdownMenu>
               );
          },
     },
];
