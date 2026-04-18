'use client';

import { useExamList } from '@/app/(protected)/student/exam/_hooks/use-exam-list';
import { ExamHeader } from '@/app/(protected)/student/exam/_components/exam-header';
import { ExamSearch } from '@/app/(protected)/student/exam/_components/exam-search';
import { ExamDateGroups } from '@/app/(protected)/student/exam/_components/exam-date-groups';

export default function StudentExamPage() {
    const { searchQuery, setSearchQuery, groupedExams, isLoading } = useExamList();

    const emptyMessage = searchQuery
        ? `No results found for "${searchQuery}". Try a different search term.`
        : "You don't have any exams in this category yet.";

    return (
        <div className="w-full space-y-8">
            {/* Hero / Welcome Section */}
            <ExamHeader />

            {/* Main Content Area */}
            <div className="space-y-6">
                {/* Search Bar */}
                <ExamSearch value={searchQuery} onChange={setSearchQuery} />

                {/* Content List */}
                {isLoading ? (
                    <div className="bg-muted/40 border-border/60 rounded-2xl border px-6 py-16 text-center">
                        <p className="text-sm font-medium">Loading assigned exams...</p>
                        <p className="text-muted-foreground mt-2 text-sm">
                            Preparing your current exam list.
                        </p>
                    </div>
                ) : (
                    <ExamDateGroups groups={groupedExams} emptyMessage={emptyMessage} />
                )}
            </div>
        </div>
    );
}
