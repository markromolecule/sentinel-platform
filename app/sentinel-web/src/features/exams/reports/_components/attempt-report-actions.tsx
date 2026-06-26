import { Button } from '@sentinel/ui';

type AttemptReportActionsProps = {
    editable: boolean;
    hasSubmitHandler: boolean;
    isSubmitting: boolean;
    onSaveOverrides: () => void;
    onSaveAndFinalize: () => void;
};

export function AttemptReportActions({
    editable,
    hasSubmitHandler,
    isSubmitting,
    onSaveOverrides,
    onSaveAndFinalize,
}: AttemptReportActionsProps) {
    if (!editable || !hasSubmitHandler) {
        return null;
    }

    return (
        <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" onClick={onSaveOverrides} disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Overrides'}
            </Button>
            <Button onClick={onSaveAndFinalize} disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save & Finalize Report'}
            </Button>
        </div>
    );
}
