import { useState } from "react";
import { MOCK_PROCTOR_EXAMS } from '@sentinel/shared/constants';;

export function useProctorExams() {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    
    // In a real app, we would fetch exams here using React Query
    const exams = MOCK_PROCTOR_EXAMS;

    return {
        exams,
        isCreateOpen,
        setIsCreateOpen,
    };
}
