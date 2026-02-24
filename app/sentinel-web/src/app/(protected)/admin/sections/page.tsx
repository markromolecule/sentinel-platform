"use client";

import { useSectionStore } from "@/stores/use-section-store";
import { SectionsList } from "@/app/(protected)/admin/sections/_components/sections-list";
import { AddSectionDialog } from "@/app/(protected)/admin/sections/_components/add-section-dialog";
import { PageHeader } from "@/components/common";

export default function AdminSectionsPage() {
     const sections = useSectionStore((state) => state.sections);

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

