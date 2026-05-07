'use client';

import {
    Dialog,
    DialogContent,
    DialogTitle,
    Button,
    ScrollArea,
    Separator,
    Alert,
    AlertDescription,
    AlertTitle,
    Skeleton,
} from '@sentinel/ui';
import { AlertCircle, ChevronLeft, ChevronRight, Save, Send } from 'lucide-react';
import { Institution } from '@sentinel/shared/types';
import { STEPS } from '../wizard/_constants';
import { useInstitutionWizard } from '../wizard/_hooks/use-institution-wizard';
import { StepStatus } from '../wizard/step-status';
import { IdentityStep } from '../wizard/steps/identity-step';
import { DepartmentsStep } from '../wizard/steps/departments-step';
import { CoursesStep } from '../wizard/steps/courses-step';
import { TermsStep } from '../wizard/steps/terms-step';
import { SubjectsStep } from '../wizard/steps/subjects-step';
import { NamingStep } from '../wizard/steps/naming-step';
import { ReviewStep } from '../wizard/steps/review-step';
import { useEffect, useRef } from 'react';
import {
    useDepartmentsQuery,
    useCoursesQuery,
    useSemestersQuery,
    useSubjectsQuery,
    useEffectiveInstitutionNamingConventionsQuery
} from '@sentinel/hooks';
import { WizardDraft, SectionNamingRule } from '../wizard/_types';

interface InstitutionWizardDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    institution?: Institution;
}

