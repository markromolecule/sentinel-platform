import { AddSubjectDialog } from "@/app/(protected)/(instructor)/subjects/_components/dialogs/add-subject-dialog";
import { EmptyState } from "@sentinel/ui";

export function SubjectsEmptyState() {
     return (
          <EmptyState
               icon="📚"
               title="No subjects added"
               description="You haven't added any subjects yet. Click the button above to add your first subject."
               action={<AddSubjectDialog />}
               className="animate-in fade-in-50"
          />
     );
}