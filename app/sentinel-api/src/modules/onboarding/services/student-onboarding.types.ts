export type StudentOnboardingInput = {
    firstName: string;
    lastName: string;
    studentNumber: string;
    institutionId: string;
    departmentId: string;
    courseId: string;
};

export type NormalizedStudentOnboardingInput = {
    firstName: string;
    lastName: string;
    studentNumber: string;
    institutionId: string;
    departmentId: string;
    courseId: string;
    normalizedLastName: string;
};
