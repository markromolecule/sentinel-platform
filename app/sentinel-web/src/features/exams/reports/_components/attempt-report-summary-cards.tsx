import type { AttemptGradingDetailType } from '@sentinel/shared';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@sentinel/ui';

type AttemptReportSummaryCardsProps = {
    attempt: AttemptGradingDetailType;
};

export function AttemptReportSummaryCards({ attempt }: AttemptReportSummaryCardsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-muted-foreground text-sm font-medium">
                        Final Score
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-semibold">
                        {attempt.score ?? 'N/A'} / {attempt.totalScore ?? 'N/A'}
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-muted-foreground text-sm font-medium">
                        Finalization
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Badge variant={attempt.grading.finalizedAt ? 'default' : 'secondary'}>
                        {attempt.grading.finalizedAt ? 'Finalized' : 'Draft'}
                    </Badge>
                    <p className="text-muted-foreground mt-2 text-sm">
                        {attempt.grading.finalizedAt
                            ? `Locked at ${new Date(attempt.grading.finalizedAt).toLocaleString()}`
                            : 'Visible to students after finalization.'}
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-muted-foreground text-sm font-medium">
                        Overall Feedback
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm">{attempt.feedback || 'No overall feedback recorded.'}</p>
                </CardContent>
            </Card>
        </div>
    );
}
