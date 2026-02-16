"use client";

import { GradingList } from "./_components/grading-list";

export default function GradingPage() {
     return (
          <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
               <div className="flex items-center justify-between space-y-2">
                    <div>
                         <h2 className="text-2xl font-bold tracking-tight">Grading</h2>
                         <p className="text-muted-foreground">
                              Manage and grade student assessments.
                         </p>
                    </div>
               </div>
               <GradingList />
          </div>
     );
}
