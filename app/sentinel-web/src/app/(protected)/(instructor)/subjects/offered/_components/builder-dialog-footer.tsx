'use client';

import { Button, DialogFooter } from '@sentinel/ui';

interface RequestOfferedSubjectBuilderDialogFooterProps {
    intent?: 'create' | 'edit';
    isSubmitting: boolean;
    canSubmit: boolean;
    activeOfferingId?: string | null;
    onClose: () => void;
}

export function RequestOfferedSubjectBuilderDialogFooter({
    intent = 'create',
    isSubmitting,
    canSubmit,
    activeOfferingId,
    onClose,
}: RequestOfferedSubjectBuilderDialogFooterProps) {
    const actionLabel =
        intent === 'edit'
            ? isSubmitting
                ? 'Saving Changes...'
                : 'Save Request Changes'
            : isSubmitting
              ? 'Submitting...'
              : 'Submit Request';

    return (
        <DialogFooter className="border-border/60 bg-background sticky bottom-0 gap-2 rounded-xl border px-4 py-3">
            <Button type="button" variant="outline" disabled={isSubmitting} onClick={onClose}>
                Close
            </Button>
            <Button
                type="submit"
                disabled={isSubmitting || !activeOfferingId || !canSubmit}
                className="bg-[#323d8f] text-white hover:bg-[#323d8f]/90"
            >
                {actionLabel}
            </Button>
        </DialogFooter>
    );
}
