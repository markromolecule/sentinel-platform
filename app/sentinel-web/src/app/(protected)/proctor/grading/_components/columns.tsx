"use client";

import { ColumnDef } from "@tanstack/react-table";
import { GradingExam } from "../_types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import {
     DropdownMenu,
     DropdownMenuContent,
     DropdownMenuItem,
     DropdownMenuLabel,
     DropdownMenuSeparator,
     DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const columns: ColumnDef<GradingExam>[] = [
     {
          accessorKey: "title",
          header: "Exam Title",
          cell: ({ row }) => <div className="font-medium">{row.getValue("title")}</div>,
     },
     {
          accessorKey: "subject",
          header: "Subject",
     },
     {
          accessorKey: "date",
          header: "Date",
          cell: ({ row }) => {
               const date = new Date(row.getValue("date"));
               return <div>{date.toLocaleDateString()}</div>;
          },
     },
     {
          accessorKey: "progress",
          header: "Progress",
          cell: ({ row }) => {
               const total = row.original.totalStudents;
               const graded = row.original.gradedCount;
               const percentage = Math.round((graded / total) * 100);
               return (
                    <div className="flex items-center gap-2">
                         <div className="w-full bg-secondary h-2 rounded-full overflow-hidden max-w-[100px]">
                              <div
                                   className="bg-primary h-full"
                                   style={{ width: `${percentage}%` }}
                              />
                         </div>
                         <span className="text-xs text-muted-foreground">
                              {graded}/{total}
                         </span>
                    </div>
               );
          },
     },
     {
          accessorKey: "status",
          header: "Status",
          cell: ({ row }) => {
               const status = row.getValue("status") as string;
               return (
                    <Badge
                         variant={
                              status === "COMPLETED"
                                   ? "default" // or success if available, defaulting to default (usually primary color)
                                   : status === "IN_PROGRESS"
                                        ? "secondary" // secondary often yellow/orange/blue depending on theme
                                        : "outline"
                         }
                    >
                         {status.replace("_", " ")}
                    </Badge>
               );
          },
     },
     {
          id: "actions",
          cell: ({ row }) => {
               const exam = row.original;

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
                              <DropdownMenuItem asChild>
                                   <Link href={`/proctor/grading/${exam.id}`}>
                                        Grade Exam
                                   </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                         </DropdownMenuContent>
                    </DropdownMenu>
               );
          },
     },
];
