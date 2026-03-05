"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Section } from '@sentinel/shared/types';
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { MoreHorizontal, Edit2, Trash2 } from "lucide-react";
import {
     DropdownMenu,
     DropdownMenuContent,
     DropdownMenuItem,
     DropdownMenuLabel,
     DropdownMenuSeparator,
     DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { useDepartmentsQuery } from "@/hooks/query/departments/use-departments-query";
import { useState } from "react";
import { toast } from "sonner";
import { useDeleteSectionMutation } from "@/hooks/query/sections/use-delete-section-mutation";
import { EditSectionDialog } from "./edit-section-dialog";
import {
     Dialog,
     DialogContent,
     DialogDescription,
     DialogFooter,
     DialogHeader,
     DialogTitle,
} from "@/components/ui/dialog";

import { useCoursesQuery } from "@/hooks/query/courses/use-courses-query";

// Component to render course code
const CourseCell = ({ courseId }: { courseId?: string }) => {
     const { data: courses = [] } = useCoursesQuery();
     if (!courseId) return <span className="text-muted-foreground">None</span>;
     const course = courses.find((c) => c.id === courseId);
     return <div className="font-medium">{course?.code || "Unknown Course"}</div>;
};

// Component to render department code
const DepartmentCell = ({ departmentId }: { departmentId: string }) => {
     const { data: departments = [] } = useDepartmentsQuery();
     const dept = departments.find((c) => c.id === departmentId);
     return <div className="font-medium">{dept?.name || "Unknown Department"}</div>;
};

// Component to handle actions
const SectionActionsCell = ({ section }: { section: Section }) => {
     const deleteSection = useDeleteSectionMutation({
          onSuccess: () => toast.success('Section deleted successfully'),
          onError: (error: Error) => toast.error(error.message)
     });
     const [editOpen, setEditOpen] = useState(false);
     const [deleteOpen, setDeleteOpen] = useState(false);

     return (
          <>
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
                              onClick={() => navigator.clipboard.writeText(section.id)}
                         >
                              Copy ID
                         </DropdownMenuItem>
                         <DropdownMenuSeparator />
                         <DropdownMenuItem onClick={() => setEditOpen(true)}>
                              <Edit2 className="mr-2 h-4 w-4" /> Edit
                         </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => setDeleteOpen(true)} className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                         </DropdownMenuItem>
                    </DropdownMenuContent>
               </DropdownMenu>

               <EditSectionDialog
                    open={editOpen}
                    onOpenChange={setEditOpen}
                    sectionToEdit={section}
               />

               <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                    <DialogContent className="animate-none data-[state=open]:animate-none data-[state=closed]:animate-none duration-0 transition-none">
                         <DialogHeader>
                              <DialogTitle>Delete Section?</DialogTitle>
                              <DialogDescription>
                                   This action cannot be undone. This will permanently delete
                                   &quot;{section.name}&quot; and remove it from the system.
                              </DialogDescription>
                         </DialogHeader>
                         <DialogFooter>
                              <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
                              <Button
                                   variant="destructive"
                                   onClick={() => deleteSection.mutate(section.id, { onSuccess: () => setDeleteOpen(false) })}
                                   className="bg-red-600 hover:bg-red-700"
                                   disabled={deleteSection.isPending}
                              >
                                   {deleteSection.isPending ? 'Deleting...' : 'Delete'}
                              </Button>
                         </DialogFooter>
                    </DialogContent>
               </Dialog>
          </>
     );
};

export const columns: ColumnDef<Section>[] = [
     {
          accessorKey: "name",
          header: ({ column }) => (
               <DataTableColumnHeader column={column} title="Section" />
          ),
          cell: ({ row }) => <div className="font-semibold">{row.getValue("name")}</div>,
     },
     {
          accessorKey: "departmentId",
          header: ({ column }) => (
               <DataTableColumnHeader column={column} title="Department" />
          ),
          cell: ({ row }) => <DepartmentCell departmentId={row.getValue("departmentId")} />,
     },
     {
          accessorKey: "courseId",
          header: ({ column }) => (
               <DataTableColumnHeader column={column} title="Course" />
          ),
          cell: ({ row }) => <CourseCell courseId={row.getValue("courseId")} />,
     },
     {
          accessorKey: "yearLevel",
          header: ({ column }) => (
               <DataTableColumnHeader column={column} title="Year Level" />
          ),
          cell: ({ row }) => {
               const val = row.getValue<number | undefined>("yearLevel");
               return <Badge variant="outline">{val ? `Year ${val}` : 'N/A'}</Badge>;
          },
          size: 150,
     },
     {
          accessorKey: "createdBy",
          header: ({ column }) => (
               <DataTableColumnHeader column={column} title="Created By" />
          ),
          cell: ({ row }) => (
               <div className="font-medium text-sm text-muted-foreground">
                    {row.getValue("createdBy") || "—"}
               </div>
          ),
     },
     {
          accessorKey: "updatedBy",
          header: ({ column }) => (
               <DataTableColumnHeader column={column} title="Updated By" />
          ),
          cell: ({ row }) => (
               <div className="font-medium text-sm text-muted-foreground">
                    {row.getValue("updatedBy") || "—"}
               </div>
          ),
     },
     {
          accessorKey: "createdAt",
          header: ({ column }) => (
               <DataTableColumnHeader column={column} title="Created At" />
          ),
          cell: ({ row }) => {
               const date = row.getValue<string | Date>("createdAt");
               if (!date) return <div className="text-muted-foreground">None</div>;
               return (
                    <div className="font-medium text-sm text-muted-foreground">
                         {format(new Date(date), "MMM d, yyyy")}
                    </div>
               );
          },
     },
     {
          id: "actions",
          cell: ({ row }) => <SectionActionsCell section={row.original} />,
     },
];
