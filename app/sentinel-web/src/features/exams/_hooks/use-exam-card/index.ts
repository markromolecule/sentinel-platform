import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Monitor, Pencil, Eye, CheckCircle, XCircle, ArchiveRestore } from "lucide-react";
import { ProctorExam, ExamStatus } from "@sentinel/shared/types";
import type { UseExamCardProps, UseExamCardReturn, ExamPrimaryAction } from "./_types";

export function useExamCard({ exam }: UseExamCardProps): UseExamCardReturn {
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);

    const handleDelete = useCallback(() => {
        const localExamsRaw = localStorage.getItem('sentinel_mock_exams');
        if (localExamsRaw) {
            const localExams: ProctorExam[] = JSON.parse(localExamsRaw);
            const initialLength = localExams.length;
            const updatedExams = localExams.filter((e) => e.id !== exam.id);
            if (updatedExams.length < initialLength) {
                localStorage.setItem('sentinel_mock_exams', JSON.stringify(updatedExams));
                window.dispatchEvent(new Event('sentinel_mock_exams_updated'));
                toast.success("Exam deleted successfully.");
                setShowDeleteAlert(false);
                return;
            }
        }
        toast.error("Cannot delete read-only mock exams.");
        setShowDeleteAlert(false);
    }, [exam.id]);

    const handleStatusChange = useCallback((newStatus: ExamStatus, successMessage: string) => {
        const localExamsRaw = localStorage.getItem('sentinel_mock_exams');
        if (localExamsRaw) {
            const localExams: ProctorExam[] = JSON.parse(localExamsRaw);
            const index = localExams.findIndex((e) => e.id === exam.id);
            if (index !== -1) {
                const updatedExams = localExams.map((e) =>
                    e.id === exam.id ? { ...e, status: newStatus } : e
                );
                localStorage.setItem('sentinel_mock_exams', JSON.stringify(updatedExams));
                window.dispatchEvent(new Event('sentinel_mock_exams_updated'));
                toast.success(successMessage);
                return;
            }
        }
        toast.error("Cannot modify read-only mock exams.");
    }, [exam.id]);

    const getPrimaryActions = useCallback((): ExamPrimaryAction[] => {
        const monitorStatuses = new Set(["published", "active", "in-progress"]);
        const actions: ExamPrimaryAction[] = [];

        if (exam.status === "draft") {
            actions.push({
                label: "Edit",
                href: `/exams/${exam.id}/builder`,
                icon: Pencil,
                variant: "outline",
            });
            actions.push({
                label: "Publish",
                onClick: () => handleStatusChange("published", "Exam published successfully!"),
                icon: CheckCircle,
                variant: "default",
            });
            return actions;
        }

        if (monitorStatuses.has(exam.status)) {
            actions.push({
                label: "Unpublish",
                onClick: () => handleStatusChange("draft", "Exam unpublished successfully."),
                icon: XCircle,
                variant: "outline",
            });
            actions.push({
                label: "Monitor",
                href: `/exams/${exam.id}/monitoring`,
                icon: Monitor,
                variant: "default",
            });
            return actions;
        }

        if (exam.status === "archived") {
            actions.push({
                label: "View",
                href: `/exams/${exam.id}/builder`,
                icon: Eye,
                variant: "outline",
            });
            actions.push({
                label: "Unarchive",
                onClick: () => handleStatusChange("draft", "Exam unarchived successfully."),
                icon: ArchiveRestore,
                variant: "default",
            });
            return actions;
        }

        actions.push({
            label: "View",
            href: `/exams/${exam.id}/builder`,
            icon: Eye,
            variant: "outline",
        });
        return actions;
    }, [exam.id, exam.status, handleStatusChange]);

    const statusClass =
        exam.status === "active" || exam.status === "published" || exam.status === "in-progress"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : exam.status === "draft"
                ? "border-amber-200 bg-amber-50 text-amber-700"
                : "border-border text-muted-foreground";

    return {
        showDeleteAlert,
        setShowDeleteAlert,
        handleDelete,
        primaryActions: getPrimaryActions(),
        statusClass,
    };
}
