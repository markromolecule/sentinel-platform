"use client";

import { GradingList } from "@/app/(protected)/(proctor)/grading/_components/grading-list";
import { PageHeader } from "@/components/common/page-header";

export default function GradingPage() {
     return (
          <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
               <PageHeader
                    title="Grading"
                    description="Manage and grade student assessments."
                    className="px-0"
               />
               <GradingList />
          </div>
     );
}
