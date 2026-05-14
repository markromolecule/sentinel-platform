'use client';

import { useMemo, useState } from 'react';
import { useCreateBulkDepartmentsMutation } from '@sentinel/hooks';
import { parseDepartmentManualText } from '../_utils';
import { toast } from 'sonner';

export function useBulkDepartmentForm(onSuccess: () => void) {
    const [institutionId, setInstitutionId] = useState('');
    const [input, setInput] = useState('');

    const preview = useMemo(() => parseDepartmentManualText(input), [input]);

    const bulkCreate = useCreateBulkDepartmentsMutation({
        onSuccess: () => {
            setInput('');
            onSuccess();
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to bulk create departments');
        },
    });

    const onSubmit = () => {
        if (!institutionId || institutionId === 'all') {
            toast.error('Please select an institution first');
            return;
        }

        if (preview.rows.length === 0) {
            toast.error('No valid departments to create');
            return;
        }

        bulkCreate.mutate({
            departments: preview.rows.map((r) => ({
                name: r.name,
                code: r.code,
                institution_id: institutionId,
            })),
        });
    };

    return {
        institutionId,
        setInstitutionId,
        input,
        setInput,
        preview,
        onSubmit,
        isPending: bulkCreate.isPending,
    };
}
