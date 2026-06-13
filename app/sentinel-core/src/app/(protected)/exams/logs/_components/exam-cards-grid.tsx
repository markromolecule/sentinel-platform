'use client';

import React, { useState, useMemo } from 'react';
import { Search, Users, ShieldAlert, GraduationCap, ArrowRight } from 'lucide-react';
import { Input, Button, Badge } from '@sentinel/ui';
import type { ProctorExam } from '@sentinel/shared/types';

export interface ExamCardsGridProps {
    exams: ProctorExam[];
    onSelectExam: (examId: string) => void;
    searchValue: string;
    onSearchChange: (value: string) => void;
}

export function ExamCardsGrid({
    exams = [],
    onSelectExam,
    searchValue,
    onSearchChange,
}: ExamCardsGridProps) {
    const [currentPage, setCurrentPage] = useState(1);

    const filteredExams = exams;

    // Reset pagination to page 1 when search query changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchValue]);

    const itemsPerPage = 6;
    const totalPages = Math.ceil(filteredExams.length / itemsPerPage);

    const paginatedExams = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredExams.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredExams, currentPage]);

    const getStatusConfig = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'active':
            case 'published':
                return {
                    label: 'Active',
                    className:
                        'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
                };
            case 'completed':
                return {
                    label: 'Completed',
                    className:
                        'bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20',
                };
            case 'draft':
                return {
                    label: 'Draft',
                    className:
                        'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
                };
            default:
                return {
                    label: status || 'Upcoming',
                    className:
                        'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
                };
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Search and Filters Bar */}
            <div className="relative flex-1">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                    placeholder="Search exams by title or subject..."
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="h-11 rounded-md pl-9 shadow-xs"
                />
            </div>

            {paginatedExams.length === 0 ? (
                <div className="border-border bg-card/50 flex flex-col items-center justify-center rounded-md border border-dashed py-16 text-center">
                    <GraduationCap className="text-muted-foreground/50 mb-3 h-12 w-12" />
                    <h3 className="text-foreground text-lg font-semibold">No exams found</h3>
                    <p className="text-muted-foreground mt-1 max-w-xs text-sm">
                        Try adjusting your search query to find your classroom examinations.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {paginatedExams.map((exam) => {
                            const statusConfig = getStatusConfig(exam.status);
                            const hasIncidents = (exam.incidentCount ?? 0) > 0;

                            return (
                                <div
                                    key={exam.id}
                                    className="group border-border bg-card hover:border-foreground/25 relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-md border p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md"
                                    onClick={() => onSelectExam(exam.id)}
                                    data-testid={`exam-card-${exam.id}`}
                                >
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center justify-between">
                                            <Badge
                                                variant="outline"
                                                className={statusConfig.className}
                                            >
                                                {statusConfig.label}
                                            </Badge>
                                            <span className="text-muted-foreground text-xs">
                                                {exam.subject || 'General'}
                                            </span>
                                        </div>

                                        <div>
                                            <h3 className="text-foreground group-hover:text-primary line-clamp-1 text-lg font-semibold transition-colors">
                                                {exam.title}
                                            </h3>
                                            {exam.description && (
                                                <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                                                    {exam.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-6 flex flex-col gap-4">
                                        <div className="border-border/60 flex items-center justify-between border-t pt-4 text-sm">
                                            <div className="text-muted-foreground flex items-center gap-1.5">
                                                <Users className="h-4 w-4" />
                                                <span>{exam.studentsCount ?? 0} students</span>
                                            </div>

                                            <div className="flex items-center gap-1.5">
                                                <ShieldAlert
                                                    className={`h-4 w-4 ${hasIncidents ? 'text-destructive' : 'text-muted-foreground/75'}`}
                                                />
                                                <span
                                                    className={
                                                        hasIncidents
                                                            ? 'text-destructive font-medium'
                                                            : 'text-muted-foreground'
                                                    }
                                                >
                                                    {exam.incidentCount ?? 0} alerts
                                                </span>
                                            </div>
                                        </div>

                                        <Button
                                            variant="secondary"
                                            className="group-hover:bg-primary group-hover:text-primary-foreground hover:bg-primary hover:text-primary-foreground w-full gap-2 rounded-md transition-all duration-300"
                                        >
                                            Review Logs
                                            <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="border-border/40 mt-4 flex items-center justify-center gap-4 border-t pt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentPage((prev) => Math.max(1, prev - 1));
                                }}
                                disabled={currentPage === 1}
                                className="h-9 rounded-md"
                            >
                                Previous
                            </Button>
                            <span className="text-muted-foreground min-w-[80px] text-center text-sm">
                                Page {currentPage} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
                                }}
                                disabled={currentPage === totalPages}
                                className="h-9 rounded-md"
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
