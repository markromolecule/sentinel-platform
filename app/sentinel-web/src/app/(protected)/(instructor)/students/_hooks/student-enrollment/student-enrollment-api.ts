import type { EnrollmentResult } from '@sentinel/shared/types';
import { apiClient } from '@/data/api/client';
import type {
    ParsedStudent,
    PreviewStudentEnrollmentResponse,
    StudentEnrollmentPreviewResult,
} from './student-enrollment.types';

type ApiResponseEnvelope<T> = {
    data: T;
    message?: string;
};

export async function previewStudentEnrollments(
    students: ParsedStudent[],
    classGroupId?: string,
): Promise<StudentEnrollmentPreviewResult[]> {
    const response = (await apiClient('/enrollments/enroll/students/preview', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            studentNumbers: students.map((student) => student.studentNo),
            ...(classGroupId ? { classGroupId } : {}),
        }),
    })) as ApiResponseEnvelope<PreviewStudentEnrollmentResponse['data']>;

    return response.data.results;
}

export async function enrollStudentNumbers({
    classGroupId,
    studentNumbers,
}: {
    classGroupId: string;
    studentNumbers: string[];
}): Promise<EnrollmentResult> {
    const response = (await apiClient('/enrollments/enroll/students', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            studentNumbers,
            classGroupId,
        }),
    })) as ApiResponseEnvelope<EnrollmentResult>;

    return response.data;
}
