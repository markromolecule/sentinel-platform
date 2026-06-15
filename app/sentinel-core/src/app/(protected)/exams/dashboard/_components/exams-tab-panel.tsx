'use client';

import {
    ExamCard,
    ExamEmptyState,
    ExamListItem,
    ExamsPagination,
    type ExamsViewMode,
} from '@/features/exams';
import { type Exam } from '@sentinel/shared/types';
import {
    COLUMN_VIEW_CLASS_NAME,
    LIST_VIEW_CLASS_NAME,
    TAB_PANEL_CLASS_NAME,
    EXAMS_PER_PAGE,
    type ExamTabKey,
} from '../_constants';

interface ExamsTabPanelProps {
    tab: ExamTabKey;
    exams: Exam[];
    viewMode: ExamsViewMode;
    currentPage: number;
    pageCount: number;
    onPageChange: (page: number) => void;
    onCreateClick: () => void;
}

export function ExamsTabPanel({
    tab,
    exams,
    viewMode,
    currentPage,
    pageCount,
    onPageChange,
    onCreateClick,
}: ExamsTabPanelProps) {
    const startIndex = (currentPage - 1) * EXAMS_PER_PAGE;
    const paginatedExams = exams.slice(startIndex, startIndex + EXAMS_PER_PAGE);

    return (
        <div className={TAB_PANEL_CLASS_NAME}>
            {exams.length > 0 ? (
                <>
                    <div
                        className={
                            viewMode === 'grid' ? COLUMN_VIEW_CLASS_NAME : LIST_VIEW_CLASS_NAME
                        }
                    >
                        {paginatedExams.map((exam: Exam) =>
                            viewMode === 'grid' ? (
                                <ExamCard key={exam.id} exam={exam as any} />
                            ) : (
                                <ExamListItem key={exam.id} exam={exam as any} />
                            ),
                        )}
                    </div>
                    <ExamsPagination
                        page={currentPage}
                        pageCount={pageCount}
                        pageSize={EXAMS_PER_PAGE}
                        totalCount={exams.length}
                        onPageChange={onPageChange}
                    />
                </>
            ) : (
                <ExamEmptyState isSearching={false} variant={tab} onCreateClick={onCreateClick} />
            )}
        </div>
    );
}
