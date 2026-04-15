'use client';

import { type MasterSubject } from '@sentinel/shared/types';
import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Form,
} from '@sentinel/ui';
import { SubjectOfferingFormFields } from '@/app/(protected)/subjects/_components/forms/subject-offering-form-fields';
import { useOfferSubjectForm } from '@/app/(protected)/subjects/_hooks/use-offer-subject-form';

interface OfferSubjectDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    subjectToOffer?: MasterSubject | null;
}

export function OfferSubjectDialog({
    open,
    onOpenChange,
    subjectToOffer = null,
}: OfferSubjectDialogProps) {
    const { form, onSubmit, isPending, reset } = useOfferSubjectForm(subjectToOffer, () =>
        onOpenChange(false),
    );

    function handleOpenChange(nextOpen: boolean) {
        onOpenChange(nextOpen);

        if (!nextOpen) {
            reset();
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent
                className="border-border/70 flex h-[90vh] max-h-[920px] min-h-[600px] w-full max-w-[calc(100vw-2rem)] flex-col overflow-hidden p-0 2xl:w-[1480px] 2xl:max-w-none"
                overlayClassName="data-[state=open]:animate-none data-[state=closed]:animate-none"
            >
                <DialogHeader className="border-border/70 bg-muted/15 border-b px-5 pt-5 pb-4 shrink-0">
                    <div className="space-y-1">
                        <p className="text-muted-foreground text-[10px] font-bold tracking-[0.05em] uppercase">Subject Offering</p>
                        <DialogTitle className="text-xl font-bold">Offer Subject</DialogTitle>
                    </div>
                    <DialogDescription className="max-w-3xl text-sm leading-5">
                        {subjectToOffer
                            ? `Create a term-based offering for "${subjectToOffer.code} - ${subjectToOffer.title}".`
                            : 'Choose a catalog subject, assign it to a term, and define who receives it.'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex min-h-0 flex-1 flex-col"
                    >
                        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 [scrollbar-gutter:stable]">
                            <SubjectOfferingFormFields
                                form={form}
                                isPending={isPending}
                                subjectToOffer={subjectToOffer}
                            />
                        </div>

                        <DialogFooter className="border-border/70 bg-muted/10 border-t px-5 py-3 sm:justify-end">
                            <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row sm:items-center">
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={isPending}
                                    onClick={() => handleOpenChange(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isPending}
                                    className="bg-[#323d8f] hover:bg-[#323d8f]/90"
                                >
                                    {isPending ? 'Creating...' : 'Create Offering'}
                                </Button>
                            </div>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
