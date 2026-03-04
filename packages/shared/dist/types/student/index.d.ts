import { Exam, ExamStatus, ExamDifficulty, ExamHistory, Student as SharedStudent } from '../index';
export type { Exam, ExamStatus, ExamDifficulty, ExamHistory };
export interface StudentInfo extends SharedStudent {
    email: string;
    firstName: string;
    lastName: string;
    /** @deprecated Use studentNo from SharedStudent */
    studentNumber?: string;
    /** @deprecated Use departmentId or fetch relationship */
    department?: string;
    /** @deprecated Use institutionId or fetch relationship */
    institution?: string;
    /** @deprecated Use avatarUrl from User */
    avatar?: string;
    /** @deprecated Use createdAt from User */
    enrollmentDate?: string;
}
export interface DashboardStats {
    totalExams: number;
    completedExams: number;
    pendingExams: number;
    averageScore: number;
}
export interface ExamListProps {
    exams: Exam[];
    emptyMessage: string;
}
export interface ExamPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}
export interface ExamSearchProps {
    value: string;
    onChange: (value: string) => void;
}
export interface ExamTabsProps {
    activeTab: 'available' | 'history';
    onTabChange: (tab: 'available' | 'history') => void;
}
export interface ExamSidebarProps {
    exam: Exam;
}
export interface ExamNotFoundProps {
    onBack: () => void;
}
export interface ExamInfoBarProps {
    exam: Exam;
}
export interface ExamDescriptionProps {
    description: string;
}
export interface ExamBannerProps {
    exam: Exam;
}
export interface ExamCardProps {
    exam: Exam;
}
export interface NavigationItem {
    label: string;
    href: string;
    icon: string;
}
//# sourceMappingURL=index.d.ts.map