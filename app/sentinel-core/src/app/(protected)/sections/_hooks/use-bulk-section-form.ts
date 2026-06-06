'use client';

import { useMemo, useState } from 'react';
import { useCreateSectionsMutation } from '@sentinel/hooks';
import { parseSectionManualText } from '../_utils';
import { toast } from 'sonner';

/**
 * Custom hook to manage the bulk section upload form state and submission.
 * It handles input changes, manual text parsing, and calls the bulk creation mutation.
 *
 * @param institutionId - The institution ID resolved from active academic scope
 * @param onSuccess - Callback fired on successful bulk section creation
 */
export function useBulkSectionForm(institutionId: string, onSuccess: () => void) {
    const [departmentId, setDepartmentId] = useState<string | null>(null);
    const [courseId, setCourseId] = useState<string | null>(null);
    const [input, setInput] = useState('');

    const preview = useMemo(() => parseSectionManualText(input), [input]);

    const bulkCreate = useCreateSectionsMutation({
        onSuccess: () => {
            setInput('');
            onSuccess();
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to bulk create sections');
        },
    });

    const onSubmit = () => {
        if (!institutionId) {
            toast.error('Institution ID is missing');
            return;
        }

        if (preview.rows.length === 0) {
            toast.error('No valid sections to create');
            return;
        }

        bulkCreate.mutate({
            payload: {
                institution_id: institutionId,
                department_id: departmentId,
                course_id: courseId,
                sections: preview.rows,
            },
        });
    };

    return {
        departmentId,
        setDepartmentId,
        courseId,
        setCourseId,
        input,
        setInput,
        preview,
        onSubmit,
        isPending: bulkCreate.isPending,
    };
}
