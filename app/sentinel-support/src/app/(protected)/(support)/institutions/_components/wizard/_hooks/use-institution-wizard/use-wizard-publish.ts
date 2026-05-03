import { useState, useCallback } from 'react';
import { InstitutionSectionNamingRule } from '@sentinel/shared/types';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
    createCourse,
    createDepartment,
    createInstitution,
    createSemester,
    createSubject,
    saveInstitutionNamingConventions,
    updateInstitution,
} from '@sentinel/services';
import { useApi } from '@sentinel/hooks';
import type { WizardDraft } from '../../_types';
import { DRAFT_KEY, STEPS } from '../../_constants';
import { asErrorMessage } from '../../_utils';

export type UseWizardPublishArgs = {
    apiClient: ReturnType<typeof useApi>;
    draft: WizardDraft;
    validateStep: (step: number) => boolean;
    setActiveStep: (step: number) => void;
    setErrors: (errors: string[]) => void;
    setHasUnsavedProgress: (val: boolean) => void;
};

export function useWizardPublish({
    apiClient,
    draft,
    validateStep,
    setActiveStep,
    setErrors,
    setHasUnsavedProgress,
}: UseWizardPublishArgs) {
    const router = useRouter();
    const [isPublishing, setIsPublishing] = useState(false);

    const publishSetup = useCallback(async () => {
        for (let step = 0; step < STEPS.length - 1; step += 1) {
            if (!validateStep(step)) {
                setActiveStep(step);
                return;
            }
        }

        setIsPublishing(true);
        setErrors([]);

        try {
            const isEditing = !!draft.identity.id;
            let institutionId = draft.identity.id || '';

            if (isEditing) {
                await updateInstitution(apiClient, {
                    id: institutionId,
                    payload: {
                        name: draft.identity.name.trim(),
                        code: draft.identity.code.trim(),
                        institutionKind: draft.identity.institutionKind,
                        parentInstitutionId:
                            draft.identity.institutionKind === 'CHILD'
                                ? draft.identity.parentInstitutionId
                                : null,
                    },
                });
            } else {
                const institution = await createInstitution(apiClient, {
                    name: draft.identity.name.trim(),
                    code: draft.identity.code.trim(),
                    institutionKind: draft.identity.institutionKind,
                    parentInstitutionId:
                        draft.identity.institutionKind === 'CHILD'
                            ? draft.identity.parentInstitutionId
                            : null,
                    namingConventions: {
                        roomCodeFormat: draft.naming.room.label,
                        sectionCodeFormat: null,
                        namingRules: {
                            room: {
                                label: draft.naming.room.label,
                                prefix: draft.naming.room.prefix,
                                virtualPrefix: draft.naming.room.virtualPrefix,
                            },
                            sectionRulesByCourseId: {},
                        },
                    },
                });
                institutionId = institution.id;
            }

            if (!isEditing) {
                // Only create related entities if NOT editing
                // In Edit mode, these should be managed in their respective pages
                const departmentIds = new Map<string, string>();
                const courseIds = new Map<string, string>();

                for (const department of draft.departments.filter((row) => row.name.trim())) {
                    const created = await createDepartment(apiClient, {
                        name: department.name.trim(),
                        code: department.code.trim() || undefined,
                        institution_id: institutionId,
                    });
                    departmentIds.set(department.clientId, created.id);
                }

                for (const course of draft.courses.filter((row) => row.title.trim())) {
                    const created = await createCourse(apiClient, {
                        title: course.title.trim(),
                        code: course.code.trim(),
                        departmentId: departmentIds.get(course.departmentClientId) ?? null,
                        description: null,
                        institution_id: institutionId,
                    });
                    courseIds.set(course.clientId, created.id);
                }

                for (const term of draft.terms.filter((row) => row.academicYear.trim())) {
                    await createSemester(apiClient, {
                        academic_year: term.academicYear.trim(),
                        semester: term.semester.trim(),
                        is_active: term.isActive,
                        start_date: term.startDate || null,
                        end_date: term.endDate || null,
                        institution_id: institutionId,
                    });
                }

                for (const subject of draft.subjects.filter((row) => row.title.trim())) {
                    await createSubject(apiClient, {
                        code: subject.code.trim(),
                        title: subject.title.trim(),
                        institution_id: institutionId,
                    });
                }

                // Save finalized naming conventions with course IDs
                const sectionRulesByCourseId: Record<string, InstitutionSectionNamingRule> = {};
                for (const [courseClientId, rule] of Object.entries(
                    draft.naming.sectionRulesByCourseClientId,
                )) {
                    const realCourseId = courseIds.get(courseClientId);
                    if (realCourseId) {
                        sectionRulesByCourseId[realCourseId] = {
                            courseId: realCourseId,
                            format: rule.format,
                            preview: rule.preview,
                        };
                    }
                }

                await saveInstitutionNamingConventions(apiClient, {
                    institutionId,
                    payload: {
                        roomCodeFormat: draft.naming.room.label,
                        sectionCodeFormat: null,
                        namingRules: {
                            room: {
                                label: draft.naming.room.label,
                                prefix: draft.naming.room.prefix,
                                virtualPrefix: draft.naming.room.virtualPrefix,
                            },
                            sectionRulesByCourseId,
                        },
                    },
                });
            } else {
                // If editing, at least update naming conventions
                // Mapping clientId back to real IDs if they were loaded
                const sectionRulesByCourseId: Record<string, InstitutionSectionNamingRule> = {};
                for (const [courseClientId, rule] of Object.entries(
                    draft.naming.sectionRulesByCourseClientId,
                )) {
                    sectionRulesByCourseId[courseClientId] = {
                        courseId: courseClientId,
                        format: rule.format,
                        preview: rule.preview,
                    };
                }

                await saveInstitutionNamingConventions(apiClient, {
                    institutionId,
                    payload: {
                        roomCodeFormat: draft.naming.room.label,
                        sectionCodeFormat: null,
                        namingRules: {
                            room: {
                                label: draft.naming.room.label,
                                prefix: draft.naming.room.prefix,
                                virtualPrefix: draft.naming.room.virtualPrefix,
                            },
                            sectionRulesByCourseId,
                        },
                    },
                });
            }

            window.localStorage.removeItem(DRAFT_KEY);
            setHasUnsavedProgress(false);
            toast.success(isEditing ? 'Institution updated' : 'Institution template published');
            if (!isEditing) router.push('/institutions');
            else setActiveStep(STEPS.length - 1); // Stay on review step or close
        } catch (error) {
            setErrors([asErrorMessage(error)]);
            toast.error('Institution setup publish failed');
        } finally {
            setIsPublishing(false);
        }
    }, [apiClient, draft, validateStep, setActiveStep, setErrors, setHasUnsavedProgress, router]);

    return {
        isPublishing,
        publishSetup,
    };
}
