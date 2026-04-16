import { AddSubjectDialog } from '@/app/(protected)/(instructor)/subjects/_components/dialogs/add-subject-dialog';
import { EmptyState } from '@sentinel/ui';

export function SubjectsEmptyState() {
    return (
        <EmptyState
            icon="📚"
            title="No requested subjects yet"
            description="You have not requested or been assigned any offered subjects yet. Use the builder to submit your first grouped request."
            action={<AddSubjectDialog />}
            className="animate-in fade-in-50"
        />
    );
}
