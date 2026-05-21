'use client';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@sentinel/ui';

interface DeleteEventConfirmDialogProps {
    /** Whether the confirmation dialog is open. */
    open: boolean;
    /** Callback to control the open state. */
    onOpenChange: (open: boolean) => void;
    /** Title of the event to be deleted — shown in the description. */
    eventTitle: string;
    /** Called when the user confirms deletion. */
    onConfirm: () => void;
    /** When true, the confirm button shows a loading label. */
    isDeleting?: boolean;
}

/**
 * A confirmation alert dialog shown before a calendar event is deleted.
 * Prevents accidental removal by requiring explicit user consent.
 */
export function DeleteEventConfirmDialog({
    open,
    onOpenChange,
    eventTitle,
    onConfirm,
    isDeleting = false,
}: DeleteEventConfirmDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Event</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete &ldquo;{eventTitle}&rdquo;? This action
                        cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
