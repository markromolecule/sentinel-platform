'use client';

import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@sentinel/ui';

type PreviewField = {
    label: string;
    currentValue?: string | number | null;
    parentValue?: string | number | null;
};

type RevertPreviewDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    fields: PreviewField[];
    isPending?: boolean;
    onConfirm: () => void;
};

function formatValue(value: PreviewField['currentValue']) {
    if (value === null || value === undefined || value === '') {
        return '—';
    }

    return String(value);
}

export function RevertPreviewDialog({
    open,
    onOpenChange,
    title,
    description,
    fields,
    isPending = false,
    onConfirm,
}: RevertPreviewDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[640px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <div className="border-border overflow-hidden rounded-md border">
                    <div className="bg-muted/40 grid grid-cols-[140px_1fr_1fr] gap-3 px-4 py-2 text-sm font-medium">
                        <span>Field</span>
                        <span>Current override</span>
                        <span>Parent value</span>
                    </div>
                    {fields.map((field) => (
                        <div
                            key={field.label}
                            className="border-border grid grid-cols-[140px_1fr_1fr] gap-3 border-t px-4 py-3 text-sm"
                        >
                            <span className="text-muted-foreground">{field.label}</span>
                            <span>{formatValue(field.currentValue)}</span>
                            <span className="font-medium">{formatValue(field.parentValue)}</span>
                        </div>
                    ))}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        disabled={isPending}
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button disabled={isPending} onClick={onConfirm}>
                        {isPending ? 'Reverting...' : 'Revert to Parent'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
