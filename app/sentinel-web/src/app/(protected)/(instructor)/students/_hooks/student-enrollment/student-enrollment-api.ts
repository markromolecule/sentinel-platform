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

function getUniqueStudentNumbers(studentNumbers: string[]) {
    return Array.from(
        new Set(
            studentNumbers
                .map((studentNumber) => studentNumber.trim())
                .filter((studentNumber) => studentNumber.length > 0),
        ),
    );
}

export async function previewStudentEnrollments(
    students: ParsedStudent[],
    classGroupId?: string,
): Promise<StudentEnrollmentPreviewResult[]> {
    const studentNumbers = getUniqueStudentNumbers(students.map((student) => student.studentNo));
    const response = (await apiClient('/enrollments/enroll/students/preview', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            studentNumbers,
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
    const uniqueStudentNumbers = getUniqueStudentNumbers(studentNumbers);
    const response = (await apiClient('/enrollments/enroll/students', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            studentNumbers: uniqueStudentNumbers,
            classGroupId,
        }),
    })) as ApiResponseEnvelope<EnrollmentResult>;

    return response.data;
}

export async function unenrollStudent(enrollmentId: string): Promise<void> {
    await apiClient(`/enrollments/${enrollmentId}`, {
        method: 'DELETE',
    });
}

/**
 * Sends a request to bulk unenroll students.
 *
 * @param enrollmentIds - List of enrollment IDs to unenroll
 */
export async function bulkUnenrollStudents(enrollmentIds: string[]): Promise<void> {
    await apiClient('/enrollments/bulk', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enrollmentIds }),
    });
}
