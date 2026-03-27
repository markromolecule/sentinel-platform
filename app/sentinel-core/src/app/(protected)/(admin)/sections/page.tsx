"use client";

import { useState } from "react";
import { useDebounce } from "@sentinel/hooks";
import { SectionsList } from "@/app/(protected)/(admin)/sections/_components/sections-list";
import { AddSectionDialog } from "@/app/(protected)/(admin)/sections/_components/add-section-dialog";
import { PageHeader, Separator } from "@sentinel/ui";
import { useSectionsQuery } from "@/hooks/query/sections/use-sections-query";

export default function AdminSectionsPage() {
     const [searchTerm, setSearchTerm] = useState("");
     const debouncedSearch = useDebounce(searchTerm, 500);

     const { data: sections = [], isLoading, isError } = useSectionsQuery(debouncedSearch);



     return (
          <div className="flex flex-col gap-6 md:p-6 p-4">
               <PageHeader
                    title="Section Management"
                    description="Manage academic sections and assign them to courses."
               >
                    <AddSectionDialog />
               </PageHeader>
               <Separator />

               <div className="relative">
                    {/* Always render SectionsList to keep search bar mounted and focused */}
                    <SectionsList 
                         sections={sections} 
                         searchTerm={searchTerm}
                         onSearchChange={setSearchTerm}
                    />

                    {/* Subtle loading overlay only for initial empty state */}
                    {isLoading && sections.length === 0 && (
                         <div className="absolute inset-x-0 bottom-0 top-[60px] flex items-center justify-center bg-background/50 backdrop-blur-sm z-10 rounded-md">
                              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                         </div>
                    )}

                    {isError && (
                         <div className="mt-4 flex h-32 items-center justify-center text-destructive bg-destructive/5 rounded-md border border-destructive/20">
                              Error loading sections. Please try again.
                         </div>
                    )}
               </div>
          </div>
     );
}
