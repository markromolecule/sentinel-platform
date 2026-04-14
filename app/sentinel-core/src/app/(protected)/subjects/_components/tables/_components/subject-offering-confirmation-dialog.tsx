'use client';

import { Button } from '@sentinel/ui';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="animate-none transition-none duration-0 data-[state=closed]:animate-none data-[state=open]:animate-none">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={cancelDisabled}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant={confirmVariant}
                        onClick={onConfirm}
                        disabled={confirmDisabled}
                        className={confirmClassName}
                    >
                        {confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
