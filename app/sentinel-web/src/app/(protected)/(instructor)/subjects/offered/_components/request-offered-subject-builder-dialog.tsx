'use client';

import {
    useEnrollSubjectMutation,
    useSubjectOfferingsQuery,
    useDebounce,
    useUpdateEnrollmentRequestMutation,
} from '@sentinel/hooks';
import { useState, useEffect, useMemo } from 'react';
import { useWatch, useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, AlertDescription, Dialog, DialogContent, Form } from '@sentinel/ui';
import type { SubjectOffering } from '@sentinel/shared/types';
import { buildEnrollmentRequestFormValues } from '@sentinel/shared';
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
type RequestOfferedSubjectBuilderDialogIntent = 'create' | 'edit';

interface RequestOfferedSubjectBuilderDialogProps {
    intent?: RequestOfferedSubjectBuilderDialogIntent;
    mode: RequestOfferedSubjectBuilderDialogMode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    offering?: SubjectOffering | null;
    initialValues?: Partial<RequestOfferedSubjectBuilderFormValues>;
    requestIds?: string[];
}

function createDefaultValues(
    mode: RequestOfferedSubjectBuilderDialogMode,
    offering?: SubjectOffering | null,
    initialValues?: Partial<RequestOfferedSubjectBuilderFormValues>,
) {
    return buildEnrollmentRequestFormValues({
        subjectOfferingId:
            initialValues?.subject_offering_id ??
            (mode === 'locked-offering' ? (offering?.id ?? '') : ''),
        departmentIds: initialValues?.department_ids,
        courseIds: initialValues?.course_ids,
        yearLevels: initialValues?.year_levels,
        sectionIds: initialValues?.section_ids,
    });
}

function isRequestableOffering(offering: SubjectOffering) {
    return (
        (offering.status === 'OPEN' || offering.status === 'DRAFT') &&
        ((offering.sections?.length ?? 0) > 0 || offering.sectionIds.length > 0)
    );
}

export function RequestOfferedSubjectBuilderDialog({
    intent = 'create',
    mode,
    open,
    onOpenChange,
    offering = null,
    initialValues,
    requestIds = [],
}: RequestOfferedSubjectBuilderDialogProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);

    const { data: offerings = [], isLoading: isLoadingOfferings } = useSubjectOfferingsQuery({
        enabled: open && mode === 'pick-offering',
        visibility: 'requestable',
        search: debouncedSearch,
    });

    const enrollMutation = useEnrollSubjectMutation();
    const updateMutation = useUpdateEnrollmentRequestMutation();
    const form = useForm<RequestOfferedSubjectBuilderFormValues>({
        resolver: zodResolver(
            requestOfferedSubjectBuilderFormSchema,
        ) as Resolver<RequestOfferedSubjectBuilderFormValues>,
        defaultValues: createDefaultValues(mode, offering, initialValues),
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

    const availableOfferings = useMemo(
        () => offerings.filter(isRequestableOffering),
        [offerings],
    );
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
        if (open) {
            form.reset(createDefaultValues(mode, offering, initialValues));
        }
    }, [open, mode, offering, initialValues, form]);

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

        form.reset(createDefaultValues(mode, undefined, initialValues));
    }, [availableOfferings, form, initialValues, mode, selectedOfferingId]);

    function onSubmit(values: RequestOfferedSubjectBuilderFormValues) {
        const resetForm = () => {
            form.reset(createDefaultValues(mode, offering, initialValues));
            onOpenChange(false);
        };

        if (intent === 'edit' && requestIds.length > 0) {
            updateMutation.mutate(
                {
                    request_ids: requestIds,
                    ...values,
                },
                {
                    onSuccess: () => {
                        resetForm();
                    },
                },
            );
            return;
        }

        enrollMutation.mutate(values, {
            onSuccess: () => {
                resetForm();
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[92vh] !animate-none overflow-y-auto !duration-0 sm:max-w-[1400px]">
                <RequestOfferedSubjectBuilderDialogHeader
                    intent={intent}
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
                                search={searchTerm}
                                onSearchChange={setSearchTerm}
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
                            intent={intent}
                            isSubmitting={enrollMutation.isPending || updateMutation.isPending}
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
