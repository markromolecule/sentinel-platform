'use client';

import { useEffect } from 'react';
import { useWatch } from 'react-hook-form';
import {
    Alert,
    AlertDescription,
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@sentinel/ui';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEnrollSubjectMutation } from '@sentinel/hooks';
import type { SubjectOffering } from '@sentinel/shared/types';
import { SubjectSelector } from '@/app/(protected)/(instructor)/subjects/_components/forms/subject-selector';
import { createRequestOfferedSubjectBuilderFormValues } from '../_lib/request-offered-subject-builder-default-values';
import {
    requestOfferedSubjectBuilderFormSchema,
    type RequestOfferedSubjectBuilderFormValues,
} from '../_lib/request-offered-subject-builder-schema';
import { canSubmitGroupedRequest } from '../_lib/request-offered-subject-builder-helpers';
import { RequestOfferedSubjectBuilderFields } from './request-offered-subject-builder-fields';

type RequestOfferedSubjectBuilderDialogMode = 'locked-offering' | 'pick-offering';

interface RequestOfferedSubjectBuilderDialogProps {
    mode: RequestOfferedSubjectBuilderDialogMode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    offering?: SubjectOffering | null;
    offerings?: SubjectOffering[];
    isLoadingOfferings?: boolean;
}

function createDefaultValues(
    mode: RequestOfferedSubjectBuilderDialogMode,
    offering?: SubjectOffering | null,
) {
    return createRequestOfferedSubjectBuilderFormValues(
        mode === 'locked-offering' ? offering?.id ?? '' : '',
    );
}

function isRequestableOffering(offering: SubjectOffering) {
    return (
        (offering.status === 'OPEN' || offering.status === 'DRAFT') &&
        ((offering.sections?.length ?? 0) > 0 || offering.sectionIds.length > 0)
    );
}

export function RequestOfferedSubjectBuilderDialog({
    mode,
    open,
    onOpenChange,
    offering = null,
    offerings = [],
    isLoadingOfferings = false,
}: RequestOfferedSubjectBuilderDialogProps) {
    const enrollMutation = useEnrollSubjectMutation();
    const form = useForm<RequestOfferedSubjectBuilderFormValues>({
        resolver: zodResolver(
            requestOfferedSubjectBuilderFormSchema,
        ) as Resolver<RequestOfferedSubjectBuilderFormValues>,
        defaultValues: createDefaultValues(mode, offering),
        mode: 'onChange',
    });

    const selectedOfferingId = useWatch({
        control: form.control,
        name: 'subject_offering_id',
    });
    const selectedDepartmentIds = useWatch({ control: form.control, name: 'department_ids' }) ?? [];
    const selectedCourseIds = useWatch({ control: form.control, name: 'course_ids' }) ?? [];
    const selectedYearLevels = useWatch({ control: form.control, name: 'year_levels' }) ?? [];
    const selectedSectionIds = useWatch({ control: form.control, name: 'section_ids' }) ?? [];

    const availableOfferings = offerings.filter(isRequestableOffering);
    const activeOffering =
        mode === 'locked-offering'
            ? offering
            : availableOfferings.find((currentOffering) => currentOffering.id === selectedOfferingId) ??
              null;
    const canSubmit = canSubmitGroupedRequest({
        departmentIds: selectedDepartmentIds,
        courseIds: selectedCourseIds,
        yearLevels: selectedYearLevels,
        sectionIds: selectedSectionIds,
    });

    useEffect(() => {
        if (!open) {
            return;
        }

        form.reset(createDefaultValues(mode, offering));
    }, [form, mode, offering, open]);

    useEffect(() => {
        if (mode !== 'pick-offering' || !selectedOfferingId) {
            return;
        }

        const isStillAvailable = availableOfferings.some(
            (currentOffering) => currentOffering.id === selectedOfferingId,
        );

        if (isStillAvailable) {
            return;
        }

        form.reset(createDefaultValues(mode));
    }, [availableOfferings, form, mode, selectedOfferingId]);

    function onSubmit(values: RequestOfferedSubjectBuilderFormValues) {
        enrollMutation.mutate(values, {
            onSuccess: () => {
                form.reset(createDefaultValues(mode, offering));
                onOpenChange(false);
            },
        });
    }

    const title =
        mode === 'locked-offering' ? 'Request Offered Subject' : 'Request Offered Subject';
    const description =
        mode === 'locked-offering' && activeOffering
            ? `Select the department, course, year level, or section codes you want to request for ${activeOffering.subjectCode}.`
            : 'Choose an offered subject, then select the department, course, year level, or section codes you need.';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[92vh] !animate-none overflow-y-auto !duration-0 sm:max-w-[1160px]">
                <DialogHeader className="mb-2">
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {mode === 'pick-offering' ? (
                            <div className="border-border/60 bg-background rounded-xl border p-4">
                                <FormField
                                    control={form.control}
                                    name="subject_offering_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Offered Subject</FormLabel>
                                            <FormControl>
                                                <SubjectSelector
                                                    subjects={availableOfferings}
                                                    selectedSubjectOfferingId={field.value}
                                                    onSelect={(value) => {
                                                        form.reset(
                                                            createRequestOfferedSubjectBuilderFormValues(
                                                                value,
                                                            ),
                                                        );
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        ) : null}

                        {isLoadingOfferings ? (
                            <div className="border-border/60 bg-background flex h-[220px] items-center justify-center rounded-xl border">
                                <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
                            </div>
                        ) : mode === 'pick-offering' && availableOfferings.length === 0 ? (
                            <div className="border-border/60 bg-muted/10 rounded-xl border p-8 text-center">
                                <p className="text-foreground text-sm font-semibold">
                                    No requestable offered subjects found
                                </p>
                                <p className="text-muted-foreground mt-2 text-sm leading-6">
                                    Open or draft offerings with available sections will appear here
                                    when they are ready for instructor requests.
                                </p>
                            </div>
                        ) : activeOffering ? (
                            <RequestOfferedSubjectBuilderFields
                                form={form}
                                offering={activeOffering}
                            />
                        ) : (
                            <div className="border-border/60 bg-muted/10 rounded-xl border p-8 text-center">
                                <p className="text-foreground text-sm font-semibold">
                                    Select an offered subject to continue
                                </p>
                                <p className="text-muted-foreground mt-2 text-sm leading-6">
                                    The selection panels will appear here after you choose one.
                                </p>
                            </div>
                        )}

                        {form.formState.errors.section_ids?.message ? (
                            <Alert variant="destructive">
                                <AlertDescription>
                                    {form.formState.errors.section_ids.message}
                                </AlertDescription>
                            </Alert>
                        ) : null}

                        <DialogFooter className="border-border/60 bg-background sticky bottom-0 gap-2 rounded-xl border px-4 py-3">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={enrollMutation.isPending}
                                onClick={() => onOpenChange(false)}
                            >
                                Close
                            </Button>
                            <Button
                                type="submit"
                                disabled={
                                    enrollMutation.isPending || !activeOffering?.id || !canSubmit
                                }
                                className="bg-[#323d8f] text-white hover:bg-[#323d8f]/90"
                            >
                                {enrollMutation.isPending ? 'Submitting...' : 'Submit Request'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
