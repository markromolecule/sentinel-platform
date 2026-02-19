"use client";

import { DataTable } from "@/components/ui/data-table/data-table";
import { columns } from "./columns";
import { useGradingList } from "../_hooks/use-grading-list";

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

