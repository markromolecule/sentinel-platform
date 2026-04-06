export type RequesterAcademicScope = {
    requesterRole?: string;
    requesterInstitutionId?: string;
    requesterDepartmentId?: string | null;
    requesterCourseId?: string | null;
};

export type DepartmentScopeRecord = {
    department_id: string;
    institution_id: string | null;
};

export type CourseScopeRecord = {
    course_id: string;
    department_id: string | null;
    institution_id: string | null;
};

export type SectionScopeRecord = {
    section_id: string;
    department_id: string | null;
    course_id: string | null;
    institution_id: string | null;
};

export type AcademicQueryScopeArgs = {
    requestedInstitutionId?: string;
    departmentId?: string;
    courseId?: string;
};

export type SectionScopePayloadArgs = {
    departmentId?: string | null;
    courseId?: string | null;
};

export type SubjectOfferingScopeArgs = {
    departmentIds?: string[];
    courseIds?: string[];
    sectionIds?: string[];
    yearLevels?: number[];
};

export type SubjectOfferingScopeRecord = {
    departmentIds?: string[];
    courseIds?: string[];
};

export type ScopedUserMutationOptions = {
    forceAdminCourse?: boolean;
};
