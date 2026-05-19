'use client';

import { type ClassroomDetail } from '@sentinel/shared/types';
import { Badge } from '@sentinel/ui';
import { BookOpen, GraduationCap, Users } from 'lucide-react';

type ClassroomOverviewStripProps = {
    classroom?: ClassroomDetail;
    isLoading?: boolean;
};

function getDepartmentCode(classroom?: ClassroomDetail) {
    return classroom?.departmentCode ?? classroom?.scopeSummary.departmentLabel ?? null;
}

export function ClassroomOverviewStrip({
    classroom,
    isLoading = false,
}: ClassroomOverviewStripProps) {
    const departmentCode = getDepartmentCode(classroom);
    const courseMeta = [classroom?.courseCode, classroom?.courseTitle].filter(Boolean).join(' - ');

    return (
        <div className="bg-border grid gap-px overflow-hidden rounded-xl border lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_220px]">
            <div className="bg-background min-w-0 space-y-3 p-4">
                <div className="text-muted-foreground flex items-center gap-2 text-xs tracking-[0.16em] uppercase">
                    <BookOpen className="h-3.5 w-3.5" />
                    Subject
                </div>
                <div
                    className="truncate text-base font-semibold"
                    title={classroom?.scopeSummary.subjectLabel ?? undefined}
                >
                    {classroom?.scopeSummary.subjectLabel ||
                        (isLoading ? 'Loading...' : 'No subject')}
                </div>
                <div
                    className="text-muted-foreground truncate text-sm"
                    title={classroom?.scopeSummary.termLabel ?? undefined}
                >
                    {classroom?.scopeSummary.termLabel || 'No term assigned'}
                </div>
            </div>

            <div className="bg-background min-w-0 space-y-3 p-4">
                <div className="text-muted-foreground flex items-center gap-2 text-xs tracking-[0.16em] uppercase">
                    <GraduationCap className="h-3.5 w-3.5" />
                    Section
                </div>
                <div
                    className="truncate text-base font-semibold"
                    title={classroom?.sectionName ?? undefined}
                >
                    {classroom?.sectionName || (isLoading ? 'Loading...' : 'Unassigned')}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {departmentCode ? (
                        <Badge variant="secondary" className="uppercase">
                            {departmentCode}
                        </Badge>
                    ) : null}
                    {classroom?.scopeSummary.yearLevelLabel ? (
                        <Badge variant="outline">{classroom.scopeSummary.yearLevelLabel}</Badge>
                    ) : null}
                </div>
                <div
                    className="text-muted-foreground truncate text-sm"
                    title={courseMeta || undefined}
                >
                    {courseMeta || 'No course metadata'}
                </div>
            </div>

            <div className="bg-background flex min-w-0 flex-col justify-between p-4">
                <div className="text-muted-foreground flex items-center gap-2 text-xs tracking-[0.16em] uppercase">
                    <Users className="h-3.5 w-3.5" />
                    Students
                </div>
                <div className="text-3xl font-semibold">{classroom?.studentCount ?? 0}</div>
                <div className="text-muted-foreground text-sm">
                    Active roster entries in this classroom
                </div>
            </div>
        </div>
    );
}
