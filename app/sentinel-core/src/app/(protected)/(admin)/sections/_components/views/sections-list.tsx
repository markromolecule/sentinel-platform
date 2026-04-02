"use client";

import { useCoursesQuery, useDepartmentsQuery } from "@sentinel/hooks";
import { DataTable } from "@sentinel/ui";
import { type Section } from '@sentinel/shared/types';
import { columns } from "@/app/(protected)/(admin)/sections/_components/tables/columns";
import { SectionsEmptyState } from "./sections-empty-state";
import { buildSectionsFacets } from "./sections-facets";

interface SectionsListProps {
    sections: Section[];
    searchTerm?: string;
    onSearchChange?: (value: string) => void;
    isLoading?: boolean;
}

export function SectionsList({
     sections,
     searchTerm,
     onSearchChange,
     isLoading = false,
}: SectionsListProps) {
     const { data: departments = [] } = useDepartmentsQuery();
     const { data: courses = [] } = useCoursesQuery();

     const facets = buildSectionsFacets({ departments, courses });

     return (
          <DataTable
               columns={columns}
               data={sections}
               searchValue={searchTerm}
               onSearchChange={onSearchChange}
               searchPlaceholder="Search sections..."
               facets={facets}
               isLoading={isLoading}
               emptyContent={<SectionsEmptyState searchTerm={searchTerm} />}
          />
     );
}
