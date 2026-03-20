"use client";

import { DataTable } from "@sentinel/ui";
import { studentColumns } from "@/app/(protected)/(instructor)/exams/grading/_components/student-columns";
import { GradingStudent } from "@sentinel/shared/types";

interface GradingStudentListProps {
     data: GradingStudent[];
}

export function GradingStudentList({ data }: GradingStudentListProps) {
     return (
          <DataTable
               columns={studentColumns}
               data={data}
               searchKey="name"
               searchPlaceholder="Filter students..."
          />
     );
}

