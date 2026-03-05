"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Course } from '@sentinel/shared/types';
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Edit2, MoreHorizontal, Trash2 } from "lucide-react";
import {
     DropdownMenu,
     DropdownMenuContent,
     DropdownMenuItem,
     DropdownMenuLabel,
     DropdownMenuSeparator,
     DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import {
     Dialog,
     DialogContent,
     DialogDescription,
     DialogFooter,
     DialogHeader,
     DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteCourseMutation } from "@/hooks/query/courses/use-delete-course-mutation";
import { EditCourseDialog } from "./edit-course-dialog";
import { useDepartmentsQuery } from "@/hooks/query/departments/use-departments-query";

// component to display department name
const DepartmentCell = ({ departmentId }: { departmentId: string }) => {
     const {
          data: departments = [
               {
                    id: "",
                    name: "",
               }
          ]
     } = useDepartmentsQuery();

     // find department by id
     const department = departments.find(d => d.id === departmentId);

     return (
          <div>
               {/* if department is not found, return departmentId */}
               {department ? department.name : departmentId}
          </div>
     );
};

const CourseActionsCell = ({ course }: { course: Course }) => {
     const deleteCourse = useDeleteCourseMutation();
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
                         <DropdownMenuItem onClick={() => navigator.clipboard.writeText(course.id)}>
                              Copy ID
                         </DropdownMenuItem>
                         <DropdownMenuSeparator />
                         <DropdownMenuItem onClick={() => setEditOpen(true)}>
                              <Edit2 className="mr-2 h-4 w-4" />
                              Edit Details
                         </DropdownMenuItem>
                         <DropdownMenuItem
                              onClick={() => setDeleteOpen(true)}
                              className="text-red-600 focus:text-red-600"
                         >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Course
                         </DropdownMenuItem>
                    </DropdownMenuContent>
               </DropdownMenu>

               <EditCourseDialog
                    open={editOpen}
                    onOpenChange={setEditOpen}
                    courseToEdit={course}
               />

               <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                    <DialogContent className="animate-none data-[state=open]:animate-none data-[state=closed]:animate-none duration-0 transition-none">
                         <DialogHeader>
                              <DialogTitle>Are you absolutely sure?</DialogTitle>
                              <DialogDescription>
                                   This action cannot be undone. This will permanently delete the course
                                   &quot;{course.title}&quot;.
                              </DialogDescription>
                         </DialogHeader>
                         <DialogFooter>
                              <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
                              <Button
                                   variant="destructive"
                                   onClick={() => {
                                        deleteCourse.mutate(course.id, {
                                             onSuccess: () => setDeleteOpen(false)
                                        });
                                   }}
                                   className="bg-red-600 hover:bg-red-700"
                              >
                                   Delete
                              </Button>
                         </DialogFooter>
                    </DialogContent>
               </Dialog>
          </>
     );
};

export const columns: ColumnDef<Course>[] = [
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
          cell: ({ row }) => <div className="max-w-[400px] truncate" title={row.getValue("title")}>{row.getValue("title")}</div>,
     },
     {
          accessorKey: "department",
          header: ({ column }) => (
               <DataTableColumnHeader column={column} title="Department" />
          ),
          cell: ({ row }) => <DepartmentCell departmentId={row.getValue("department")} />,
          filterFn: (row, id, value) => {
               return value.includes(row.getValue(id))
          },
     },
     {
          accessorKey: "createdAt",
          header: ({ column }) => (
               <DataTableColumnHeader column={column} title="Created At" />
          ),
          cell: ({ row }) => {
               const date = row.getValue("createdAt") as string;
               return <div className="text-muted-foreground">{format(new Date(date), "MMM d, yyyy")}</div>;
          },
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
          cell: ({ row }) => <CourseActionsCell course={row.original} />
     },
];
