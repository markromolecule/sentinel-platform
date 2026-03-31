export type EnrolledSubjectData = {
    subject_offering_id: string;
    subject_id: string;
    code: string;
    title: string;
    term_id: string;
    term_academic_year: string;
    term_semester: string;
    department_code: string | null;
    course_code: string | null;
    sections: { id: string; name: string }[];
    requested_at: string | null;
    approved_at: string | null;
    approved_by_name: string | null;
};

export type EnrollmentRequest = {
    user_id: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    created_at: string | null;
    instructor_name: string | null;
    subject_offering_id: string;
    subject_id: string;
    subject_code: string;
    subject_title: string;
    term_id: string;
    term_academic_year: string;
    term_semester: string;
    department_name: string | null;
    department_code: string | null;
    department_id: string | null;
    course_title: string | null;
    course_code: string | null;
    course_id: string | null;
    sections: {
        request_id: string;
        class_group_id: string;
        section_id: string | null;
        section_name: string | null;
    }[];
    approved_by_name?: string | null;
};
