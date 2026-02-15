"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Section } from "../_types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal, Edit2, Trash2 } from "lucide-react";
import {
     DropdownMenu,
     DropdownMenuContent,
     DropdownMenuItem,
     DropdownMenuLabel,
     DropdownMenuSeparator,
     DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useCourseStore } from "@/stores/use-course-store";

// Component to render course code
const CourseCell = ({ courseId }: { courseId: string }) => {
     const course = useCourseStore((state) => state.courses.find((c) => c.id === courseId));
     return <div className="font-medium">{course?.code || "Unknown Course"}</div>;
};

export const columns: ColumnDef<Section>[] = [
     {
          accessorKey: "courseId",
          header: "Course",
          cell: ({ row }) => <CourseCell courseId={row.getValue("courseId")} />,
     },
     {
          accessorKey: "name",
          header: ({ column }) => {
               return (
                    <Button
                         variant="ghost"
                         onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                         Section
                         <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
               );
          },
          cell: ({ row }) => <div className="font-semibold pl-4">{row.getValue("name")}</div>,
     },
     {
          accessorKey: "yearLevel",
          header: "Year Level",
          cell: ({ row }) => <Badge variant="outline">{row.getValue("yearLevel")}</Badge>,
          size: 150, // Increase width
     },
     {
          accessorKey: "department",
          header: "Department",
          size: 250, // Increase width
     },
     {
          accessorKey: "status",
          header: "Status",
          cell: ({ row }) => {
               const status = row.getValue("status") as string;
               return (
                    <Badge variant={status === "active" ? "default" : "secondary"}>
                         {status}
                    </Badge>
               );
          },
     },
     {
          id: "actions",
          cell: ({ row }) => {
               const section = row.original;

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
                                   onClick={() => navigator.clipboard.writeText(section.id)}
                              >
                                   Copy ID
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                   <Edit2 className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                   <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                         </DropdownMenuContent>
                    </DropdownMenu>
               );
          },
     },
];
