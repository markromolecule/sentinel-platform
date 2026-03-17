import { useState } from 'react';
import { MOCK_PROCTOR_STUDENTS as MOCK_STUDENTS } from '@sentinel/shared/constants';

export function useStudentsList() {
    const [isEnrollmentOpen, setIsEnrollmentOpen] = useState(false);

    // In a real app, useQuery to fetch students
    const students = MOCK_STUDENTS;

    return {
        students,
        isEnrollmentOpen,
        setIsEnrollmentOpen,
    };
}
