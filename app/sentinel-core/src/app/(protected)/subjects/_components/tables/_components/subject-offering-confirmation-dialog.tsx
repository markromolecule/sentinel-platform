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

export interface SubjectOfferingConfirmationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    cancelDisabled?: boolean;
    confirmDisabled?: boolean;
    confirmLabel: string;
    confirmVariant?: 'default' | 'outline' | 'destructive';
    confirmClassName?: string;
    onConfirm: () => void;
}

export function SubjectOfferingConfirmationDialog({
    open,
    onOpenChange,
    title,
    description,
    cancelDisabled = false,
    confirmDisabled = false,
    confirmLabel,
    confirmVariant = 'default',
    confirmClassName,
    onConfirm,
}: SubjectOfferingConfirmationDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={cancelDisabled}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        variant={confirmVariant}
                        disabled={confirmDisabled}
                        className={confirmClassName}
                        onClick={(event) => {
                            event.preventDefault();
                            onConfirm();
                        }}
                    >
                        {confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
