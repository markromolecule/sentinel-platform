import type {
    NormalizedStudentOnboardingInput,
    StudentOnboardingInput,
} from './student-onboarding.types';

const normalizeStudentNumber = (value: string) => value.trim();
const normalizeLastName = (value: string) => value.toLocaleLowerCase().replace(/\s+/g, '');

export function normalizeStudentOnboardingInput(
    studentData: StudentOnboardingInput,
): NormalizedStudentOnboardingInput {
    if (!studentData.institutionId || studentData.institutionId === '') {
        throw new Error('Please select an institution to continue your onboarding.');
    }

    return {
        ...studentData,
        studentNumber: normalizeStudentNumber(studentData.studentNumber),
        normalizedLastName: normalizeLastName(studentData.lastName),
    };
}
