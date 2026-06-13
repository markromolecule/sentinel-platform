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
                    <CardTitle className="text-muted-foreground text-sm font-medium">
                        Auto-Graded Score
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pt-0 pb-4">
                    <div className="text-2xl font-bold">{scoreSummary.objectiveScore} points</div>
                    <p className="text-muted-foreground mt-1 text-xs">From objective questions</p>
                </CardContent>
            </Card>
            <Card className="md:col-span-1">
                <CardHeader className="p-4">
                    <CardTitle className="text-muted-foreground text-sm font-medium">
                        Essay Rubric Score
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pt-0 pb-4">
                    <div className="text-2xl font-bold">
                        {scoreSummary.essayScore.toFixed(2)} points
                    </div>
                    <p className="text-muted-foreground mt-1 text-xs">Calculated via weights</p>
                </CardContent>
            </Card>
            <Card className="md:col-span-1">
                <CardHeader className="p-4">
                    <CardTitle className="text-muted-foreground text-sm font-medium">
                        Final Attempt Score
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pt-0 pb-4">
                    <div className="text-primary text-2xl font-bold">
                        {scoreSummary.totalScore} / {scoreSummary.maxScore}
                    </div>
                    <p className="text-muted-foreground mt-1 text-xs">Nearest integer rounded</p>
                </CardContent>
            </Card>
            <Card className="md:col-span-1">
                <CardHeader className="p-4">
                    <CardTitle className="text-muted-foreground font-mono text-sm font-medium">
                        Attempt Status
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pt-0 pb-4">
                    <Badge
                        variant={status === 'GRADED' ? 'default' : 'secondary'}
                        className="mt-1 text-sm"
                    >
                        {status || 'N/A'}
                    </Badge>
                    <p className="text-muted-foreground mt-2 text-xs">
                        Completed at {completedAt ? new Date(completedAt).toLocaleString() : 'N/A'}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

export { GradingScoreHighlights };
