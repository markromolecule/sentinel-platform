import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useEnrolledSubjectsQuery, useStableValue } from '@sentinel/hooks';
import { toast } from 'sonner';
import { apiClient } from '@/data/api/client';
import { EnrollmentResult } from '@sentinel/shared/types';
import type { EnrollmentSubjectOption } from '@/app/(protected)/(instructor)/students/_types/enrollment-target';

interface UseManualEntryProps {
    onSuccess: () => void;
}

function formatYearLevel(yearLevel?: number | null) {
    if (!yearLevel) {
        return '';
    }

    switch (yearLevel) {
        case 1:
            return '1st Year';
        case 2:
            return '2nd Year';
        case 3:
            return '3rd Year';
        default:
            return `${yearLevel}th Year`;
    }
}

export function useManualEntry({ onSuccess }: UseManualEntryProps) {
    const queryClient = useQueryClient();
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [studentNo, setStudentNo] = useState('');
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [section, setSection] = useState('');
    const [yearLevel, setYearLevel] = useState('');
    const [term, setTerm] = useState('');

    const { data: enrolledSubjects = [] } = useEnrolledSubjectsQuery();

    const subjects = useStableValue<EnrollmentSubjectOption[]>(
        () =>
            enrolledSubjects.map((subject) => ({
                id: subject.subject_offering_id,
                code: subject.code,
                title: subject.title,
                term: [subject.term_semester, subject.term_academic_year].filter(Boolean).join(' '),
                yearLevel: formatYearLevel(
                    [...(subject.year_levels ?? [])].sort((left, right) => left - right)[0],
                ),
                sections: (subject.sections ?? []).map((sectionOption) => ({
                    id: sectionOption.id,
                    name: sectionOption.name,
                    yearLevel:
                        formatYearLevel(sectionOption.year_level) ||
                        formatYearLevel(
                            [...(subject.year_levels ?? [])].sort((left, right) => left - right)[0],
                        ),
                })),
            })),
        [enrolledSubjects],
    );

    const selectedSubject = useStableValue(
        () => subjects.find((subject) => subject.id === selectedSubjectId),
        [selectedSubjectId, subjects],
    );

    const filteredSections = useStableValue(
        () => selectedSubject?.sections ?? [],
        [selectedSubject],
    );
    const selectedSection = useStableValue(
        () => selectedSubject?.sections.find((sectionOption) => sectionOption.name === section),
        [section, selectedSubject],
    );
    const selectedClassGroupId = selectedSection?.id || '';
    const isYearLevelLocked = filteredSections.length > 0;

    const getFallbackYearLevel = (subject?: EnrollmentSubjectOption | null) =>
        subject?.yearLevel ?? '';

    const syncYearLevelForSection = (
        nextSectionName: string,
        subject: EnrollmentSubjectOption | null | undefined = selectedSubject,
    ) => {
        const nextSection = subject?.sections.find(
            (sectionOption) => sectionOption.name === nextSectionName,
        );

        setYearLevel(nextSection?.yearLevel || getFallbackYearLevel(subject));
    };

    // Handlers
    const handleSubjectSelect = (subjectId: string) => {
        const isDeselected = subjectId === selectedSubjectId;
        const nextSubjectId = isDeselected ? '' : subjectId;
        setSelectedSubjectId(nextSubjectId);

        if (!isDeselected) {
            const subject = subjects.find((item) => item.id === subjectId);
            if (subject) {
                setTerm(subject.term);

                if (subject.sections.length > 0) {
                    const defaultSection = subject.sections[0];
                    setSection(defaultSection.name);
                    setYearLevel(defaultSection.yearLevel || subject.yearLevel);
                } else {
                    setSection('');
                    setYearLevel(subject.yearLevel);
                }
            }
        } else {
            setSection('');
            setYearLevel('');
            setTerm('');
        }
    };

    const handleSectionSelect = (nextSection: string) => {
        setSection(nextSection);
        syncYearLevelForSection(nextSection);
    };

    useEffect(() => {
        if (!selectedSubject) {
            return;
        }

        if (!selectedSubject.sections.length) {
            const nextYearLevel = getFallbackYearLevel(selectedSubject);

            if (yearLevel !== nextYearLevel) {
                setYearLevel(nextYearLevel);
            }

            return;
        }

        if (!selectedSection) {
            const defaultSection = selectedSubject.sections[0];

            if (section !== defaultSection.name) {
                setSection(defaultSection.name);
            }

            const nextYearLevel = defaultSection.yearLevel || getFallbackYearLevel(selectedSubject);

            if (yearLevel !== nextYearLevel) {
                setYearLevel(nextYearLevel);
            }

            return;
        }

        if (yearLevel !== selectedSection.yearLevel) {
            setYearLevel(selectedSection.yearLevel || getFallbackYearLevel(selectedSubject));
        }
    }, [section, selectedSection, selectedSubject, yearLevel]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!studentNo) {
            toast.error('Student number is required');
            return;
        }

        if (!selectedSubject || !selectedClassGroupId) {
            toast.error('Please select a subject');
            return;
        }

        setIsLoading(true);

        try {
            const response = await apiClient('/enrollments/enroll/students', {
                method: 'POST',
                body: JSON.stringify({
                    studentNumbers: [studentNo],
                    classGroupId: selectedClassGroupId,
                }),
            });

            if (response.error) {
                throw new Error(response.error as string);
            }

            const result = response.data as EnrollmentResult;

            if (result.failedCount > 0) {
                const failure = result.results.find((r) => r.status === 'FAILED');
                toast.error(`Enrollment failed: ${failure?.reason || 'Unknown error'}`);
            } else {
                await queryClient.invalidateQueries({
                    queryKey: ['instructor-students'],
                });
                toast.success('Student enrolled successfully');
                onSuccess();
                // Reset form
                setStudentNo('');
                setEmail('');
                setFirstName('');
                setLastName('');
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to enroll student';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        studentNo,
        setStudentNo,
        email,
        setEmail,
        firstName,
        setFirstName,
        lastName,
        setLastName,
        selectedSubjectId,
        selectedClassGroupId,
        handleSubjectSelect,
        handleSectionSelect,
        section,
        setSection,
        yearLevel,
        setYearLevel,
        term,
        setTerm,
        subjects,
        filteredSections,
        isYearLevelLocked,
        handleSubmit,
    };
}
