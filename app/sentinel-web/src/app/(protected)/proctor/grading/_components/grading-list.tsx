"use client";

import { DataTable } from "@sentinel/ui";
import { columns } from "@/app/(protected)/proctor/grading/_components/columns";
import { useGradingList } from "@/app/(protected)/proctor/grading/_hooks/use-grading-list";

export function GradingList() {
     const { exams } = useGradingList();

     return (
          <DataTable
               columns={columns}
               data={exams}
               searchKey="title"
               searchPlaceholder="Filter exams..."
          />
     );
}

