import { useState } from 'react';
import { useExamsQuery } from '@sentinel/hooks';

export function useProctorExams() {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const { data: exams = [], isLoading } = useExamsQuery();

    return {
        exams,
        isLoading,
        isCreateOpen,
        setIsCreateOpen,
    };
}
