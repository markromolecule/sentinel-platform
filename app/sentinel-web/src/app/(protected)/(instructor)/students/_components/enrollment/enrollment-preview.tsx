'use client';

import { ParsedStudent } from '@sentinel/shared/types';

type EnrollmentPreviewProps = {
    students: ParsedStudent[];
};

export function EnrollmentPreview({ students }: EnrollmentPreviewProps) {
    if (students.length === 0) return null;

    return (
        <div className="max-h-60 overflow-hidden overflow-y-auto rounded-lg border">
            <table className="w-full text-sm">
                <thead className="bg-muted/50 sticky top-0">
                    <tr>
                        <th className="text-muted-foreground px-3 py-2 text-left font-medium">
                            Student No.
                        </th>
                        <th className="text-muted-foreground px-3 py-2 text-left font-medium">
                            Name
                        </th>
                        <th className="text-muted-foreground hidden px-3 py-2 text-left font-medium sm:table-cell">
                            Section
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-border divide-y">
                    {students.slice(0, 10).map((student, index) => (
                        <tr key={index}>
                            <td className="text-foreground px-3 py-2 font-mono">
                                {student.studentNo}
                            </td>
                            <td className="text-foreground px-3 py-2">
                                {student.firstName} {student.lastName}
                            </td>
                            <td className="text-muted-foreground hidden px-3 py-2 sm:table-cell">
                                {student.section}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {students.length > 10 && (
                <div className="bg-muted/50 text-muted-foreground px-3 py-2 text-center text-sm">
                    ... and {students.length - 10} more students
                </div>
            )}
        </div>
    );
}
