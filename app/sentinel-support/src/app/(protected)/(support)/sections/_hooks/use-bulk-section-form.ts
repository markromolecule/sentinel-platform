'use client';

import { useMemo, useState } from 'react';
import { useCreateSectionsMutation } from '@sentinel/hooks';
import { parseSectionManualText } from '../_utils';
import { toast } from 'sonner';

export function useBulkSectionForm(onSuccess: () => void) {
    const [institutionId, setInstitutionId] = useState('');
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
        if (!institutionId || institutionId === 'all') {
            toast.error('Please select an institution first');
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
        institutionId,
        setInstitutionId,
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
