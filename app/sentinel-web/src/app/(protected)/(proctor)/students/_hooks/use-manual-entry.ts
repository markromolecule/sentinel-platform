import { useState, useMemo } from 'react';
import { useSubjectStore } from '@/stores/use-subject-store';
import { toast } from 'sonner';

interface UseManualEntryProps {
    onSuccess: () => void;
}

export function useManualEntry({ onSuccess }: UseManualEntryProps) {
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [studentNo, setStudentNo] = useState('');
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [selectedSubjectCode, setSelectedSubjectCode] = useState('');
    const [section, setSection] = useState('');
    const [yearLevel, setYearLevel] = useState('');
    const [term, setTerm] = useState('');

    const { masterSubjects } = useSubjectStore();

    // Derived State
    const selectedSubject = useMemo(
        () => masterSubjects.find((s) => s.code === selectedSubjectCode),
        [masterSubjects, selectedSubjectCode],
    );

    const filteredSections = selectedSubject?.sections || [];

    // Handlers
    const handleSubjectSelect = (code: string) => {
        const isDeselected = code === selectedSubjectCode;
        const newCode = isDeselected ? '' : code;
        setSelectedSubjectCode(newCode);

        if (!isDeselected) {
            const subject = masterSubjects.find((s) => s.code === code);
            if (subject) {
                if (subject.yearLevel) {
                    setYearLevel(subject.yearLevel);
                }
                setTerm('1st Semester 2025-2026');

                if (subject.sections && subject.sections.length > 0) {
                    setSection(subject.sections[0]);
                } else {
                    setSection('');
                }
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        toast.success('Student added successfully');
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
