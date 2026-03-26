import { Checkbox, Label } from "@sentinel/ui";

interface Student {
    id: string;
    firstName: string;
    lastName: string;
    studentNo: string;
}

interface ExamAssignStudentItemProps {
    student: Student;
    isSelected: boolean;
    onToggle: () => void;
}

export function ExamAssignStudentItem({ student, isSelected, onToggle }: ExamAssignStudentItemProps) {
    return (
        <div
            className="flex items-center justify-between p-1.5 rounded-sm hover:bg-muted/30 group"
        >
            <div className="flex items-center space-x-2">
                <Checkbox
                    id={student.id}
                    checked={isSelected}
                    onCheckedChange={onToggle}
                />
                <Label
                    htmlFor={student.id}
                    className="text-sm font-normal cursor-pointer w-full flex flex-col sm:flex-row sm:items-center sm:gap-2"
                >
                    <span>{student.lastName}, {student.firstName}</span>
                </Label>
            </div>
            <span className="text-xs text-muted-foreground font-mono">
                {student.studentNo}
            </span>
        </div>
    );
}
