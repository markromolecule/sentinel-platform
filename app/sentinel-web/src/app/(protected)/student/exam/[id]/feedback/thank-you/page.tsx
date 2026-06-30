'use client';

import { useSearchParams } from 'next/navigation';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@sentinel/ui';
import { CheckCircle2, History, LineChart } from 'lucide-react';
import Link from 'next/link';
import { useStudentExamData } from '../../_hooks/use-student-exam-data';

export default function StudentExamFeedbackThankYouPage() {
    const { examId } = useStudentExamData();
    const searchParams = useSearchParams();
    const attemptId = searchParams.get('attemptId');

    return (
        <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl items-center px-4 py-8 sm:px-6 lg:px-8">
            <Card className="border-border/60 w-full rounded-2xl border shadow-sm">
                <CardHeader className="space-y-4 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                        <CheckCircle2 className="h-7 w-7" />
                    </div>
                    <div className="space-y-2">
                        <CardTitle className="text-2xl">Thank you for the feedback</CardTitle>
                        <p className="text-muted-foreground text-sm leading-6">
                            Your response has been recorded and will help improve the exam experience.
                        </p>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Button asChild>
                        <Link href={attemptId ? `/student/history/details?attemptId=${attemptId}` : '/student/history'}>
                            <LineChart className="mr-2 h-4 w-4" />
                            View Exam Result
                        </Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href={`/student/exam/${examId}`}>
                            <History className="mr-2 h-4 w-4" />
                            Back to Exam
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
