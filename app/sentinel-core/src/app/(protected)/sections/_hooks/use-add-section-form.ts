'use client';

import { useCreateSectionMutation } from '@/data';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { sectionSchema, type SectionFormValues } from '@sentinel/shared/schema';

export function useAddSectionForm(onSuccess: () => void) {
    const createSection = useCreateSectionMutation({
        onSuccess: () => {
            form.reset();
            onSuccess();
        },
    });

    const form = useForm<SectionFormValues>({
        resolver: zodResolver(sectionSchema) as Resolver<SectionFormValues>,
        defaultValues: {
            name: '',
            department_id: '',
            course_id: '',
            year_level: undefined,
        },
    });

    function onSubmit(values: SectionFormValues) {
        createSection.mutate(values);
    }

    return {
        form,
        onSubmit,
        isPending: createSection.isPending,
    };
}
