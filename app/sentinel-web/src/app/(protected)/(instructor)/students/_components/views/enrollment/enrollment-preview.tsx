'use client';

import { useState } from 'react';
import { useStableValue } from '@sentinel/hooks';
import { Button } from '@sentinel/ui';
import type { StudentImportRow } from '@/app/(protected)/(instructor)/students/_types/enrollment-target';

type EnrollmentPreviewProps = {
    students: StudentImportRow[];
};

export function EnrollmentPreview({ students }: EnrollmentPreviewProps) {
    const claimedCount = useStableValue(
        () => students.filter((student) => student.claimStatus === 'CLAIMED').length,
        [students],
    );
    const skippedCount = useStableValue(
        () => students.filter((student) => student.claimStatus === 'ALREADY_ENROLLED').length,
        [students],
    );
    const unclaimedCount = useStableValue(
        () =>
            students.filter(
                (student) =>
                    student.claimStatus === 'UNCLAIMED' ||
                    student.claimStatus === 'NOT_WHITELISTED',
            ).length,
        [students],
    );
    const unverifiedCount = useStableValue(
        () => students.filter((student) => student.claimStatus === 'UNKNOWN').length,
        [students],
    );
    const [filter, setFilter] = useState<'CLAIMED' | 'SKIPPED' | 'UNCLAIMED' | 'UNVERIFIED'>(
        claimedCount > 0
            ? 'CLAIMED'
            : skippedCount > 0
              ? 'SKIPPED'
              : unclaimedCount > 0
                ? 'UNCLAIMED'
                : 'UNVERIFIED',
    );
    const effectiveFilter =
        filter === 'CLAIMED' && claimedCount === 0
            ? skippedCount > 0
                ? 'SKIPPED'
                : unclaimedCount > 0
                  ? 'UNCLAIMED'
                  : 'UNVERIFIED'
            : filter === 'SKIPPED' && skippedCount === 0
              ? unclaimedCount > 0
                  ? 'UNCLAIMED'
                  : 'UNVERIFIED'
              : filter === 'UNCLAIMED' && unclaimedCount === 0
                ? 'UNVERIFIED'
                : filter;

    const filteredStudents = useStableValue(
        () =>
            students.filter((student) =>
                effectiveFilter === 'CLAIMED'
                    ? student.claimStatus === 'CLAIMED'
                    : effectiveFilter === 'SKIPPED'
                      ? student.claimStatus === 'ALREADY_ENROLLED'
                      : effectiveFilter === 'UNCLAIMED'
                        ? student.claimStatus === 'UNCLAIMED' ||
                          student.claimStatus === 'NOT_WHITELISTED'
                        : student.claimStatus === 'UNKNOWN',
            ),
        [effectiveFilter, students],
    );

    if (students.length === 0) return null;

    return (
        <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
                <Button
                    type="button"
                    size="sm"
                    variant={effectiveFilter === 'CLAIMED' ? 'default' : 'outline'}
                    className={
                        effectiveFilter === 'CLAIMED' ? 'bg-[#323d8f] hover:bg-[#323d8f]/90' : ''
                    }
                    onClick={() => setFilter('CLAIMED')}
                >
                    Claimed ({claimedCount})
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant={effectiveFilter === 'SKIPPED' ? 'default' : 'outline'}
                    className={
                        effectiveFilter === 'SKIPPED'
                            ? 'bg-blue-600 text-white hover:bg-blue-600/90'
                            : ''
                    }
                    onClick={() => setFilter('SKIPPED')}
                >
                    Skipped ({skippedCount})
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant={effectiveFilter === 'UNCLAIMED' ? 'default' : 'outline'}
                    className={
                        effectiveFilter === 'UNCLAIMED'
                            ? 'bg-amber-600 text-white hover:bg-amber-600/90'
                            : ''
                    }
                    onClick={() => setFilter('UNCLAIMED')}
                >
                    Unclaimed ({unclaimedCount})
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant={effectiveFilter === 'UNVERIFIED' ? 'default' : 'outline'}
                    className={
                        effectiveFilter === 'UNVERIFIED'
                            ? 'bg-slate-600 text-white hover:bg-slate-600/90'
                            : ''
                    }
                    onClick={() => setFilter('UNVERIFIED')}
                >
                    Unverified ({unverifiedCount})
                </Button>
            </div>

            {filteredStudents.length === 0 ? (
                <div className="text-muted-foreground rounded-lg border border-dashed p-6 text-sm">
                    No students in this filter.
                </div>
            ) : (
                <div className="min-w-0 overflow-hidden rounded-lg border">
                    <div className="max-h-[min(42vh,24rem)] overflow-auto" data-lenis-prevent>
                        <table className="w-full min-w-[36rem] text-sm sm:min-w-[42rem]">
                            <thead className="bg-muted/50 sticky top-0">
                                <tr>
                                    <th className="text-muted-foreground px-3 py-2 text-left font-medium">
                                        Student No.
                                    </th>
                                    <th className="text-muted-foreground px-3 py-2 text-left font-medium">
                                        Name
                                    </th>
                                    <th className="text-muted-foreground hidden px-3 py-2 text-left font-medium sm:table-cell">
                                        Section
                                    </th>
                                    <th className="text-muted-foreground px-3 py-2 text-left font-medium">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-border divide-y">
                                {filteredStudents.slice(0, 10).map((student, index) => (
                                    <tr key={index}>
                                        <td className="text-foreground px-3 py-2 align-top font-mono whitespace-nowrap">
                                            {student.studentNo}
                                        </td>
                                        <td className="text-foreground min-w-[12rem] px-3 py-2 align-top break-words whitespace-normal">
                                            {student.firstName} {student.lastName}
                                        </td>
                                        <td className="text-muted-foreground hidden px-3 py-2 align-top whitespace-nowrap sm:table-cell">
                                            {student.section}
                                        </td>
                                        <td className="min-w-[10rem] px-3 py-2 align-top text-xs break-words whitespace-normal">
                                            <span
                                                className={
                                                    student.claimStatus === 'CLAIMED'
                                                        ? 'text-emerald-600'
                                                        : student.claimStatus === 'ALREADY_ENROLLED'
                                                          ? 'text-blue-600'
                                                          : student.claimStatus === 'UNKNOWN'
                                                            ? 'text-slate-600'
                                                            : 'text-amber-700'
                                                }
                                            >
                                                {student.claimStatus === 'CLAIMED'
                                                    ? 'Claimed'
                                                    : student.claimStatus === 'ALREADY_ENROLLED'
                                                      ? student.reason || 'Already enrolled'
                                                      : student.claimStatus === 'UNKNOWN'
                                                        ? student.reason ||
                                                          "Claim status couldn't be verified yet."
                                                        : student.reason || 'Unclaimed'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredStudents.length > 10 && (
                        <div className="bg-muted/50 text-muted-foreground px-3 py-2 text-center text-sm">
                            ... and {filteredStudents.length - 10} more students
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
