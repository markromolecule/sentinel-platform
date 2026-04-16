import { Button } from '@sentinel/ui';
import { Card, CardContent } from '@sentinel/ui';
import { BarChart, HelpCircle, Trophy } from 'lucide-react';
import { ExamSidebarProps } from '@sentinel/shared/types';
import { useRouter } from 'next/navigation';

export function ExamSidebar({ exam }: ExamSidebarProps) {
    const router = useRouter();
    return (
        <div className="space-y-4">
            <Card className="bg-muted/50 border-border/50">
                <CardContent className="space-y-4 p-4">
                    <div>
                        <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                            Questions
                        </span>
                        <div className="text-foreground flex items-center gap-2 text-xl font-bold">
                            <HelpCircle className="text-primary h-5 w-5" />
                            {exam.questionCount}
                        </div>
                    </div>
                    <div>
                        <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                            Passing
                        </span>
                        <div className="text-foreground flex items-center gap-2 text-xl font-bold">
                            <Trophy className="text-primary h-5 w-5" />
                            {exam.passingScore}%
                        </div>
                    </div>
                    <div>
                        <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                            Difficulty
                        </span>
                        <div className="text-foreground flex items-center gap-2 text-xl font-bold capitalize">
                            <BarChart className="text-primary h-5 w-5" />
                            {exam.difficulty}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Button
                size="lg"
                variant="premium-3d"
                className="w-full font-semibold"
                disabled={exam.status === 'upcoming'}
                onClick={() => router.push(`/student/exam/${exam.id}/configuration`)}
            >
                {exam.status === 'upcoming' ? 'Available Soon' : 'Start Exam'}
            </Button>
        </div>
    );
}
