'use client';

import { useMemo } from 'react';
import { useSubjectStore } from '@/stores/use-subject-store';
import { MOCK_PROCTOR } from '@sentinel/shared/constants';

export function useSubjectsList() {
    const allSubjects = useSubjectStore((state) => state.subjects);

    const subjects = useMemo(
        () => allSubjects.filter((s) => s.proctorId === MOCK_PROCTOR.id),
        [allSubjects],
    );

    return {
        subjects,
    };
}
