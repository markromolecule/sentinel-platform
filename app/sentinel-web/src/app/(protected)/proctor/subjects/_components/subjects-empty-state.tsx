import { AddSubjectDialog } from "./add-subject-dialog";

export function SubjectsEmptyState() {
     return (
          <div className="flex h-[400px] flex-col items-center justify-center rounded-lg border border-dashed bg-muted/40 p-8 text-center animate-in fade-in-50">
               <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                    <span className="text-4xl">📚</span>
               </div>
               <h3 className="mt-4 text-lg font-semibold">No subjects added</h3>
               <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-sm">
                    You haven&apos;t added any subjects yet. Click the button above to add your first subject.
               </p>
               <AddSubjectDialog />
          </div>
     );
}