export function InstitutionWizardDialog({
    open,
    onOpenChange,
    institution,
}: InstitutionWizardDialogProps) {
    const {
        activeStep,
        draft,
        errors,
        isPublishing,
        lastSavedAt,
        summary,
        institutions,
        subjectBulkInput,
        subjectFileName,
        activeSubjectPreview,
        isParsingSubjects,
        updateDraft,
        saveDraft,
        goNext,
        goBack,
        publishSetup,
        handleSubjectFileChange,
        setSubjectFilePreview,
        applySubjectBulkRows,
        setSubjectBulkInput,
        setDraft,
    } = useInstitutionWizard();

    const isLastStep = activeStep === STEPS.length - 1;
    const hasInitialized = useRef(false);

    const { data: depts = [], isLoading: isLoadingDepts } = useDepartmentsQuery('', institution?.id, !!institution?.id && open);
    const { data: courses = [], isLoading: isLoadingCourses } = useCoursesQuery('', institution?.id, !!institution?.id && open);
    const { data: terms = [], isLoading: isLoadingTerms } = useSemestersQuery('', institution?.id, !!institution?.id && open);
    const { data: subjects = [], isLoading: isLoadingSubjects } = useSubjectsQuery('', institution?.id, !!institution?.id && open);
    const { data: namingData, isLoading: isLoadingNaming } = useEffectiveInstitutionNamingConventionsQuery(institution?.id);

    const isInitialDataLoading = isLoadingDepts || isLoadingCourses || isLoadingTerms || isLoadingSubjects || isLoadingNaming;

    useEffect(() => {
        if (open && institution && !hasInitialized.current && !isInitialDataLoading) {
            const draftData: WizardDraft = {
                identity: {
                    id: institution.id,
                    name: institution.name,
                    code: institution.code || '',
                    institutionKind: institution.institutionKind || 'STANDALONE',
                    parentInstitutionId: institution.parentInstitutionId || '',
                },
                departments: depts.map(d => ({
                    clientId: d.id,
                    name: d.name,
                    code: d.code || '',
                    isInherited: d.isInherited,
                    sourceRecordId: d.sourceRecordId || null,
                })),
                courses: courses.map(c => ({
                    clientId: c.id || '',
                    title: c.title,
                    code: c.code,
                    departmentClientId: c.departmentId || '',
                    isInherited: c.isInherited,
                    sourceRecordId: c.sourceRecordId || null,
                })),
                terms: terms.map(t => ({
                    clientId: t.id || '',
                    academicYear: t.academicYear,
                    semester: t.semester,
                    isActive: t.isActive,
                    startDate: t.startDate instanceof Date ? t.startDate.toISOString().split('T')[0] : (t.startDate || ''),
                    endDate: t.endDate instanceof Date ? t.endDate.toISOString().split('T')[0] : (t.endDate || ''),
                })),
                subjects: subjects.map(s => ({
                    clientId: s.id || '',
                    code: s.code,
                    title: s.title,
                    isInherited: s.isInherited,
                    sourceRecordId: s.sourceRecordId || null,
                })),
                naming: {
                    room: namingData?.namingRules.room || { label: 'Room', prefix: 'RM', virtualPrefix: 'VR' },
                    sectionRulesByCourseClientId: Object.entries(namingData?.namingRules.sectionRulesByCourseId || {}).reduce((acc, [id, rule]) => {
                        acc[id] = {
                            courseClientId: id,
                            format: rule.format,
                            preview: rule.preview,
                        };
                        return acc;
                    }, {} as Record<string, SectionNamingRule>),
                },
            };
            setDraft(draftData);
            hasInitialized.current = true;
        }
    }, [open, institution, depts, courses, terms, subjects, namingData, setDraft, isInitialDataLoading]);

    useEffect(() => {
        if (!open) {
            hasInitialized.current = false;
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton={true}
                className="max-w-[95vw] sm:max-w-[1200px] w-full h-[90vh] flex flex-col p-0 overflow-hidden"
            >
                {/* Header */}
                <header className="border-b flex h-16 shrink-0 items-center justify-between bg-card px-6">
                    <div className="flex items-center gap-4">
                        <DialogTitle className="text-xl font-bold tracking-tight text-[#323d8f]">
                            {institution ? `Edit ${institution.name}` : 'Institution Setup'}
                        </DialogTitle>
                        <Separator orientation="vertical" className="h-6" />
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Step {activeStep + 1}:</span>
                            <span className="font-medium">{STEPS[activeStep]}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {lastSavedAt && (
                            <p className="text-muted-foreground mr-2 text-xs">
                                Draft saved at {lastSavedAt}
                            </p>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => saveDraft()}
                            className="gap-2"
                        >
                            <Save className="h-4 w-4" />
                            Save Draft
                        </Button>
                    </div>
                </header>

                <div className="flex min-h-0 flex-1">
                    {/* Sidebar Navigation */}
                    <aside className="border-r flex w-64 shrink-0 flex-col bg-slate-50/30 min-h-0">
                        <ScrollArea className="h-full">
                            <nav className="space-y-1 p-4">
                                {STEPS.map((step, index) => (
                                    <div
                                        key={step}
                                        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left"
                                    >
                                        <StepStatus step={index} activeStep={activeStep} />
                                        <span
                                            className={
                                                index === activeStep
                                                    ? 'text-sm font-semibold text-[#323d8f]'
                                                    : 'text-muted-foreground text-sm font-medium'
                                            }
                                        >
                                            {step}
                                        </span>
                                    </div>
                                ))}
                            </nav>
                        </ScrollArea>
                    </aside>

                    {/* Main Wizard Content */}
                    <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-white">
                        <ScrollArea className="flex-1">
                            <div className="mx-auto max-w-4xl px-8 py-8">
                                {errors.length > 0 && (
                                    <div className="mb-6">
                                        <Alert variant="destructive">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertTitle>Validation Required</AlertTitle>
                                            <AlertDescription>
                                                <ul className="mt-2 list-inside list-disc space-y-1 text-xs">
                                                    {errors.map((error, i) => (
                                                        <li key={i}>{error}</li>
                                                    ))}
                                                </ul>
                                            </AlertDescription>
                                        </Alert>
                                    </div>
                                )}

                                {/* Steps */}
                                <div className="min-h-[400px]">
                                    {isInitialDataLoading ? (
                                        <div className="space-y-6">
                                            <Skeleton className="h-8 w-1/3" />
                                            <div className="space-y-4">
                                                <Skeleton className="h-10 w-full" />
                                                <Skeleton className="h-10 w-full" />
                                                <Skeleton className="h-10 w-full" />
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {activeStep === 0 && (
                                                <IdentityStep
                                                    draft={draft}
                                                    institutions={institutions
                                                        .filter((i) => i.institutionKind)
                                                        .map((i) => ({
                                                            id: i.id,
                                                            name: i.name,
                                                            institutionKind: i.institutionKind!,
                                                        }))}
                                                    updateDraft={updateDraft}
                                                />
                                            )}
                                            {activeStep === 1 && (
                                                <TermsStep
                                                    draft={draft}
                                                    summary={summary}
                                                    updateDraft={updateDraft}
                                                />
                                            )}
                                            {activeStep === 2 && (
                                                <NamingStep
                                                    draft={draft}
                                                    updateDraft={updateDraft}
                                                />
                                            )}
                                            {activeStep === 3 && (
                                                <DepartmentsStep
                                                    draft={draft}
                                                    summary={summary}
                                                    updateDraft={updateDraft}
                                                />
                                            )}
                                            {activeStep === 4 && (
                                                <CoursesStep
                                                    draft={draft}
                                                    summary={summary}
                                                    updateDraft={updateDraft}
                                                />
                                            )}
                                            {activeStep === 5 && (
                                                <SubjectsStep
                                                    draft={draft}
                                                    summary={summary}
                                                    subjectBulkInput={subjectBulkInput}
                                                    subjectFileName={subjectFileName}
                                                    activeSubjectPreview={activeSubjectPreview}
                                                    isParsingSubjects={isParsingSubjects}
                                                    updateDraft={updateDraft}
                                                    setSubjectBulkInput={setSubjectBulkInput}
                                                    handleSubjectFileChange={handleSubjectFileChange}
                                                    setSubjectFilePreview={setSubjectFilePreview}
                                                    applySubjectBulkRows={applySubjectBulkRows}
                                                />
                                            )}
                                            {activeStep === 6 && (
                                                <ReviewStep summary={summary} />
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </ScrollArea>

                        {/* Footer Actions */}
                        <footer className="border-t bg-card p-6 mt-auto">
                            <div className="mx-auto flex max-w-4xl items-center justify-between">
                                <Button
                                    variant="outline"
                                    onClick={goBack}
                                    disabled={activeStep === 0 || isPublishing}
                                    className="gap-2"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Previous
                                </Button>

                                <div className="flex gap-3">
                                    {isLastStep ? (
                                        <Button
                                            onClick={publishSetup}
                                            disabled={isPublishing}
                                            className="min-w-[140px] gap-2 bg-[#323d8f] hover:bg-[#323d8f]/90"
                                        >
                                            <Send className="h-4 w-4" />
                                            {isPublishing ? 'Saving...' : (institution ? 'Save Changes' : 'Publish Setup')}
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={goNext}
                                            className="min-w-[120px] gap-2 bg-[#323d8f] hover:bg-[#323d8f]/90"
                                        >
                                            Next Step
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </footer>
                    </main>
                </div>
            </DialogContent>
        </Dialog>
    );
}
