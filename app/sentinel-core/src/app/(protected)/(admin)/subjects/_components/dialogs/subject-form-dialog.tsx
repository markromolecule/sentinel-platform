'use client';

import { ReactNode } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { type SubjectFormValues } from '@sentinel/shared/schema';
import { SubjectFormFields } from '@/app/(protected)/(admin)/subjects/_components/forms/subject-form-fields';
import { Button } from '@sentinel/ui';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@sentinel/ui';
import { Form } from '@sentinel/ui';

interface SubjectFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    form: UseFormReturn<SubjectFormValues>;
    onSubmit: (values: SubjectFormValues) => void;
    isPending: boolean;
    title: string;
    description: string;
    submitLabel: string;
    submittingLabel: string;
    trigger?: ReactNode;
    showCancelButton?: boolean;
    formVariant?: 'default' | 'compact';
    eyebrow?: string;
}

export function SubjectFormDialog({
    open,
    onOpenChange,
    form,
    onSubmit,
    isPending,
    title,
    description,
    submitLabel,
    submittingLabel,
    trigger,
    showCancelButton = false,
    formVariant = 'default',
    eyebrow,
}: SubjectFormDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

            <DialogContent
                className="border-border/70 max-w-[calc(100vw-2rem)] overflow-hidden p-0 data-[state=closed]:animate-none data-[state=open]:animate-none sm:max-w-[720px]"
                overlayClassName="data-[state=open]:animate-none data-[state=closed]:animate-none"
            >
                <DialogHeader className="border-border/70 bg-background/95 border-b px-5 py-5">
                    <div className="space-y-1.5">
                        {eyebrow && (
                            <p className="text-muted-foreground text-xs font-semibold tracking-[0.18em] uppercase">
                                {eyebrow}
                            </p>
                        )}
                        <DialogTitle className="text-xl">{title}</DialogTitle>
                    </div>
                    <DialogDescription className="text-sm leading-5">
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
                        <div className={formVariant === 'compact' ? 'px-5 pt-3 pb-5' : 'px-5 py-5'}>
                            <SubjectFormFields form={form} variant={formVariant} />
                        </div>
                        <DialogFooter className="border-border/70 bg-muted/10 border-t px-5 py-3 sm:justify-end">
                            <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row sm:items-center">
                                {showCancelButton && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={isPending}
                                        onClick={() => onOpenChange(false)}
                                    >
                                        Cancel
                                    </Button>
                                )}
                                <Button
                                    type="submit"
                                    disabled={isPending}
                                    className="bg-[#323d8f] hover:bg-[#323d8f]/90"
                                >
                                    {isPending ? submittingLabel : submitLabel}
                                </Button>
                            </div>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
