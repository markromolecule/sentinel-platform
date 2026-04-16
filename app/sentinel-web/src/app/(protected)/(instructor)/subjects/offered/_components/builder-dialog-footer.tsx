'use client';

import { Button, DialogFooter } from '@sentinel/ui';

interface RequestOfferedSubjectBuilderDialogFooterProps {
    isSubmitting: boolean;
    canSubmit: boolean;
    activeOfferingId?: string | null;
    onClose: () => void;
}

export function RequestOfferedSubjectBuilderDialogFooter({
    isSubmitting,
    canSubmit,
    activeOfferingId,
    onClose,
}: RequestOfferedSubjectBuilderDialogFooterProps) {
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
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
        </DialogFooter>
    );
}
