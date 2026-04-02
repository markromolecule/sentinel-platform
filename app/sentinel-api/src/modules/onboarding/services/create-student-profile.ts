import { type DbClient } from '@sentinel/db';
import { assertStudentOnboardingEligibility } from './assert-student-onboarding-eligibility';
import { completeStudentOnboarding } from './complete-student-onboarding';
import { loadStudentOnboardingContext } from './load-student-onboarding-context';
import { normalizeStudentOnboardingInput } from './normalize-student-onboarding-input';
import type { StudentOnboardingInput } from './student-onboarding.types';

export async function createStudentProfile(
    dbClient: DbClient,
    userId: string,
    studentData: StudentOnboardingInput,
) {
    const normalizedStudentData = normalizeStudentOnboardingInput(studentData);
    const onboardingContext = await loadStudentOnboardingContext(
        dbClient,
        userId,
        normalizedStudentData,
    );

    assertStudentOnboardingEligibility(onboardingContext, userId, normalizedStudentData);

    return await completeStudentOnboarding(
        dbClient,
        userId,
        normalizedStudentData,
        onboardingContext,
    );
}
