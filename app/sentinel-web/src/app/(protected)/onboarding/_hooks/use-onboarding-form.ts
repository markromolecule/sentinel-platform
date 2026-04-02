import {
    useOnboardingCoursesQuery,
    useOnboardingDepartmentsQuery,
    useOnboardingInstitutionsQuery,
    useOnboardingMutation,
} from '@sentinel/hooks';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/data/supabase/client';
import { onboardingSchema } from '@sentinel/shared/schema';
import { ONBOARDING_CONSTANTS } from '@/app/(protected)/onboarding/_constants';

type OnboardingFeedback = {
    title: string;
    description: string;
    hints?: string[];
};

function createValidationFeedback(message: string): OnboardingFeedback {
    return {
        title: 'Check your details',
        description: message,
    };
}

function mapOnboardingError(message: string): OnboardingFeedback {
    if (message.includes('Student number is not approved')) {
        return {
            title: 'Student record not found',
            description:
                'We could not find an approved onboarding record for that student number in the institution you selected.',
            hints: [
                'Check that your student number is correct.',
                'Make sure you selected the correct institution.',
                'If the details are correct, ask your program chair or registrar to whitelist your record first.',
            ],
        };
    }

    if (message.includes('Last name does not match')) {
        return {
            title: 'Last name did not match',
            description:
                'Your last name must match the approved whitelist record before onboarding can continue.',
            hints: [
                'Use your official last name exactly as recorded by your school.',
                'Spacing differences are ignored, but the surname still needs to match.',
            ],
        };
    }

    if (message.includes('Department does not match')) {
        return {
            title: 'Department does not match',
            description:
                'The selected department does not match the approved whitelist record for your student account.',
            hints: [
                'Select the department tied to your official student record.',
                'If you recently shifted programs, ask an admin to update your whitelist first.',
            ],
        };
    }

    if (message.includes('Course does not match')) {
        return {
            title: 'Course does not match',
            description:
                'The selected course does not match the approved whitelist record for your student account.',
            hints: [
                'Choose your official program, not just a subject you are currently taking.',
                'Irregular and cross-department subjects do not change your whitelist course.',
            ],
        };
    }

    if (
        message.includes('claimed by another account') ||
        message.includes('already registered to another account')
    ) {
        return {
            title: 'This student record is already linked',
            description:
                'That whitelist record has already been claimed by another account, so onboarding cannot continue from this one.',
            hints: [
                'Try signing in with the account that originally completed onboarding.',
                'If this is a mistake, contact an admin or superadmin for assistance.',
            ],
        };
    }

    if (message.includes('not active')) {
        return {
            title: 'Whitelist record is inactive',
            description:
                'Your student whitelist record is currently inactive, so onboarding is temporarily blocked.',
            hints: ['Please contact your admin or registrar to reactivate your record.'],
        };
    }

    if (message.includes('Student profile already exists')) {
        return {
            title: 'Profile already completed',
            description:
                'This account already has a student profile, so onboarding does not need to be submitted again.',
        };
    }

    return {
        title: 'Unable to complete onboarding',
        description: message || 'Something went wrong while verifying your student details.',
        hints: [
            'Review your student number and selected academic information.',
            'If the problem continues, contact your admin or registrar.',
        ],
    };
}

export function useOnboardingForm() {
    const router = useRouter();
    const supabase = createSupabaseClient();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [studentNumber, setStudentNumber] = useState('');
    const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>('');
    const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [feedback, setFeedback] = useState<OnboardingFeedback | null>(null);

    // Fetch Institutions
    const { data: institutions = [], isLoading: isLoadingInstitutions } =
        useOnboardingInstitutionsQuery();

    // Fetch Departments (enabled only when institution is selected)
    const { data: departments = [], isLoading: isLoadingDepartments } =
        useOnboardingDepartmentsQuery(selectedInstitutionId);

    // Fetch Courses (enabled only when department is selected)
    const { data: courses = [], isLoading: isLoadingCourses } = useOnboardingCoursesQuery(
        selectedDepartmentId,
        selectedInstitutionId,
    );

    // Mutation for submission
    const { mutate: submitOnboarding, isPending: isSubmitting } = useOnboardingMutation({
        onSuccess: () => {
            router.push('/student/exam');
            router.refresh();
        },
        onError: (err) => {
            setFeedback(mapOnboardingError(err.message));
        },
    });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const {
                    data: { session },
                } = await supabase.auth.getSession();
                if (!session) return;

                const userMetadata = session.user.user_metadata;
                if (userMetadata) {
                    if (userMetadata.full_name) {
                        const parts = userMetadata.full_name.split(' ');
                        if (parts.length >= 2) {
                            setFirstName((prev) => prev || parts[0]);
                            setLastName((prev) => prev || parts.slice(1).join(' '));
                        } else {
                            setFirstName((prev) => prev || userMetadata.full_name);
                        }
                    } else {
                        if (userMetadata.first_name)
                            setFirstName((prev) => prev || userMetadata.first_name);
                        if (userMetadata.last_name)
                            setLastName((prev) => prev || userMetadata.last_name);
                    }
                }
            } catch (err) {
                console.error('Error fetching user data', err);
            }
        };
        fetchUserData();
    }, [supabase]);

    const handleInstitutionChange = (id: string) => {
        setFeedback(null);
        setSelectedInstitutionId(id);
        setSelectedDepartmentId('');
        setSelectedCourseId('');
    };

    const handleDepartmentChange = (id: string) => {
        setFeedback(null);
        setSelectedDepartmentId(id);
        setSelectedCourseId('');
    };

    const handleCourseChange = (id: string) => {
        setFeedback(null);
        setSelectedCourseId(id);
    };

    const handleFirstNameChange = (value: string) => {
        setFeedback(null);
        setFirstName(value);
    };

    const handleLastNameChange = (value: string) => {
        setFeedback(null);
        setLastName(value);
    };

    const handleStudentNumberChange = (value: string) => {
        setFeedback(null);
        const raw = value.replace(/\D/g, '');
        let formatted = raw;
        if (raw.length > 4) {
            formatted = `${raw.slice(0, 4)}-${raw.slice(4, ONBOARDING_CONSTANTS.STUDENT_NUMBER_MAX_LENGTH - 1)}`;
        }
        setStudentNumber(formatted);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFeedback(null);

        const formData = {
            firstName,
            lastName,
            institutionId: selectedInstitutionId,
            departmentId: selectedDepartmentId,
            courseId: selectedCourseId,
            studentNumber,
        };

        const result = onboardingSchema.safeParse(formData);

        if (!result.success) {
            setFeedback(createValidationFeedback(result.error.issues[0].message));
            return;
        }

        submitOnboarding(result.data);
    };

    return {
        isLoading: isSubmitting,
        firstName,
        setFirstName: handleFirstNameChange,
        lastName,
        setLastName: handleLastNameChange,
        studentNumber,
        institutions,
        selectedInstitutionId,
        handleInstitutionChange,
        departments,
        selectedDepartmentId,
        handleDepartmentChange,
        courses,
        selectedCourseId,
        setSelectedCourseId: handleCourseChange,
        feedback,
        handleStudentNumberChange,
        handleSubmit,
        isLoadingInstitutions,
        isLoadingDepartments,
        isLoadingCourses,
    };
}
