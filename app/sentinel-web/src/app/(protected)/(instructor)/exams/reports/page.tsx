'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useExamsQuery } from '@sentinel/hooks';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@sentinel/ui';
import { ArrowLeft, CalendarDays, FileText, Users } from 'lucide-react';
import { ExamsPagination } from '@/features/exams/_components/views/exams-pagination';

function formatDateTime(value?: string | null) {
    if (!value) {
        return 'No schedule';
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'No schedule' : date.toLocaleString();
}

export default function ExamReportsIndexPage() {
    const { data: exams = [], isLoading } = useExamsQuery();
    const [page, setPage] = useState(1);
    const pageSize = 9;

    const reportableExams = useMemo(
        () =>
            exams.filter(
                (exam) => exam.publishedAt || exam.attemptId || exam.studentsCount != null,
            ),
        [exams],
    );

    const pageCount = Math.max(1, Math.ceil(reportableExams.length / pageSize));
    const safePage = Math.min(page, pageCount);

    const visibleExams = useMemo(() => {
        const startIndex = (safePage - 1) * pageSize;
        return reportableExams.slice(startIndex, startIndex + pageSize);
    }, [safePage, pageSize, reportableExams]);

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                    <div className="text-muted-foreground text-sm">Exams / Reports</div>
                    <div className="flex items-center gap-3">
                        <FileText className="h-6 w-6 text-slate-500" />
                        <div>
                            <h1 className="text-3xl font-semibold tracking-tight">Exam Reports</h1>
                            <p className="text-muted-foreground">
                                Open a report summary first, then drill into each student attempt.
                            </p>
                        </div>
                    </div>
                </div>
                <Button variant="outline" asChild>
                    <Link href="/exams">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Exams
                    </Link>
                </Button>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {isLoading
                    ? Array.from({ length: 6 }).map((_, index) => (
                          <div key={index} className="bg-muted h-36 animate-pulse rounded-xl" />
                      ))
                    : visibleExams.map((exam) => (
                          <Card
                              key={exam.id}
                              className="border-border/70 overflow-hidden shadow-sm"
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
                              <CardContent className="space-y-3 pt-0">
                                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                                      <CalendarDays className="h-4 w-4" />
                                      <span>Scheduled {formatDateTime(exam.scheduledDate)}</span>
                                  </div>
                                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                                      <Users className="h-4 w-4" />
                                      <span>{exam.studentsCount ?? 0} student attempts</span>
                                  </div>
                                  <Button asChild className="mt-1 w-full">
                                      <Link href={`/exams/${exam.id}/report`}>
                                          Open Report Summary
                                      </Link>
                                  </Button>
                              </CardContent>
                          </Card>
                      ))}
            </div>

            {!isLoading ? (
                <ExamsPagination
                    page={safePage}
                    pageCount={pageCount}
                    pageSize={pageSize}
                    totalCount={reportableExams.length}
                    onPageChange={setPage}
                />
            ) : null}
        </div>
    );
}
