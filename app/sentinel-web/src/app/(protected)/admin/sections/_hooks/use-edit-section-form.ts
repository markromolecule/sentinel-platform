'use client';

import { useEffect } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { sectionSchema, type SectionFormValues } from '@sentinel/shared/schema';
import { Section } from '@sentinel/shared/types';
import { useUpdateSectionMutation } from '@/hooks/query/sections/use-update-section-mutation';

export function useEditSectionForm(section: Section, onSuccess: () => void) {
    const updateSection = useUpdateSectionMutation({
        onSuccess: () => {
            form.reset();
            onSuccess();
        },
    });

    // Form instance
    const form = useForm<SectionFormValues>({
        resolver: zodResolver(sectionSchema) as Resolver<SectionFormValues>,
        defaultValues: {
            name: section.name,
            departmentId: section.departmentId ?? undefined,
            courseId: section.courseId ?? undefined,
            yearLevel: section.yearLevel ?? undefined,
        },
    });

    // Reset when the section changes
    useEffect(() => {
        form.reset({
            name: section.name,
            departmentId: section.departmentId ?? undefined,
            courseId: section.courseId ?? undefined,
            yearLevel: section.yearLevel ?? undefined,
        });
    }, [section, form]);

    // Submit handler
    function onSubmit(values: SectionFormValues) {
        updateSection.mutate({ id: section.id, payload: values });
    }

    return {
        form,
        onSubmit,
        isPending: updateSection.isPending,
    };
}
