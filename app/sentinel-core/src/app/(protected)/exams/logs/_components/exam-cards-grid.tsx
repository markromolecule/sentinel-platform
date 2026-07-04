'use client';

import React from 'react';
import { CalendarDays, Search, ShieldAlert, Users } from 'lucide-react';
import { Input, Button, Badge, Card, CardContent, CardHeader, CardTitle } from '@sentinel/ui';
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
    const formatDateTime = (value?: string | null) => {
        if (!value) {
            return 'No schedule';
        }

        const date = new Date(value);

        return Number.isNaN(date.getTime()) ? 'No schedule' : date.toLocaleString();
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                    <h1 className="text-3xl font-semibold tracking-tight">
                        Incident Logs & Analytics
                    </h1>
                    <p className="text-muted-foreground">
                        Review, confirm, or dismiss proctoring telemetry alerts recorded during
                        examinations.
                    </p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                        placeholder="Search exam logs..."
                        value={searchValue}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            {exams.length === 0 ? (
                <div className="text-muted-foreground py-12 text-center">No exam logs found.</div>
            ) : (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {exams.map((exam) => (
                        <Card
                            key={exam.id}
                            className="border-border/70 flex h-full flex-col overflow-hidden shadow-sm"
                            data-testid={`exam-card-${exam.id}`}
                            onClick={() => onSelectExam(exam.id)}
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
                                        {exam.questionCount ?? 0} Qs
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
                                    <div className="text-muted-foreground flex items-center gap-2 text-sm">
                                        <ShieldAlert className="h-4 w-4" />
                                        <span>{exam.incidentCount ?? 0} incident alerts</span>
                                    </div>
                                </div>
                                <div className="mt-auto flex flex-col gap-2">
                                    <Button
                                        className="w-full"
                                        onClick={() => onSelectExam(exam.id)}
                                    >
                                        Open Incident Logs
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
