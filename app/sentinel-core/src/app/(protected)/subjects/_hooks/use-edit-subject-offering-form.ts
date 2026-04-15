'use client';

import { useUpdateSubjectOfferingMutation } from '@sentinel/hooks';
import { useEffect } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { subjectOfferingFormSchema, type SubjectOfferingFormValues } from '@sentinel/shared/schema';
import { type SubjectOffering } from '@sentinel/shared/types';
import {
    EMPTY_SUBJECT_OFFERING_FORM_VALUES,
} from '@/app/(protected)/subjects/_hooks/subject-offering-form-values';

export function useEditSubjectOfferingForm(offering: SubjectOffering | null, onSuccess: () => void) {
    const form = useForm<SubjectOfferingFormValues>({
        resolver: zodResolver(subjectOfferingFormSchema) as Resolver<SubjectOfferingFormValues>,
        defaultValues: offering ? {
            subject_id: offering.subjectId,
            term_id: offering.termId,
            department_ids: offering.departmentIds,
            course_ids: offering.courseIds,
            section_ids: offering.sectionIds,
            year_levels: offering.yearLevels,
        } : EMPTY_SUBJECT_OFFERING_FORM_VALUES,
    });

    const updateSubjectOffering = useUpdateSubjectOfferingMutation({
        onSuccess: () => {
            onSuccess();
        },
    });

    useEffect(() => {
        if (offering) {
            form.reset({
                subject_id: offering.subjectId,
                term_id: offering.termId,
                department_ids: offering.departmentIds,
                course_ids: offering.courseIds,
                section_ids: offering.sectionIds,
                year_levels: offering.yearLevels,
            });
        }
    }, [form, offering]);

    function onSubmit(values: SubjectOfferingFormValues) {
        if (!offering) return;

        const normalizedValues: SubjectOfferingFormValues = {
            subject_id: values.subject_id,
            term_id: values.term_id,
            department_ids: Array.from(new Set(values.department_ids)),
            course_ids: Array.from(new Set(values.course_ids)),
            section_ids: Array.from(new Set(values.section_ids)),
            year_levels: Array.from(new Set(values.year_levels)).sort(
                (left, right) => left - right,
            ),
        };

        updateSubjectOffering.mutate({
            id: offering.id,
            payload: normalizedValues,
        });
    }

    function reset() {
        if (offering) {
            form.reset({
                subject_id: offering.subjectId,
                term_id: offering.termId,
                department_ids: offering.departmentIds,
                course_ids: offering.courseIds,
                section_ids: offering.sectionIds,
                year_levels: offering.yearLevels,
            });
        } else {
            form.reset(EMPTY_SUBJECT_OFFERING_FORM_VALUES);
        }
    }

    return {
        form,
        onSubmit,
        isPending: updateSubjectOffering.isPending,
        reset,
    };
}
