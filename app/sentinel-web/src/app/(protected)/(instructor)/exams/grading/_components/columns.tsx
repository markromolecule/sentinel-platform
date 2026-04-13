"use client";

import { ColumnDef } from "@tanstack/react-table";
import { GradingExam } from '@sentinel/shared/types';;
import { StatusBadge } from "@/components/common/displays/status-badge";
import { Button } from "@sentinel/ui";
import Link from "next/link";
import { Eye } from "lucide-react";

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
                    <StatusBadge status={status} />
               );
          },
     },
     {
          id: "actions",
          cell: ({ row }) => {
               const exam = row.original;

               return (
                    <div className="flex justify-end pr-4">
                         <Button asChild variant="ghost" size="sm" className="h-8 gap-2">
                              <Link href={`/exams/grading/${exam.id}`}>
                                   <Eye className="h-4 w-4" />
                                   View Grades
                              </Link>
                         </Button>
                    </div>
               );
          },
     },
];
