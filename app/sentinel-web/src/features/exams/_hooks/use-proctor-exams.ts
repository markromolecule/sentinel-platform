import { useState } from 'react';
import type { Exam } from '@sentinel/shared/types';
import { MOCK_EXAMS } from '@sentinel/shared/mock-data';

export function useProctorExams() {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const exams: Exam[] = MOCK_EXAMS;

    return {
        exams,
        isLoading: false,
        isCreateOpen,
        setIsCreateOpen,
    };
}
