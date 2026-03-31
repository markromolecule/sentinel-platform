import { AddSubjectDialog } from "@/app/(protected)/(instructor)/subjects/_components/dialogs/add-subject-dialog";
import { EmptyState } from "@sentinel/ui";

export function SubjectsEmptyState() {
     return (
          <EmptyState
               icon="📚"
               title="No offered subjects yet"
               description="You haven't requested any offered subjects yet. Use the button above to submit your first assignment request."
               action={<AddSubjectDialog />}
               className="animate-in fade-in-50"
          />
     );
}
