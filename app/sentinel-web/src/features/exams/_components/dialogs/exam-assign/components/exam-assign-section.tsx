import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button, Checkbox, Label, Badge } from '@sentinel/ui';
import { ExamAssignStudentItem } from './exam-assign-student-item';

interface Student {
    id: string;
    firstName: string;
    lastName: string;
    studentNo: string;
    section: string;
    subject: string;
}

interface ExamAssignSectionProps {
    section: string;
    students: Student[];
    selectedStudents: string[];
    isExpanded: boolean;
    onToggleExpand: (section: string) => void;
    onToggleSection: (section: string, studentIds: string[]) => void;
    onToggleStudent: (studentId: string) => void;
}

export function ExamAssignSection({
    section,
    students,
    selectedStudents,
    isExpanded,
    onToggleExpand,
    onToggleSection,
    onToggleStudent,
}: ExamAssignSectionProps) {
    const allSectionSelected = students.every((s) => selectedStudents.includes(s.id));
    const someSelected = students.some((s) => selectedStudents.includes(s.id));
    const selectedCount = students.filter((s) => selectedStudents.includes(s.id)).length;

    return (
        <div className="bg-background space-y-2 overflow-hidden rounded-md border">
            {/* Section Header */}
            <div className="bg-muted/30 hover:bg-muted/50 flex items-center justify-between p-2 transition-colors">
                <div className="flex items-center space-x-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => onToggleExpand(section)}
                    >
                        {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                        ) : (
                            <ChevronRight className="h-4 w-4" />
                        )}
                    </Button>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id={`section-${section}`}
                            checked={allSectionSelected}
                            onCheckedChange={() =>
                                onToggleSection(
                                    section,
                                    students.map((s) => s.id),
                                )
                            }
                        />
                        <Label
                            htmlFor={`section-${section}`}
                            className="cursor-pointer font-semibold select-none"
                        >
                            {section}
                            <span className="text-muted-foreground ml-2 text-xs font-normal">
                                ({students.length} students)
                            </span>
                        </Label>
                    </div>
                </div>
                {someSelected && !allSectionSelected && (
                    <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                        {selectedCount} selected
                    </Badge>
                )}
            </div>

            {/* Student List (Collapsible) */}
            {isExpanded && (
                <div className="animate-in slide-in-from-top-1 space-y-2 pr-2 pb-2 pl-11 duration-200">
                    {students.map((student) => (
                        <ExamAssignStudentItem
                            key={student.id}
                            student={student}
                            isSelected={selectedStudents.includes(student.id)}
                            onToggle={() => onToggleStudent(student.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
