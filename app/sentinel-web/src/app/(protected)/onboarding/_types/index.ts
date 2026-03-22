export interface Institution {
    id: string;
    name: string;
}

export interface Department {
    id: string;
    name: string;
    code?: string | null;
}

export interface Course {
    id: string;
    title: string;
    code?: string | null;
}

export interface OnboardingFormValues {
    firstName: string;
    lastName: string;
    studentNumber: string;
    institutionId: string;
    departmentId: string;
    courseId: string;
}

export interface PersonalInfoFieldsProps {
    firstName: string;
    setFirstName: (value: string) => void;
    lastName: string;
    setLastName: (value: string) => void;
    disabled?: boolean;
}

export interface AcademicInfoFieldsProps {
    institutions: Institution[];
    selectedInstitutionId: string;
    onInstitutionChange: (id: string) => void;
    departments: Department[];
    selectedDepartmentId: string;
    onDepartmentChange: (id: string) => void;
    courses: Course[];
    selectedCourseId: string;
    onCourseChange: (id: string) => void;
    studentNumber: string;
    onStudentNumberChange: (value: string) => void;
    isLoadingInstitutions?: boolean;
    isLoadingDepartments?: boolean;
    isLoadingCourses?: boolean;
    disabled?: boolean;
}
