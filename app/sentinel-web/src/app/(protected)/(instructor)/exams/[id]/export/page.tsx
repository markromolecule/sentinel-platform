'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useExamQuery } from '@sentinel/hooks';
import { Button } from '@sentinel/ui';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { ExamPrintExport } from '@/features/exams/export/exam-print-export';

export default function ExamExportPage() {
    const params = useParams<{ id: string }>();
    const examId = params.id;
    const { data: exam, isLoading, isError } = useExamQuery(examId);

    useEffect(() => {
        if (isError) {
            toast.error('Failed to prepare PDF export.');
        }
    }, [isError]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-100">
                <div className="flex flex-col items-center gap-3">
                    <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
                    <p className="text-muted-foreground text-sm">Preparing export...</p>
                </div>
            </div>
        );
    }

    if (isError || !exam) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-100 p-4">
                <div className="max-w-md rounded-lg border bg-white p-6 text-center shadow-sm">
                    <h1 className="text-lg font-semibold">Unable to prepare export</h1>
                    <p className="text-muted-foreground mt-2 text-sm">
                        The exam details could not be loaded. Return to the exam dashboard and try
                        again.
                    </p>
                    <Button asChild className="mt-5">
                        <Link href="/exams/dashboard">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Exams
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    return <ExamPrintExport exam={exam} />;
}
