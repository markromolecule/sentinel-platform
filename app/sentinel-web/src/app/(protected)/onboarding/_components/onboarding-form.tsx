'use client';

import { Alert, AlertDescription, AlertTitle, Button, Spinner } from "@sentinel/ui";
import { ArrowRight, CircleAlert, ShieldCheck } from "lucide-react";
import { useOnboardingForm } from "@/app/(protected)/onboarding/_hooks/use-onboarding-form";
import { PersonalInfoFields } from "./personal-info-fields";
import { AcademicInfoFields } from "./academic-info-fields";
import { ONBOARDING_CONSTANTS } from "@/app/(protected)/onboarding/_constants";

function VerificationRulesCard() {
    return (
        <Alert className="border-white/10 bg-white/5 text-white">
            <ShieldCheck className="text-emerald-400" />
            <AlertTitle>Verification rules</AlertTitle>
            <AlertDescription className="space-y-3 text-gray-300">
                <p>Your onboarding will be checked against the approved student whitelist.</p>
                <ul className="list-disc space-y-2 pl-4 text-sm leading-6">
                    {ONBOARDING_CONSTANTS.VERIFICATION_RULES.map((rule) => (
                        <li key={rule}>{rule}</li>
                    ))}
                </ul>
            </AlertDescription>
        </Alert>
    );
}

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
        feedback,
        handleStudentNumberChange,
        handleSubmit,
        isLoadingInstitutions,
        isLoadingDepartments,
        isLoadingCourses,
    } = useOnboardingForm();

    return (
        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8">
            <div className="space-y-6">
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

                {feedback && (
                    <Alert variant="destructive" className="border-red-500/20 bg-red-500/10 text-red-400">
                        <CircleAlert />
                        <AlertTitle>{feedback.title}</AlertTitle>
                        <AlertDescription className="space-y-3 text-red-300">
                            <p>{feedback.description}</p>
                            {feedback.hints && feedback.hints.length > 0 && (
                                <ul className="list-disc space-y-2 pl-4 text-sm leading-6">
                                    {feedback.hints.map((hint) => (
                                        <li key={hint}>{hint}</li>
                                    ))}
                                </ul>
                            )}
                        </AlertDescription>
                    </Alert>
                )}

                <Button
                    type="submit"
                    className="h-12 w-full text-base font-semibold"
                    variant="premium-3d"
                    size="lg"
                    aria-busy={isLoading}
                    disabled={isLoading || !selectedCourseId || !studentNumber.trim()}
                >
                    {isLoading ? (
                        <span className="inline-flex items-center justify-center gap-2">
                            <Spinner className="size-4" />
                            Completing setup...
                        </span>
                    ) : (
                        <span className="group inline-flex items-center justify-center gap-2">
                            Complete Setup
                            <ArrowRight className="h-5 w-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                        </span>
                    )}
                </Button>
            </div>

            <div className="order-last lg:order-none">
                <div className="lg:sticky lg:top-8">
                    <VerificationRulesCard />
                </div>
            </div>
        </form>
    );
}
