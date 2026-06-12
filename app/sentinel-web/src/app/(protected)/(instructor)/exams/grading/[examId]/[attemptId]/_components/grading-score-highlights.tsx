import { Card, CardHeader, CardTitle, CardContent, Badge } from '@sentinel/ui';
import type { GradingScoreHighlightsProps } from './_types';

/**
 * Displays summary cards for objective scores, essay scores, and status details.
 */
function GradingScoreHighlights({
    scoreSummary,
    status,
    completedAt,
}: GradingScoreHighlightsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-4">
            <Card className="md:col-span-1">
                <CardHeader className="p-4">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Auto-Graded Score
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0">
                    <div className="text-2xl font-bold">{scoreSummary.objectiveScore} points</div>
                    <p className="text-xs text-muted-foreground mt-1">From objective questions</p>
                </CardContent>
            </Card>
            <Card className="md:col-span-1">
                <CardHeader className="p-4">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Essay Rubric Score
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0">
                    <div className="text-2xl font-bold">{scoreSummary.essayScore.toFixed(2)} points</div>
                    <p className="text-xs text-muted-foreground mt-1">Calculated via weights</p>
                </CardContent>
            </Card>
            <Card className="md:col-span-1">
                <CardHeader className="p-4">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Final Attempt Score
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0">
                    <div className="text-2xl font-bold text-primary">
                        {scoreSummary.totalScore} / {scoreSummary.maxScore}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Nearest integer rounded</p>
                </CardContent>
            </Card>
            <Card className="md:col-span-1">
                <CardHeader className="p-4">
                    <CardTitle className="text-sm font-medium text-muted-foreground font-mono">
                        Attempt Status
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0">
                    <Badge
                        variant={status === 'GRADED' ? 'default' : 'secondary'}
                        className="text-sm mt-1"
                    >
                        {status || 'N/A'}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-2">
                        Completed at {completedAt ? new Date(completedAt).toLocaleString() : 'N/A'}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

export { GradingScoreHighlights };
