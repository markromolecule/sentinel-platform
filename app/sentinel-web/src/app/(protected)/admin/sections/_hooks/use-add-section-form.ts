'use client';

import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { sectionSchema, type SectionFormValues } from '@sentinel/shared/schema';
import { useCreateSectionMutation } from '@/hooks/query/sections/use-create-section-mutation';

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
            departmentId: '',
            courseId: '',
            yearLevel: undefined,
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
