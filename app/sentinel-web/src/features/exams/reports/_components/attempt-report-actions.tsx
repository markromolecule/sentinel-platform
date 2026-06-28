import { Button, Badge } from '@sentinel/ui';

type AttemptReportActionsProps = {
    editable: boolean;
    hasSubmitHandler: boolean;
    isSubmitting: boolean;
    onSaveOverrides: () => void;
    onSaveAndFinalize: () => void;
    isFinalized?: boolean;
};

export function AttemptReportActions({
    editable,
    hasSubmitHandler,
    isSubmitting,
    onSaveOverrides,
    onSaveAndFinalize,
    isFinalized = false,
}: AttemptReportActionsProps) {
    if (!editable || !hasSubmitHandler) {
        return null;
    }

    if (isFinalized) {
        return (
            <div className="flex items-center gap-2.5">
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 py-1 px-2.5 font-semibold text-xs">
                    Report Finalized
                </Badge>
                <span className="text-xs text-muted-foreground">
                    This attempt report is locked and cannot be edited.
                </span>
            </div>
        );
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
