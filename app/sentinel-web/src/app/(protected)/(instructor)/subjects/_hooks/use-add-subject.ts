'use client';

import { useState, useCallback } from 'react';
import { useStableValue } from '@sentinel/hooks';
import { useSubjectStore } from '@/stores/use-subject-store';
import { useSectionStore } from '@/stores/use-section-store';
import { MOCK_PROCTOR } from '@sentinel/shared/constants';

export function useAddSubject() {
    const [open, setOpen] = useState(false);
    const [selectedSubjectCode, setSelectedSubjectCode] = useState('');
    const [selectedSectionIds, setSelectedSectionIds] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const addSubject = useSubjectStore((state) => state.addSubject);
    const masterSubjects = useSubjectStore((state) => state.masterSubjects);
    const sections = useSectionStore((state) => state.sections);

    // 1. Centralize the form reset logic to avoid repetition
    const resetForm = useCallback(() => {
        setSelectedSubjectCode('');
        setSelectedSectionIds([]);
        setSearchQuery('');
    }, []);

    const filteredSubjects = useStableValue(() => {
        if (!searchQuery) return masterSubjects;
        const lowerQuery = searchQuery.toLowerCase();
        return masterSubjects.filter(
            (s) =>
                s.code.toLowerCase().includes(lowerQuery) ||
                s.title.toLowerCase().includes(lowerQuery),
        );
    }, [masterSubjects, searchQuery]);

    const selectedSubject = useStableValue(
        () => masterSubjects.find((s) => s.code === selectedSubjectCode),
        [masterSubjects, selectedSubjectCode],
    );

    const availableSections = useStableValue(() => {
        if (!selectedSubject) return [];

        // 2. Use a Set for O(1) lookups instead of .includes() on an array
        if (selectedSubject.sections?.length) {
            const allowedSections = new Set(selectedSubject.sections);
            return sections.filter((s) => allowedSections.has(s.name));
        }

        return sections;
    }, [sections, selectedSubject]);

    const toggleSection = useCallback((sectionId: string) => {
        setSelectedSectionIds((prev) =>
            prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId],
        );
    }, []);

    const handleSelectAll = useCallback(() => {
        setSelectedSectionIds((prev) =>
            prev.length === availableSections.length ? [] : availableSections.map((s) => s.id),
        );
    }, [availableSections]);

    const handleSelectSubject = useCallback((subjectCode: string) => {
        setSelectedSubjectCode((prev) => (subjectCode === prev ? '' : subjectCode));
        setSelectedSectionIds([]);
        setSearchQuery('');
    }, []);

    const handleSubmit = useCallback(
        (e?: React.FormEvent) => {
            if (e) e.preventDefault();

            if (!selectedSubject || selectedSectionIds.length === 0) return;

            const selectedIdsSet = new Set(selectedSectionIds);

            sections.forEach((sectionObj) => {
                if (selectedIdsSet.has(sectionObj.id)) {
                    addSubject({
                        title: selectedSubject.title,
                        code: selectedSubject.code,
                        section: sectionObj.name,
                        department: selectedSubject.department || 'General',
                        instructorId: MOCK_PROCTOR.id,
                        createdBy: MOCK_PROCTOR.name,
                    });
                }
            });

            resetForm();
            setOpen(false);
        },
        [selectedSubject, selectedSectionIds, sections, addSubject, resetForm],
    );

    const handleOpenChange = useCallback(
        (newOpen: boolean) => {
            setOpen(newOpen);
            if (!newOpen) resetForm();
        },
        [resetForm],
    );

    return {
        open,
        setOpen: handleOpenChange,
        selectedSubjectCode,
        selectedSectionIds,
        searchQuery,
        setSearchQuery,
        filteredSubjects,
        selectedSubject,
        availableSections,
        toggleSection,
        handleSelectAll,
        handleSelectSubject,
        handleSubmit,
    };
}
