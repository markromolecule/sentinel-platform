import { Card, CardHeader, CardTitle, CardContent, Badge, Slider, Label, Textarea } from '@sentinel/ui';
import { ESSAY_RUBRIC_CRITERIA, ESSAY_RUBRIC_LEVELS, calculateEssayWeightedScore } from '@sentinel/shared';
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
        <div className="lg:col-span-6 space-y-6">
            {activeQuestion && activeEval && (
                <Card className="shadow-md">
                    <CardHeader className="border-b p-4 bg-muted/10">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-bold">Rubric Evaluation Sliders</CardTitle>
                            <div className="text-right">
                                <div className="text-xs text-muted-foreground font-medium">Weighted Score</div>
                                <div className="text-lg font-bold text-primary">
                                    {calculateEssayWeightedScore(activeEval.scores, activeQuestion.points).toFixed(2)} /{' '}
                                    {activeQuestion.points} pts
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-5 space-y-6">
                        {ESSAY_RUBRIC_CRITERIA.map((criterion) => {
                            const score = activeEval.scores[criterion.key as keyof CriteriaScores] ?? 4;
                            return (
                                <div
                                    key={criterion.key}
                                    className="space-y-3 pb-2 border-b last:border-b-0 last:pb-0"
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-semibold text-foreground">
                                                {criterion.name}
                                            </Label>
                                            <p className="text-xs text-muted-foreground leading-snug">
                                                {criterion.description}
                                            </p>
                                        </div>
                                        <Badge className="font-mono text-sm px-2 py-0.5 w-16 text-center justify-center shrink-0">
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
                                    <p className="text-[11px] text-muted-foreground leading-normal italic bg-muted/40 p-2 rounded border border-border/40">
                                        <span className="font-bold text-foreground not-italic block mb-0.5">
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
                <CardHeader className="p-4 border-b">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
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
