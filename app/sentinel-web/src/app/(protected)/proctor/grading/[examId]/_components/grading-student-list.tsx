"use client";

import { DataTable } from "@/components/ui/data-table/data-table";
import { studentColumns } from "@/app/(protected)/proctor/grading/_components/student-columns";
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

