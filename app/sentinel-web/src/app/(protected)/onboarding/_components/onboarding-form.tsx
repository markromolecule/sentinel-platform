'use client';

import { Button } from "@sentinel/ui";
import { Loader2, ArrowRight } from "lucide-react";
import { useOnboardingForm } from "@/app/(protected)/onboarding/_hooks/use-onboarding-form";
import { PersonalInfoFields } from "./personal-info-fields";
import { AcademicInfoFields } from "./academic-info-fields";

export function OnboardingForm() {
    const {
        isLoading,
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
    } = useOnboardingForm();

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PersonalInfoFields
                firstName={firstName}
                setFirstName={setFirstName}
                lastName={lastName}
                setLastName={setLastName}
                disabled={isLoading}
            />

            <AcademicInfoFields
                institutions={institutions}
                selectedInstitutionId={selectedInstitutionId}
                onInstitutionChange={handleInstitutionChange}
                departments={departments}
                selectedDepartmentId={selectedDepartmentId}
                onDepartmentChange={handleDepartmentChange}
                courses={courses}
                selectedCourseId={selectedCourseId}
                onCourseChange={setSelectedCourseId}
                studentNumber={studentNumber}
                onStudentNumberChange={handleStudentNumberChange}
                isLoadingInstitutions={isLoadingInstitutions}
                isLoadingDepartments={isLoadingDepartments}
                isLoadingCourses={isLoadingCourses}
                disabled={isLoading}
            />

            {error && (
                <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                    {error}
                </div>
            )}

            <Button
                type="submit"
                className="w-full h-12 text-base font-semibold group"
                variant="premium-3d"
                size="lg"
                disabled={isLoading || !selectedCourseId || !studentNumber.trim()}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                    </>
                ) : (
                    <>
                        Complete Setup
                        <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                    </>
                )}
            </Button>
        </form>
    );
}
