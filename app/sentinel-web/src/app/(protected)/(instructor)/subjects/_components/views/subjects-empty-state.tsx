import { RequestSubjectDialog } from '@/app/(protected)/(instructor)/subjects/_components/dialogs/request-subject-dialog';
import { EmptyState } from '@sentinel/ui';

export function SubjectsEmptyState() {
    return (
        <EmptyState
            icon="📚"
            title="No requested courses yet"
            description="You have not requested or been assigned any offered courses yet. Use the builder to submit your first grouped request."
            action={<RequestSubjectDialog />}
            className="animate-in fade-in-50"
        />
    );
}
