import { useState, useMemo, useEffect } from "react";
import { useSubjectStore } from "@/stores/use-subject-store";
import { toast } from "sonner";

interface UseManualEntryProps {
    onSuccess: () => void;
}

export function useManualEntry({ onSuccess }: UseManualEntryProps) {
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [studentNo, setStudentNo] = useState("");
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [selectedSubjectCode, setSelectedSubjectCode] = useState("");
    const [section, setSection] = useState("");
    const [yearLevel, setYearLevel] = useState("");
    const [term, setTerm] = useState("");

    const { masterSubjects } = useSubjectStore();

    // Derived State
    const selectedSubject = useMemo(
        () => masterSubjects.find((s) => s.code === selectedSubjectCode),
        [masterSubjects, selectedSubjectCode]
    );

    const filteredSections = selectedSubject?.sections || [];

    // Auto-fill Logic
    useEffect(() => {
        if (selectedSubject) {
            if (selectedSubject.yearLevel) {
                setYearLevel(selectedSubject.yearLevel);
            }
            setTerm("1st Semester 2025-2026");

            if (selectedSubject.sections && selectedSubject.sections.length > 0) {
                setSection(selectedSubject.sections[0]);
            } else {
                setSection("");
            }
        }
    }, [selectedSubject]);

    // Handlers
    const handleSubjectSelect = (code: string) => {
        const newCode = code === selectedSubjectCode ? "" : code;
        setSelectedSubjectCode(newCode);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        toast.success("Student added successfully");
        setIsLoading(false);
        onSuccess();
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
        selectedSubjectCode,
        handleSubjectSelect,
        section,
        setSection,
        yearLevel,
        setYearLevel,
        term,
        setTerm,
        masterSubjects,
        filteredSections,
        handleSubmit,
    };
}
