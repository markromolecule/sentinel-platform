import { useState, useMemo, useEffect } from "react";
import { useSubjectStore } from "@/stores/use-subject-store";
import { useSectionStore } from "@/stores/use-section-store";
import { MOCK_PROCTOR } from '@sentinel/shared/constants';;

export function useAddSubject() {
    const [open, setOpen] = useState(false);
    const [selectedSubjectCode, setSelectedSubjectCode] = useState("");
    const [selectedSectionIds, setSelectedSectionIds] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    const addSubject = useSubjectStore((state) => state.addSubject);
    const masterSubjects = useSubjectStore((state) => state.masterSubjects);
    const sections = useSectionStore((state) => state.sections);

    // Filter master subjects based on search query
    const filteredSubjects = useMemo(() => {
        if (!searchQuery) return masterSubjects;
        const lowerQuery = searchQuery.toLowerCase();
        return masterSubjects.filter(
            (s) =>
                s.code.toLowerCase().includes(lowerQuery) ||
                s.title.toLowerCase().includes(lowerQuery)
        );
    }, [masterSubjects, searchQuery]);

    // Get subject details based on selected code
    const selectedSubject = useMemo(() =>
        masterSubjects.find(s => s.code === selectedSubjectCode),
        [masterSubjects, selectedSubjectCode]
    );

    // Filter available sections based on Master Subject's defined sections
    const availableSections = useMemo(() => {
        if (!selectedSubject) return [];

        const activeSections = sections.filter(s => s.status === "active");

        // If master subject has specific sections assigned, filter by them
        if (selectedSubject.sections && selectedSubject.sections.length > 0) {
            return activeSections.filter(s => selectedSubject.sections!.includes(s.name));
        }

        return activeSections;
    }, [sections, selectedSubject]);

    const toggleSection = (sectionId: string) => {
        setSelectedSectionIds(prev =>
            prev.includes(sectionId)
                ? prev.filter(id => id !== sectionId)
                : [...prev, sectionId]
        );
    };

    const handleSelectAll = () => {
        if (selectedSectionIds.length === availableSections.length) {
            setSelectedSectionIds([]);
        } else {
            setSelectedSectionIds(availableSections.map(s => s.id));
        }
    };

    const handleSelectSubject = (subjectCode: string) => {
        const newCode = subjectCode === selectedSubjectCode ? "" : subjectCode;
        setSelectedSubjectCode(newCode);
        setSelectedSectionIds([]);
        setSearchQuery("");
    };

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (selectedSubject && selectedSectionIds.length > 0) {
            selectedSectionIds.forEach(sectionId => {
                const sectionObj = sections.find(s => s.id === sectionId);
                if (sectionObj) {
                    addSubject({
                        title: selectedSubject.title,
                        code: selectedSubject.code,
                        section: sectionObj.name,
                        department: selectedSubject.department,
                        proctorId: MOCK_PROCTOR.id,
                        createdBy: MOCK_PROCTOR.name
                    });
                }
            });

            // Reset form and close dialog
            setSelectedSubjectCode("");
            setSelectedSectionIds([]);
            setOpen(false);
        }
    };

    // Reset state when dialog closes
    useEffect(() => {
        if (!open) {
            setSelectedSubjectCode("");
            setSelectedSectionIds([]);
            setSearchQuery("");
        }
    }, [open]);

    return {
        open,
        setOpen,
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
