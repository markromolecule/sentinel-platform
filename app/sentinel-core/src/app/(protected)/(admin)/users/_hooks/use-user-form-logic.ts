'use client';

import {
    useCoursesQuery,
    useDepartmentsQuery,
    useInstitutionsQuery,
    useUserQuery,
} from '@sentinel/hooks';
import { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useUser } from '@/hooks/use-user';
import { useCoreAdminCapabilities } from '@/hooks/use-core-admin-capabilities';
import { UserFormValues } from '@sentinel/shared/schema';
import { Course, Department, Institution } from '@sentinel/shared/types';

interface UseUserFormLogicProps {
    form: UseFormReturn<UserFormValues>;
    watchedRole: string;
    isAdministratorForm?: boolean;
    lockInstitution?: boolean;
}

export function useUserFormLogic({
    form,
    watchedRole,
    isAdministratorForm = false,
    lockInstitution = false,
}: UseUserFormLogicProps) {
    const { data: adminAuth } = useUser();
    const { isSuperadmin } = useCoreAdminCapabilities();
    const { data: adminProfile } = useUserQuery(adminAuth?.id || '');

    const watchedInstitution = form.watch('institution');
    const watchedDepartment = form.watch('department');

    const assignedInstitutionId = adminProfile?.institutionId || '';
    const assignedDepartmentId = adminProfile?.departmentId || '';
    const assignedCourseId = adminProfile?.courseId || '';

    const shouldLockInstitution =
        (!isSuperadmin && Boolean(assignedInstitutionId)) || lockInstitution;
    const shouldLockDepartment = !isSuperadmin && Boolean(assignedDepartmentId);
    const shouldLockCourse = !isSuperadmin && Boolean(assignedCourseId);

    const { data: institutions, isLoading: isLoadingInstitutions } = useInstitutionsQuery();
    const { data: departments, isLoading: isLoadingDepartments } = useDepartmentsQuery({
        institutionId: watchedInstitution || undefined,
    });
    const { data: courses, isLoading: isLoadingCourses } = useCoursesQuery();

    // Reset department/course when institution changes for superadmins
    useEffect(() => {
        if (watchedInstitution && isSuperadmin) {
            // Optional: form.setValue("department", "");
        }
    }, [watchedInstitution, form, isSuperadmin]);

    // Force role to admin if isAdministratorForm is true
    useEffect(() => {
        if (isAdministratorForm && form.getValues('role') !== 'admin') {
            form.setValue('role', 'admin', { shouldValidate: true });
        }
    }, [isAdministratorForm, form]);

    // Handle profile-based locking and defaulting
    useEffect(() => {
        if (
            shouldLockInstitution &&
            assignedInstitutionId &&
            form.getValues('institution') !== assignedInstitutionId
        ) {
            form.setValue('institution', assignedInstitutionId, {
                shouldDirty: false,
                shouldValidate: true,
            });
        }

        if (
            shouldLockDepartment &&
            assignedDepartmentId &&
            form.getValues('department') !== assignedDepartmentId
        ) {
            form.setValue('department', assignedDepartmentId, {
                shouldDirty: false,
                shouldValidate: true,
            });
        }

        if (shouldLockCourse && assignedCourseId) {
            if (form.getValues('course') !== assignedCourseId) {
                form.setValue('course', assignedCourseId, {
                    shouldDirty: false,
                    shouldValidate: true,
                });
            }

            const currentCourseIds = form.getValues('courseIds') ?? [];
            if (currentCourseIds.length !== 1 || currentCourseIds[0] !== assignedCourseId) {
                form.setValue('courseIds', [assignedCourseId], {
                    shouldDirty: false,
                    shouldValidate: true,
                });
            }
        }
    }, [
        assignedInstitutionId,
        assignedCourseId,
        assignedDepartmentId,
        form,
        shouldLockInstitution,
        shouldLockCourse,
        shouldLockDepartment,
    ]);

    const availableDepartments = shouldLockDepartment
        ? departments?.filter((department: Department) => department.id === assignedDepartmentId)
        : departments;

    const filteredCourses = courses?.filter(
        (course: Course) => course.department === watchedDepartment,
    );

    const filteredCourseOptions =
        (shouldLockCourse
            ? filteredCourses?.filter((course: Course) => course.id === assignedCourseId)
            : filteredCourses) ?? [];

    const institutionName = adminProfile?.institution || (adminAuth?.id ? 'Loading...' : '');
    const selectedInstitutionName =
        institutions?.find((inst: Institution) => inst.id === watchedInstitution)?.name ||
        institutionName;

    const isInstructor = watchedRole === 'instructor';
    const isStudent = watchedRole === 'student';
    const isAdmin = watchedRole === 'admin' || isAdministratorForm;

    return {
        // State & Data
        isSuperadmin,
        institutions,
        availableDepartments,
        filteredCourseOptions,
        selectedInstitutionName,

        // Locking Status
        shouldLockInstitution,
        shouldLockDepartment,
        shouldLockCourse,

        // Role Status
        isInstructor,
        isStudent,
        isAdmin,

        // Loading Status
        isLoading: isLoadingInstitutions || isLoadingDepartments || isLoadingCourses,

        // Helpers
        watchedDepartment,
        watchedInstitution,
    };
}
