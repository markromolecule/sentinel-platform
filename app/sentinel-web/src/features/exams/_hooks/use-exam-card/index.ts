import { useState, useCallback } from "react";
import { useDeleteExamMutation, useUpdateExamStatusMutation } from "@sentinel/hooks";
import { toast } from "sonner";
import { Monitor, Pencil, Eye, CheckCircle, XCircle, ArchiveRestore } from "lucide-react";
import { ExamStatus } from "@sentinel/shared/types";
import type { UseExamCardProps, UseExamCardReturn, ExamPrimaryAction } from "./_types";

export function useExamCard({ exam }: UseExamCardProps): UseExamCardReturn {
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const deleteExamMutation = useDeleteExamMutation({
        onSuccess: () => {
            toast.success("Exam deleted successfully.");
            setShowDeleteAlert(false);
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to delete exam.");
            setShowDeleteAlert(false);
        },
    });
    const updateExamStatusMutation = useUpdateExamStatusMutation({
        onSuccess: () => {},
        onError: (error: Error) => {
            toast.error(error.message || "Failed to update exam status.");
        },
    });

    const handleDelete = useCallback(() => {
        deleteExamMutation.mutate(exam.id);
    }, [deleteExamMutation, exam.id]);

    const handleStatusChange = useCallback((newStatus: ExamStatus, successMessage: string) => {
        updateExamStatusMutation.mutate(
            {
                id: exam.id,
                status: newStatus,
            },
            {
                onSuccess: () => {
                    toast.success(successMessage);
                },
            },
        );
    }, [exam.id, updateExamStatusMutation]);

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
        showPreview,
        setShowPreview,
        handleDelete,
        primaryActions: getPrimaryActions(),
        statusClass,
    };
}
