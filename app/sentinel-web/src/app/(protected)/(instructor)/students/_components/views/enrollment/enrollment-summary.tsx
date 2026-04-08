'use client';

import { AlertCircle, CheckCircle } from 'lucide-react';
import type { StudentImportParseResult } from '@/app/(protected)/(instructor)/students/_types/enrollment-target';

type EnrollmentSummaryProps = {
    result: StudentImportParseResult;
};

export function EnrollmentSummary({ result }: EnrollmentSummaryProps) {
    if (result.errors.length === 0 && result.students.length === 0) return null;

    const claimedStudents = result.students.filter((student) => student.claimStatus === 'CLAIMED');
    const alreadyEnrolledStudents = result.students.filter(
        (student) => student.claimStatus === 'ALREADY_ENROLLED',
    );
    const unclaimedStudents = result.students.filter(
        (student) =>
            student.claimStatus === 'UNCLAIMED' || student.claimStatus === 'NOT_WHITELISTED',
    );
    const unverifiedStudents = result.students.filter(
        (student) => student.claimStatus === 'UNKNOWN',
    );

    return (
        <>
            {/* Errors */}
            {result.errors.length > 0 && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                    <div className="flex min-w-0 items-start gap-2">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                        <div className="min-w-0 space-y-1">
                            {result.errors.map((error, index) => (
                                <p key={index} className="text-sm break-words text-red-600">
                                    {error}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Success Message */}
            {claimedStudents.length > 0 && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                    <div className="flex min-w-0 items-start gap-2">
                        <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        <p className="min-w-0 text-sm break-words text-emerald-600">
                            Found {claimedStudents.length} claimed student
                            {claimedStudents.length !== 1 ? 's' : ''} ready to import
                        </p>
                    </div>
                </div>
            )}

            {alreadyEnrolledStudents.length > 0 && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                    <div className="flex min-w-0 items-start gap-2">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                        <p className="min-w-0 text-sm break-words text-blue-700">
                            {alreadyEnrolledStudents.length} student
                            {alreadyEnrolledStudents.length !== 1 ? 's are' : ' is'} already
                            enrolled in the selected section and will be skipped
                        </p>
                    </div>
                </div>
            )}

            {unclaimedStudents.length > 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <div className="flex min-w-0 items-start gap-2">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                        <p className="min-w-0 text-sm break-words text-amber-700">
                            {unclaimedStudents.length} student
                            {unclaimedStudents.length !== 1 ? 's are' : ' is'} unclaimed or missing
                            from the whitelist and will be skipped
                        </p>
                    </div>
                </div>
            )}

            {unverifiedStudents.length > 0 && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="flex min-w-0 items-start gap-2">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                        <p className="min-w-0 text-sm break-words text-slate-700">
                            {unverifiedStudents.length} student
                            {unverifiedStudents.length !== 1 ? "s couldn't" : " couldn't"} be
                            verified yet because the claim-status preview service is unavailable
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
