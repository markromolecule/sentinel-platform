'use client';

import { useRouter } from 'next/navigation';
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription } from '@sentinel/ui';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import type { GradingErrorProps } from './_types';

/**
 * Renders the error view when submission details fail to load.
 */
function GradingError({ examId }: GradingErrorProps) {
    const router = useRouter();

    return (
        <div className="flex h-[80vh] items-center justify-center">
            <Card className="max-w-md w-full border-destructive/20 bg-destructive/5">
                <CardHeader className="text-center">
                    <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-2" />
                    <CardTitle className="text-destructive">Error Loading Submission</CardTitle>
                    <CardDescription>
                        We could not retrieve the grading details for this attempt. It might have been deleted or you do not have permission.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center pb-6">
                    <Button variant="outline" onClick={() => router.push(`/exams/grading/${examId}`)}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Student List
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

export { GradingError };
