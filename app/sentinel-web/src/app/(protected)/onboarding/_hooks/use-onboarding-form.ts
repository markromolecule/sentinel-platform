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

export function useOnboardingForm() {
    const router = useRouter();
    const supabase = createSupabaseClient();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [studentNumber, setStudentNumber] = useState('');
    const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>('');
    const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

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
            setError(err.message);
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
        setSelectedInstitutionId(id);
        setSelectedDepartmentId('');
        setSelectedCourseId('');
    };

    const handleDepartmentChange = (id: string) => {
        setSelectedDepartmentId(id);
        setSelectedCourseId('');
    };

    const handleStudentNumberChange = (value: string) => {
        const raw = value.replace(/\D/g, '');
        let formatted = raw;
        if (raw.length > 4) {
            formatted = `${raw.slice(0, 4)}-${raw.slice(4, ONBOARDING_CONSTANTS.STUDENT_NUMBER_MAX_LENGTH - 1)}`;
        }
        setStudentNumber(formatted);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

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
            setError(result.error.issues[0].message);
            return;
        }

        submitOnboarding(result.data);
    };

    return {
        isLoading: isSubmitting,
        firstName,
        setFirstName,
        lastName,
        setLastName,
        studentNumber,
        institutions,
        selectedInstitutionId,
        handleInstitutionChange,
        departments,
        selectedDepartmentId,
        handleDepartmentChange,
        courses,
        selectedCourseId,
        setSelectedCourseId,
        error,
        handleStudentNumberChange,
        handleSubmit,
        isLoadingInstitutions,
        isLoadingDepartments,
        isLoadingCourses,
    };
}
