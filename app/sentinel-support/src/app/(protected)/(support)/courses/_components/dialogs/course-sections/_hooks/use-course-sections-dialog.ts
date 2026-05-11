import { zodResolver } from '@hookform/resolvers/zod';
import {
    useSectionsQuery,
    useCreateSectionsMutation,
    useDeleteSectionMutation,
} from '@sentinel/hooks';
import { Section } from '@sentinel/shared/types';
import { useForm, useFieldArray } from 'react-hook-form';
import { bulkSectionsSchema, type BulkSectionsFormValues } from '../_types';

interface UseCourseSectionsDialogArgs {
    courseId: string;
    institutionId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function useCourseSectionsDialog({
    courseId,
    institutionId,
    open,
    onOpenChange,
}: UseCourseSectionsDialogArgs) {
    const { data: sections = [], isLoading } = useSectionsQuery('', institutionId, courseId, open);

    const form = useForm<BulkSectionsFormValues>({
        resolver: zodResolver(bulkSectionsSchema),
        defaultValues: {
            sections: [{ name: '', year_level: undefined }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'sections',
    });

    const createSectionsMutation = useCreateSectionsMutation({
        onSuccess: () => {
            form.reset({
                sections: [{ name: '', year_level: undefined }],
            });
        },
    });

    const deleteSectionMutation = useDeleteSectionMutation();

    const onSubmit = (values: BulkSectionsFormValues) => {
        createSectionsMutation.mutate({
            payload: {
                institution_id: institutionId,
                course_id: courseId,
                sections: values.sections,
            },
        });
    };

    const handleClose = () => {
        form.reset();
        onOpenChange(false);
    };

    const handleDelete = (section: Section) => {
        if (window.confirm(`Delete ${section.name}?`)) {
            deleteSectionMutation.mutate({
                id: section.id,
                institutionId,
            });
        }
    };

    return {
        sections,
        isLoading,
        form,
        fields,
        append,
        remove,
        createSectionsMutation,
        onSubmit: form.handleSubmit(onSubmit),
        handleClose,
        handleDelete,
    };
}
