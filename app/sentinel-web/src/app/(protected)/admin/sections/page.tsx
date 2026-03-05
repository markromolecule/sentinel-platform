"use client";

import { SectionsList } from "@/app/(protected)/admin/sections/_components/sections-list";
import { AddSectionDialog } from "@/app/(protected)/admin/sections/_components/add-section-dialog";
import { PageHeader } from "@/components/common";
import { useSectionsQuery } from "@/hooks/query/sections/use-sections-query";
import { MOCK_SECTIONS_LOCAL } from "@sentinel/shared/constants";

export default function AdminSectionsPage() {
     const { data: apiSections = [], isLoading, isError, error } = useSectionsQuery();

     // Fallback to mock data if empty or API fails
     const sections = (isError || (!isLoading && apiSections.length === 0)) ? MOCK_SECTIONS_LOCAL : apiSections;

     if (isLoading) {
          return <div className="p-8">Loading sections...</div>;
     }

     return (
          <div className="flex flex-col gap-6 md:p-6 p-4">
               <PageHeader
                    title="Section Management"
                    description="Manage academic sections and assign them to courses."
               >
                    <AddSectionDialog />
               </PageHeader>

               {isError && (
                    <div className="bg-red-50 text-red-500 p-4 rounded-md text-sm">
                         Failed to load sections from database: {error?.message}. Displaying mock data.
                    </div>
               )}

               <SectionsList sections={sections} />
          </div>
     );
}

