"use client";

import { DataTable } from "@/components/ui/data-table/data-table";
import { type Section } from '@sentinel/shared/types';
import { columns } from "./columns";
import { useDepartmentsQuery } from "@/hooks/query/departments/use-departments-query";

interface SectionsListProps {
     sections: Section[];
}

export function SectionsList({ sections }: SectionsListProps) {
     const { data: departments = [] } = useDepartmentsQuery();

     const facets = [
          {
               columnKey: "departmentId",
               title: "Department",
               options: departments.map(dept => ({
                    label: dept.code || dept.name,
                    value: dept.id
               }))
          },
          {
               columnKey: "yearLevel",
               title: "Year Level",
               options: [
                    { label: "1", value: "1" },
                    { label: "2", value: "2" },
                    { label: "3", value: "3" },
                    { label: "4", value: "4" },
                    { label: "5", value: "5" },
               ]
          },
     ];

     return (
          <DataTable
               columns={columns}
               data={sections}
               searchKey="name"
               searchPlaceholder="Search sections..."
               facets={facets}
          />
     );
}
