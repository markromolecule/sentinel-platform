"use client";

import { useSectionStore } from "@/stores/use-section-store";
import { SectionsList } from "./_components/sections-list";
import { AddSectionDialog } from "./_components/add-section-dialog";

export default function AdminSectionsPage() {
     const sections = useSectionStore((state) => state.sections);

     return (
          <div className="flex flex-col gap-6 md:p-6 p-4">
               <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                         <h1 className="text-2xl font-bold tracking-tight">Section Management</h1>
                         <p className="text-muted-foreground">
                              Manage academic sections and assign them to courses.
                         </p>
                    </div>
                    <AddSectionDialog />
               </div>

               <SectionsList sections={sections} />
          </div>
     );
}
