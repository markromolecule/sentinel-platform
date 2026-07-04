'use client';

import { useSearchParams } from 'next/navigation';
import { Button, Card, CardContent } from '@sentinel/ui';
import { LineChart } from 'lucide-react';
import Link from 'next/link';
import { buildStudentHistoryAttemptHref } from '@/lib/routes/student-history-routes';

export default function StudentExamFeedbackThankYouPage() {
    const searchParams = useSearchParams();
    const attemptId = searchParams.get('attemptId');

    return (
        <div className="bg-background grid min-h-[calc(100dvh-5rem)] w-full place-items-center px-4 sm:px-6 lg:px-8">
            <Card className="border-border/70 bg-background w-full max-w-[520px] gap-0 overflow-hidden rounded-3xl border py-0 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
                <CardContent className="space-y-7 px-6 py-8 text-center sm:px-8 sm:py-10">
                    <div className="space-y-3">
                        <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-[2rem]">
                            Thank you for the feedback
                        </h1>
                        <p className="text-muted-foreground mx-auto max-w-sm text-sm leading-6">
                            Your response has been recorded and will help improve the exam
                            experience for future attempts.
                        </p>
                    </div>

                    <div className="flex justify-center">
                        <Button
                            asChild
                            className="bg-foreground text-background hover:bg-foreground/90 h-11 w-full max-w-[260px] rounded-2xl"
                        >
                            <Link
                                href={
                                    attemptId
                                        ? buildStudentHistoryAttemptHref(attemptId)
                                        : '/student/history'
                                }
                            >
                                <LineChart className="mr-2 h-4 w-4" />
                                View Exam Result
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
