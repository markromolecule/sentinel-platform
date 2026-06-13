'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    ScrollArea,
} from '@sentinel/ui';
import { useExamAssignment } from '@/features/exams/_components/dialogs/exam-assign/hooks/use-exam-assignment';
import {
    ExamAssignFilters,
    ExamAssignSection,
    ExamAssignFooter,
} from '@/features/exams/_components/dialogs/exam-assign/components';

export type ExamAssignDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    examTitle: string;
};

export function ExamAssignDialog({ open, onOpenChange, examTitle }: ExamAssignDialogProps) {
    const {
        // State
        selectedStudents,
        searchQuery,
        sectionFilter,
        subjectFilter,
        expandedSections,

        // Data
        allSections,
        allSubjects,
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
    } = useExamAssignment(onOpenChange);

    const hasActiveFilters = Boolean(
        sectionFilter !== 'all' || subjectFilter !== 'all' || searchQuery,
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Assign Exam</DialogTitle>
                    <DialogDescription>
                        Assign detailed access for <strong>{examTitle}</strong>.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <ExamAssignFilters
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        subjectFilter={subjectFilter}
                        setSubjectFilter={setSubjectFilter}
                        sectionFilter={sectionFilter}
                        setSectionFilter={setSectionFilter}
                        allSubjects={allSubjects}
                        allSections={allSections}
                    />

                    <ScrollArea className="h-[350px] rounded-md border p-2 pr-4">
                        <div className="space-y-4">
                            {sectionKeys.length === 0 ? (
                                <div className="text-muted-foreground py-8 text-center text-sm">
                                    No students found matching filters.
                                </div>
                            ) : (
                                sectionKeys.map((section) => (
                                    <ExamAssignSection
                                        key={section}
                                        section={section}
                                        students={studentsBySection[section]}
                                        selectedStudents={selectedStudents}
                                        isExpanded={expandedSections.includes(section)}
                                        onToggleExpand={toggleSectionExpand}
                                        onToggleSection={handleToggleSectionSelect}
                                        onToggleStudent={handleToggleStudent}
                                    />
                                ))
                            )}
                        </div>
                    </ScrollArea>

                    <ExamAssignFooter
                        selectedCount={selectedStudents.length}
                        hasActiveFilters={hasActiveFilters}
                        onReset={resetFilters}
                        onCancel={() => onOpenChange(false)}
                        onAssign={handleAssign}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
