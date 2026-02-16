"use client";

import { DataTable } from "@/components/ui/data-table/data-table";
import { columns } from "./columns";
import { MOCK_GRADING_EXAMS } from "../_constants";

export function GradingList() {
     return (
          <DataTable
               columns={columns}
               data={MOCK_GRADING_EXAMS}
               searchKey="title"
               searchPlaceholder="Filter exams..."
          />
     );
}
