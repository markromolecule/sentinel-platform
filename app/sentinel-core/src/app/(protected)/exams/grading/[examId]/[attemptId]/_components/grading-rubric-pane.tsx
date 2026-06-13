import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    Badge,
    Slider,
    Label,
    Textarea,
} from '@sentinel/ui';
import {
    ESSAY_RUBRIC_CRITERIA,
    ESSAY_RUBRIC_LEVELS,
    calculateEssayWeightedScore,
} from '@sentinel/shared';
import type { GradingRubricPaneProps } from './_types';
import type { CriteriaScores } from '../_types';

/**
 * Displays the criteria scoring sliders for the standardized essay rubric
 * alongside the overall feedback form.
 */
function GradingRubricPane({
    activeQuestion,
    activeEval,
    onScoreChange,
    overallFeedback,
    onOverallFeedbackChange,
}: GradingRubricPaneProps) {
    return (
        <div className="space-y-6 lg:col-span-6">
            {activeQuestion && activeEval && (
                <Card className="shadow-md">
                    <CardHeader className="bg-muted/10 border-b p-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-bold">
                                Rubric Evaluation Sliders
                            </CardTitle>
                            <div className="text-right">
                                <div className="text-muted-foreground text-xs font-medium">
                                    Weighted Score
                                </div>
                                <div className="text-primary text-lg font-bold">
                                    {calculateEssayWeightedScore(
                                        activeEval.scores,
                                        activeQuestion.points,
                                    ).toFixed(2)}{' '}
                                    / {activeQuestion.points} pts
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6 p-5">
                        {ESSAY_RUBRIC_CRITERIA.map((criterion) => {
                            const score =
                                activeEval.scores[criterion.key as keyof CriteriaScores] ?? 4;
                            return (
                                <div
                                    key={criterion.key}
                                    className="space-y-3 border-b pb-2 last:border-b-0 last:pb-0"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-foreground text-sm font-semibold">
                                                {criterion.name}
                                            </Label>
                                            <p className="text-muted-foreground text-xs leading-snug">
                                                {criterion.description}
                                            </p>
                                        </div>
                                        <Badge className="w-16 shrink-0 justify-center px-2 py-0.5 text-center font-mono text-sm">
                                            Score: {score}
                                        </Badge>
                                    </div>
                                    <div className="px-1">
                                        <Slider
                                            value={[score]}
                                            onValueChange={(val) =>
                                                onScoreChange(
                                                    activeQuestion.id,
                                                    criterion.key as keyof CriteriaScores,
                                                    val[0],
                                                )
                                            }
                                            min={0}
                                            max={4}
                                            step={1}
                                        />
                                    </div>
                                    <p className="text-muted-foreground bg-muted/40 border-border/40 rounded border p-2 text-[11px] leading-normal italic">
                                        <span className="text-foreground mb-0.5 block font-bold not-italic">
                                            Level {score} Description:
                                        </span>
                                        {ESSAY_RUBRIC_LEVELS[score]}
                                    </p>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            )}

            {/* Overall Feedback Card */}
            <Card className="shadow-sm">
                <CardHeader className="border-b p-4">
                    <CardTitle className="text-muted-foreground text-sm font-bold tracking-wider uppercase">
                        Overall Exam Feedback
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                    <Textarea
                        placeholder="Enter final comments and feedback for the entire exam attempt..."
                        className="min-h-[100px]"
                        value={overallFeedback}
                        onChange={(e) => onOverallFeedbackChange(e.target.value)}
                    />
                </CardContent>
            </Card>
        </div>
    );
}

export { GradingRubricPane };
