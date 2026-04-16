import { Checkbox, Label } from '@sentinel/ui';

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

export function ExamAssignStudentItem({
    student,
    isSelected,
    onToggle,
}: ExamAssignStudentItemProps) {
    return (
        <div className="hover:bg-muted/30 group flex items-center justify-between rounded-sm p-1.5">
            <div className="flex items-center space-x-2">
                <Checkbox id={student.id} checked={isSelected} onCheckedChange={onToggle} />
                <Label
                    htmlFor={student.id}
                    className="flex w-full cursor-pointer flex-col text-sm font-normal sm:flex-row sm:items-center sm:gap-2"
                >
                    <span>
                        {student.lastName}, {student.firstName}
                    </span>
                </Label>
            </div>
            <span className="text-muted-foreground font-mono text-xs">{student.studentNo}</span>
        </div>
    );
}
