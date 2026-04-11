import { ExamCardProps } from '@sentinel/shared/types';
import { LucideIcon } from 'lucide-react';

export interface UseExamCardProps {
    exam: ExamCardProps['exam'];
}

export interface ExamPrimaryAction {
    label: string;
    href?: string;
    onClick?: () => void;
    icon: LucideIcon;
    variant?: "default" | "outline" | "secondary" | "destructive" | "ghost" | "link";
    disabled?: boolean;
    isLoading?: boolean;
}

export interface UseExamCardReturn {
    showDeleteAlert: boolean;
    setShowDeleteAlert: (show: boolean) => void;
    showPreview: boolean;
    setShowPreview: (show: boolean) => void;
    showEdit: boolean;
    setShowEdit: (show: boolean) => void;
    handleDelete: () => void;
    primaryActions: ExamPrimaryAction[];
    statusClass: string;
}
