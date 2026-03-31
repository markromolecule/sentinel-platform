'use client';

import { useMemo } from 'react';
import { useEnrolledSubjectsQuery, useEnrollmentRequestsQuery } from '@sentinel/hooks';
import { Subject, EnrolledSubjectData, EnrollmentRequest } from '@sentinel/shared/types';

// 1. Extract mappers to separate pure functions
const mapEnrolledToSubject = (s: EnrolledSubjectData): Subject => ({
    id: s.subject_offering_id,
    subjectOfferingId: s.subject_offering_id,
    code: s.code,
    title: s.title,
    department_code: s.department_code,
    course_code: s.course_code,
    sections: s.sections,
    status: 'APPROVED',
    requested_at: s.requested_at,
    approved_at: s.approved_at,
    approved_by: s.approved_by_name || '',
    termId: s.term_id,
    termAcademicYear: s.term_academic_year,
    termSemester: s.term_semester,
    createdAt: s.approved_at || s.requested_at || new Date().toISOString(),
    createdBy: s.approved_by_name || '',
});

const mapRequestToSubject = (r: EnrollmentRequest): Subject => ({
    id: r.subject_offering_id,
    subjectOfferingId: r.subject_offering_id,
    code: r.subject_code,
    title: r.subject_title,
    department_code: r.department_code || '',
    course_code: r.course_code || '',
    sections: r.sections.map((s) => ({
        id: s.class_group_id || s.section_id || '',
        name: s.section_name || 'Unknown',
    })),
    status: r.status,
    requested_at: r.created_at,
    approved_at: null,
    approved_by: null,
    termId: r.term_id,
    termAcademicYear: r.term_academic_year,
    termSemester: r.term_semester,
    createdAt: r.created_at || new Date().toISOString(),
    createdBy: r.instructor_name || '',
});

export function useSubjectsList(search?: string): {
    subjects: Subject[];
    isLoading: boolean;
    isError: boolean;
} {
    const {
        data: enrolledRaw = [],
        isLoading: isLoadingEnrolled,
        isError: isErrorEnrolled,
    } = useEnrolledSubjectsQuery(search);

    const {
        data: requestsRaw = [],
        isLoading: isLoadingRequests,
        isError: isErrorRequests,
    } = useEnrollmentRequestsQuery();

    // 2. Memoize the transformation and combination logic
    const subjects = useMemo(() => {
        if (!enrolledRaw.length && !requestsRaw.length) return [];

        const enrolled = enrolledRaw.map(mapEnrolledToSubject);
        const validRequests = requestsRaw
            .filter((r) => r.status !== 'APPROVED')
            .map(mapRequestToSubject);

        const combined = [...enrolled, ...validRequests];
        const normalizedSearch = search?.trim().toLowerCase();

        if (!normalizedSearch) {
            return combined;
        }

        return combined.filter((subject) =>
            [
                subject.code,
                subject.title,
                subject.department_code,
                subject.course_code,
                subject.termAcademicYear,
                subject.termSemester,
            ].some((value) => value?.toLowerCase().includes(normalizedSearch)),
        );
    }, [enrolledRaw, requestsRaw, search]);

    return {
        subjects,
        isLoading: isLoadingEnrolled || isLoadingRequests,
        isError: isErrorEnrolled || isErrorRequests,
    };
}
