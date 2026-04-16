'use client';

import { AlertCircle, CheckCircle } from 'lucide-react';
import { ParseResult } from '@sentinel/shared/types';

type EnrollmentSummaryProps = {
    result: ParseResult;
};

export function EnrollmentSummary({ result }: EnrollmentSummaryProps) {
    if (result.errors.length === 0 && result.students.length === 0) return null;

    return (
        <>
            {/* Errors */}
            {result.errors.length > 0 && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                        <div className="space-y-1">
                            {result.errors.map((error, index) => (
                                <p key={index} className="text-sm text-red-600">
                                    {error}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Success Message */}
            {result.students.length > 0 && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        <p className="text-sm text-emerald-600">
                            Found {result.students.length} student
                            {result.students.length !== 1 ? 's' : ''} ready to import
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
