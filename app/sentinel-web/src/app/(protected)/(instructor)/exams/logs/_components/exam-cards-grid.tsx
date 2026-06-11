'use client';

import React, { useState, useMemo } from 'react';
import { Search, Users, ShieldAlert, GraduationCap, ArrowRight } from 'lucide-react';
import { Input, Button, Badge } from '@sentinel/ui';
import type { ProctorExam } from '@sentinel/shared/types';

export interface ExamCardsGridProps {
    exams: ProctorExam[];
    onSelectExam: (examId: string) => void;
}

export function ExamCardsGrid({ exams = [], onSelectExam }: ExamCardsGridProps) {
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const filteredExams = useMemo(() => {
        return exams.filter((exam) => {
            const query = search.toLowerCase();
            return (
                exam.title.toLowerCase().includes(query) ||
                (exam.subject && exam.subject.toLowerCase().includes(query))
            );
        });
    }, [exams, search]);

    // Reset pagination to page 1 when search query changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [search]);

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
                    className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
                };
            case 'completed':
                return {
                    label: 'Completed',
                    className: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20',
                };
            case 'draft':
                return {
                    label: 'Draft',
                    className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
                };
            default:
                return {
                    label: status || 'Upcoming',
                    className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
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
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-11 rounded-xl shadow-xs"
                />
            </div>

            {paginatedExams.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border rounded-2xl bg-card/50">
                    <GraduationCap className="h-12 w-12 text-muted-foreground/50 mb-3" />
                    <h3 className="text-lg font-semibold text-foreground">No exams found</h3>
                    <p className="text-sm text-muted-foreground max-w-xs mt-1">
                        Try adjusting your search query to find your classroom examinations.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {paginatedExams.map((exam) => {
                            const statusConfig = getStatusConfig(exam.status);
                            const hasIncidents = (exam.incidentCount ?? 0) > 0;

                            return (
                                <div
                                    key={exam.id}
                                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-foreground/25 cursor-pointer"
                                    onClick={() => onSelectExam(exam.id)}
                                    data-testid={`exam-card-${exam.id}`}
                                >
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center justify-between">
                                            <Badge variant="outline" className={statusConfig.className}>
                                                {statusConfig.label}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                                {exam.subject || 'General'}
                                            </span>
                                        </div>

                                        <div>
                                            <h3 className="font-semibold text-foreground text-lg group-hover:text-primary transition-colors line-clamp-1">
                                                {exam.title}
                                            </h3>
                                            {exam.description && (
                                                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                                    {exam.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-4 mt-6">
                                        <div className="flex items-center justify-between border-t border-border/60 pt-4 text-sm">
                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                                <Users className="h-4 w-4" />
                                                <span>{exam.studentsCount ?? 0} students</span>
                                            </div>

                                            <div className="flex items-center gap-1.5">
                                                <ShieldAlert className={`h-4 w-4 ${hasIncidents ? 'text-destructive' : 'text-muted-foreground/75'}`} />
                                                <span className={hasIncidents ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                                                    {exam.incidentCount ?? 0} alerts
                                                </span>
                                            </div>
                                        </div>

                                        <Button
                                            variant="secondary"
                                            className="w-full gap-2 rounded-xl transition-all duration-300"
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
                        <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-border/40">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentPage((prev) => Math.max(1, prev - 1));
                                }}
                                disabled={currentPage === 1}
                                className="rounded-xl h-9"
                            >
                                Previous
                            </Button>
                            <span className="text-sm text-muted-foreground min-w-[80px] text-center">
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
                                className="rounded-xl h-9"
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
