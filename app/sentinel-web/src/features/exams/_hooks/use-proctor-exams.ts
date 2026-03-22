import { useState, useEffect, useCallback } from 'react';
import type { Exam } from '@sentinel/shared/types';
import { MOCK_EXAMS } from '@sentinel/shared/mock-data';

export function useProctorExams() {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [exams, setExams] = useState<Exam[]>(MOCK_EXAMS);

    const refreshExams = useCallback(() => {
        try {
            const localExamsRaw = localStorage.getItem('sentinel_mock_exams');
            if (localExamsRaw) {
                const localExams = JSON.parse(localExamsRaw);
                const merged = [...localExams, ...MOCK_EXAMS];
                // Deduplicate by ID just in case
                const uniqueIds = new Set();
                const uniqueExams = merged.filter((e: Exam) => {
                    const isDuplicate = uniqueIds.has(e.id);
                    uniqueIds.add(e.id);
                    return !isDuplicate;
                });
                setTimeout(() => setExams(uniqueExams), 0);
            } else {
                setTimeout(() => setExams(MOCK_EXAMS), 0);
            }
        } catch (e) {
            console.error('Failed to parse mock exams', e);
        }
    }, []);

    useEffect(() => {
        refreshExams();
        window.addEventListener('sentinel_mock_exams_updated', refreshExams);
        return () => window.removeEventListener('sentinel_mock_exams_updated', refreshExams);
    }, [refreshExams]);

    return {
        exams,
        isLoading: false,
        isCreateOpen,
        setIsCreateOpen,
    };
}
