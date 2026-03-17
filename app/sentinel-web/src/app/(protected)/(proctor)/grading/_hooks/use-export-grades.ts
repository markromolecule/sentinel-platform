
import { useCallback } from "react";
import * as XLSX from "xlsx";
import { GradingStudent } from '@sentinel/shared/types';;

export function useExportGrades() {
    const exportToExcel = useCallback((data: GradingStudent[], examTitle: string) => {
        // Sort data alphabetically by name
        const sortedData = [...data].sort((a, b) => a.name.localeCompare(b.name));

        // Format data for Excel
        const excelData = sortedData.map((student) => ({
            Name: student.name,
            "Student ID": student.studentId,
            Status: student.status,
            Score: student.score ?? "N/A",
            "Max Score": student.maxScore,
            Feedback: student.feedback ?? "",
            "Submission Date": student.submissionDate ?? "N/A",
        }));

        // Create worksheet
        const ws = XLSX.utils.json_to_sheet(excelData);
        const csv = XLSX.utils.sheet_to_csv(ws);

        // Create blob and download
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `${examTitle.replace(/\s+/g, "_")}_Grades.csv`);
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }, []);

    return { exportToExcel };
}
