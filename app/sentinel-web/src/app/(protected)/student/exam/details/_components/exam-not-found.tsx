import { Button } from '@sentinel/ui';
import { AlertCircle, ChevronLeft } from 'lucide-react';
import { ExamNotFoundProps } from '@sentinel/shared/types';

export function ExamNotFound({ onBack }: ExamNotFoundProps) {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
                <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-white">Exam Not Found</h1>
            <p className="text-white/60">
                The exam you are looking for does not exist or has been removed.
            </p>
            <Button variant="outline" className="mt-4" onClick={onBack}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Exams
            </Button>
        </div>
    );
}
