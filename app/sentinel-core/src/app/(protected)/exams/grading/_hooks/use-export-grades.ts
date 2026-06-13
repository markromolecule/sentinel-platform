import { useCallback } from 'react';
import * as XLSX from 'xlsx';
import { GradingStudent } from '@sentinel/shared/types';

export function useExportGrades() {
    const exportToExcel = useCallback(
        (data: GradingStudent[], examTitle: string, sectionName?: string) => {
            const sortedData = [...data].sort((a, b) => a.name.localeCompare(b.name));
            const excelData = sortedData.map((student) => ({
                Name: student.name,
                'Student ID': student.studentId,
                Section: student.sectionName ?? 'N/A',
                Status: student.status,
                Score: student.score ?? 'N/A',
                'Max Score': student.maxScore,
                Feedback: student.feedback ?? '',
                'Submission Date': student.submissionDate ?? 'N/A',
            }));
            const worksheet = XLSX.utils.json_to_sheet(excelData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Grades');

            const fileLabel = [examTitle, sectionName].filter(Boolean).join('_');
            XLSX.writeFile(workbook, `${fileLabel.replace(/\s+/g, '_')}_Grades.xlsx`);
        },
        [],
    );

    return { exportToExcel };
}
