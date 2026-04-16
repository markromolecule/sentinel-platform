'use client';

import { useEffect } from 'react';
import { useWatch } from 'react-hook-form';
import { Alert, AlertDescription, Dialog, DialogContent, Form } from '@sentinel/ui';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEnrollSubjectMutation } from '@sentinel/hooks';
import type { SubjectOffering } from '@sentinel/shared/types';
import { createRequestOfferedSubjectBuilderFormValues } from '../_lib/request-offered-subject-builder-default-values';
import {
    requestOfferedSubjectBuilderFormSchema,
    type RequestOfferedSubjectBuilderFormValues,
} from '../_lib/request-offered-subject-builder-schema';
import { canSubmitGroupedRequest } from '../_lib/request-offered-subject-builder-helpers';
import { RequestOfferedSubjectBuilderFields } from './request-offered-subject-builder-fields';
import { RequestOfferedSubjectBuilderDialogHeader } from './builder-dialog-header';
import { RequestOfferedSubjectBuilderDialogFooter } from './builder-dialog-footer';
import { RequestOfferedSubjectBuilderPickerStep } from './builder-picker-step';

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
        mode === 'locked-offering' ? (offering?.id ?? '') : '',
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
            : (availableOfferings.find(
                  (currentOffering) => currentOffering.id === selectedOfferingId,
              ) ?? null);
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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[92vh] !animate-none overflow-y-auto !duration-0 sm:max-w-[1400px]">
                <RequestOfferedSubjectBuilderDialogHeader
                    mode={mode}
                    activeOffering={activeOffering}
                    onBack={() => form.setValue('subject_offering_id', '')}
                />

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {isLoadingOfferings ? (
                            <div className="border-border/60 bg-background flex h-[220px] items-center justify-center rounded-xl border">
                                <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
                            </div>
                        ) : mode === 'pick-offering' && !activeOffering ? (
                            <RequestOfferedSubjectBuilderPickerStep
                                form={form}
                                availableOfferings={availableOfferings}
                            />
                        ) : activeOffering ? (
                            <RequestOfferedSubjectBuilderFields
                                form={form}
                                offering={activeOffering}
                            />
                        ) : null}

                        {form.formState.errors.section_ids?.message ? (
                            <Alert variant="destructive">
                                <AlertDescription>
                                    {form.formState.errors.section_ids.message}
                                </AlertDescription>
                            </Alert>
                        ) : null}

                        <RequestOfferedSubjectBuilderDialogFooter
                            isSubmitting={enrollMutation.isPending}
                            canSubmit={canSubmit}
                            activeOfferingId={activeOffering?.id}
                            onClose={() => onOpenChange(false)}
                        />
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
