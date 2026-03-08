"use client";

import { SectionsList } from "@/app/(protected)/admin/sections/_components/sections-list";
import { AddSectionDialog } from "@/app/(protected)/admin/sections/_components/add-section-dialog";
import { PageHeader } from "@/components/common";
import { useSectionsQuery } from "@/hooks/query/sections/use-sections-query";

export default function AdminSectionsPage() {
     const { data: sections = [], isLoading, isError } = useSectionsQuery();


     if (isLoading) {
          return (
               <div className="flex flex-col gap-6 md:p-6 p-4">
                    <PageHeader title="Section Management" description="Manage academic sections and assign them to courses." />
                    <div className="flex h-48 items-center justify-center">
                         <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    </div>
               </div>
          );
     }

     if (isError) {
          return (
               <div className="flex flex-col gap-6 md:p-6 p-4">
                    <PageHeader title="Section Management" description="Manage academic sections and assign them to courses." />
                    <div className="flex h-48 items-center justify-center text-destructive">
                         Error loading Sections. Please try again.
                    </div>
               </div>
          );
     }

     return (
          <div className="flex flex-col gap-6 md:p-6 p-4">
               <PageHeader
                    title="Section Management"
                    description="Manage academic sections and assign them to courses."
               >
                    <AddSectionDialog />
               </PageHeader>

               <SectionsList sections={sections} />
          </div>
     );
}

