import { BookOpen } from 'lucide-react';
import { type ExamListProps } from '@sentinel/shared/types';
import { ExamCard } from './exam-card';

export function ExamList({ exams, emptyMessage }: ExamListProps) {
    if (exams.length === 0) {
        return (
            <div className="bg-muted/50 border-border flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-center">
                <div className="bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                    <BookOpen className="text-muted-foreground h-8 w-8" />
                </div>
                <h3 className="text-foreground mb-2 text-xl font-semibold">No exams found</h3>
                <p className="text-muted-foreground mx-auto max-w-md">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {exams.map((exam) => (
                <ExamCard key={exam.id} exam={exam} />
            ))}
        </div>
    );
}
