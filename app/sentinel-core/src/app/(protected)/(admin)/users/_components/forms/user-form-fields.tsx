'use client';

import { UseFormReturn } from 'react-hook-form';
import { UserFormValues } from '@sentinel/shared/schema';
import { useUserFormLogic } from '../../_hooks/use-user-form-logic';
import { BasicInfoFields } from './fields/basic-info-fields';
import { InstitutionField } from './fields/institution-field';
import { DepartmentField } from './fields/department-field';
import { CourseField, MultiCourseField } from './fields/course-fields';
import { RoleSpecificFields } from './fields/role-specific-fields';
import { RoleField } from './fields/role-field';

interface UserFormFieldsProps {
    form: UseFormReturn<UserFormValues>;
    watchedRole: string;
    isAdministratorForm?: boolean;
    lockInstitution?: boolean;
}

export function UserFormFields({
    form,
    watchedRole,
    isAdministratorForm = false,
    lockInstitution = false,
}: UserFormFieldsProps) {
    const {
        isSuperadmin,
        institutions,
        availableDepartments,
        filteredCourseOptions,
        selectedInstitutionName,
        shouldLockInstitution,
        shouldLockDepartment,
        shouldLockCourse,
        isInstructor,
        isStudent,
        isAdmin,
        watchedDepartment,
    } = useUserFormLogic({
        form,
        watchedRole,
        isAdministratorForm,
        lockInstitution,
    });

    return (
        <div className="space-y-4">
            <BasicInfoFields form={form} />

            <InstitutionField
                form={form}
                institutions={institutions}
                isSuperadmin={isSuperadmin}
                shouldLockInstitution={shouldLockInstitution}
                selectedInstitutionName={selectedInstitutionName}
            />

            <div
                className={`grid items-start gap-4 ${isStudent || isAdmin ? 'grid-cols-2' : 'grid-cols-1'}`}
            >
                <DepartmentField
                    form={form}
                    availableDepartments={availableDepartments}
                    shouldLockDepartment={shouldLockDepartment}
                    isAdmin={isAdmin}
                    shouldLockCourse={shouldLockCourse}
                />

                {(isStudent || isAdmin) && (
                    <CourseField
                        form={form}
                        filteredCourseOptions={filteredCourseOptions}
                        watchedDepartment={watchedDepartment}
                        shouldLockCourse={shouldLockCourse}
                        isAdmin={isAdmin}
                    />
                )}
            </div>

            {isInstructor && (
                <MultiCourseField
                    form={form}
                    filteredCourseOptions={filteredCourseOptions}
                    watchedDepartment={watchedDepartment}
                    shouldLockCourse={shouldLockCourse}
                />
            )}

            <RoleSpecificFields form={form} isStudent={isStudent} isInstructor={isInstructor} />

            <RoleField
                form={form}
                watchedRole={watchedRole}
                isAdministratorForm={isAdministratorForm}
            />
        </div>
    );
}
