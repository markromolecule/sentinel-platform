import { useState, useMemo } from 'react';
import { MOCK_PROCTOR_STUDENTS as MOCK_STUDENTS } from '@sentinel/shared/constants';
import { toast } from 'sonner';

export function useExamAssignment(onOpenChange: (open: boolean) => void) {
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sectionFilter, setSectionFilter] = useState<string>('all');
    const [subjectFilter, setSubjectFilter] = useState<string>('all');
    const [expandedSections, setExpandedSections] = useState<string[]>([]);

    // Get unique values for filters
    const allSections = useMemo(() => Array.from(new Set(MOCK_STUDENTS.map((s) => s.section))), []);
    const allSubjects = useMemo(() => Array.from(new Set(MOCK_STUDENTS.map((s) => s.subject))), []);

    const handleToggleStudent = (studentId: string) => {
        setSelectedStudents((prev) =>
            prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId],
        );
    };

    const handleToggleSectionSelect = (section: string, studentIds: string[]) => {
        const allSelected = studentIds.every((id) => selectedStudents.includes(id));

        if (allSelected) {
            // Deselect all
            setSelectedStudents((prev) => prev.filter((id) => !studentIds.includes(id)));
        } else {
            // Select all
            setSelectedStudents((prev) => {
                const newSelection = new Set([...prev, ...studentIds]);
                return Array.from(newSelection);
            });
        }
    };

    const toggleSectionExpand = (section: string) => {
        setExpandedSections((prev) =>
            prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section],
        );
    };

    const filteredStudents = useMemo(() => {
        return MOCK_STUDENTS.filter((student) => {
            const matchesSearch =
                student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                student.studentNo.includes(searchQuery);
            const matchesSection = sectionFilter === 'all' || student.section === sectionFilter;
            const matchesSubject = subjectFilter === 'all' || student.subject === subjectFilter;

            return matchesSearch && matchesSection && matchesSubject;
        });
    }, [searchQuery, sectionFilter, subjectFilter]);

    // Group filtered students by section
    const studentsBySection = useMemo(() => {
        return filteredStudents.reduce(
            (acc, student) => {
                if (!acc[student.section]) {
                    acc[student.section] = [];
                }
                acc[student.section].push(student);
                return acc;
            },
            {} as Record<string, typeof MOCK_STUDENTS>,
        );
    }, [filteredStudents]);

    const sectionKeys = useMemo(() => Object.keys(studentsBySection).sort(), [studentsBySection]);

    const resetFilters = () => {
        setSelectedStudents([]);
        setSearchQuery('');
        setSectionFilter('all');
        setSubjectFilter('all');
    };

    const handleAssign = () => {
        toast.success(`Exam assigned to ${selectedStudents.length} students`);
        onOpenChange(false);
        resetFilters();
    };

    return {
        // State
        selectedStudents,
        searchQuery,
        sectionFilter,
        subjectFilter,
        expandedSections,

        // Data
        allSections,
        allSubjects,
        filteredStudents,
        studentsBySection,
        sectionKeys,

        // Actions
        setSearchQuery,
        setSectionFilter,
        setSubjectFilter,
        handleToggleStudent,
        handleToggleSectionSelect,
        toggleSectionExpand,
        handleAssign,
        resetFilters,
    };
}
