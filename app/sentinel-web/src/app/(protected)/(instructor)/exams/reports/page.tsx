'use client';

import Link from 'next/link';
import { useDeferredValue, useState } from 'react';
import { useExamReportsListQuery } from '@sentinel/hooks';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input } from '@sentinel/ui';
import { CalendarDays, FileText, Search, Users } from 'lucide-react';
import { ExamsPagination } from '@/features/exams/_components/views/exams-pagination';

function formatDateTime(value?: string | null) {
    if (!value) {
        return 'No schedule';
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'No schedule' : date.toLocaleString();
}

export default function ExamReportsIndexPage() {
    const [page, setPage] = useState(1);
    const [searchValue, setSearchValue] = useState('');
    const deferredSearch = useDeferredValue(searchValue);
    const pageSize = 6;

    const { data, isLoading } = useExamReportsListQuery({
        page,
        limit: pageSize,
        search: deferredSearch.trim() || undefined,
    });

    const reportableExams = data?.data ?? [];
    const totalCount = data?.meta?.total ?? 0;
    const pageCount = data?.meta?.totalPages ?? 1;

    const handleSearchChange = (val: string) => {
        setSearchValue(val);
        setPage(1);
    };

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 md:p-6 self-center">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div>
                            <h1 className="text-3xl font-semibold tracking-tight">Exam Reports</h1>
                            <p className="text-muted-foreground">
                                View and analyze exam reports and incident logs.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                        value={searchValue}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder="Search exam reports..."
                        className="pl-9"
                    />
                </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {isLoading
                    ? Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="bg-muted h-36 animate-pulse rounded-xl" />
                    ))
                    : reportableExams.map((exam) => (
                        <Card
                            key={exam.id}
                            className="border-border/70 flex h-full flex-col overflow-hidden shadow-sm"
                        >
                            <CardHeader className="space-y-3 pb-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 space-y-1">
                                        <CardTitle className="line-clamp-2 text-lg">
                                            {exam.title}
                                        </CardTitle>
                                        <p className="text-muted-foreground line-clamp-2 text-sm">
                                            {exam.subject}
                                        </p>
                                    </div>
                                    <Badge variant="secondary" className="shrink-0">
                                        {exam.questionCount} Qs
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="flex flex-1 flex-col justify-between gap-3 pt-0">
                                <div className="space-y-3">
                                    <div className="text-muted-foreground flex items-center gap-2 text-sm">
                                        <CalendarDays className="h-4 w-4" />
                                        <span>Scheduled {formatDateTime(exam.scheduledDate)}</span>
                                    </div>
                                    <div className="text-muted-foreground flex items-center gap-2 text-sm">
                                        <Users className="h-4 w-4" />
                                        <span>{exam.studentsCount ?? 0} student attempts</span>
                                    </div>
                                </div>
                                <div className="mt-auto flex flex-col gap-2">
                                    <Button asChild className="w-full">
                                        <Link href={`/exams/reports/${exam.id}`}>
                                            Report Summary
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
            </div>

            {!isLoading && reportableExams.length === 0 && (
                <div className="text-muted-foreground py-12 text-center">
                    No exam reports found.
                </div>
            )}

            {!isLoading && reportableExams.length > 0 ? (
                <ExamsPagination
                    page={page}
                    pageCount={pageCount}
                    pageSize={pageSize}
                    totalCount={totalCount}
                    onPageChange={setPage}
                />
            ) : null}
        </div>
    );
}
