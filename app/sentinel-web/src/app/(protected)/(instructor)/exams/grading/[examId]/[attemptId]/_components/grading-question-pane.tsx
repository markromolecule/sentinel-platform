import { Button, Card, CardHeader, CardTitle, Label, Badge, Textarea, CardContent } from '@sentinel/ui';
import { FileText } from 'lucide-react';
import type { GradingQuestionPaneProps } from './_types';

/**
 * Displays the list of essay questions, prompt switcher, student response,
 * and question-specific feedback.
 */
function GradingQuestionPane({
    essayQuestions,
    activeQuestionId,
    setActiveQuestionId,
    activeQuestion,
    activeEval,
    onFeedbackChange,
    answers,
}: GradingQuestionPaneProps) {
    return (
        <div className="lg:col-span-6 space-y-6">
            {/* Essay Question Switcher if multiple */}
            {essayQuestions.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 border-b">
                    {essayQuestions.map((q, index) => (
                        <Button
                            key={q.id}
                            variant={activeQuestionId === q.id ? 'default' : 'outline'}
                            onClick={() => setActiveQuestionId(q.id)}
                            size="sm"
                            className="shrink-0"
                        >
                            Question {index + 1}
                        </Button>
                    ))}
                </div>
            )}

            {activeQuestion && (
                <Card className="shadow-sm">
                    <CardHeader className="bg-muted/30 border-b p-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <FileText className="h-4 w-4" /> Essay Question Prompt
                            </CardTitle>
                            <Badge variant="outline">{activeQuestion.points} Points Max</Badge>
                        </div>
                        <p className="text-foreground font-semibold mt-2 leading-relaxed">
                            {activeQuestion.content.prompt}
                        </p>
                    </CardHeader>
                    <CardContent className="p-5 space-y-4">
                        <div>
                            <Label className="text-xs font-bold text-muted-foreground uppercase">
                                Student Response
                            </Label>
                            <div className="mt-2 p-4 rounded-xl border bg-muted/20 font-mono text-sm leading-relaxed whitespace-pre-wrap select-text max-h-[400px] overflow-y-auto">
                                {answers[activeQuestion.id] || (
                                    <span className="text-muted-foreground italic">
                                        No response submitted
                                    </span>
                                )}
                            </div>
                        </div>

                        {activeEval && (
                            <div className="pt-2">
                                <Label
                                    htmlFor="question-feedback"
                                    className="text-xs font-bold text-muted-foreground uppercase"
                                >
                                    Question-Specific Feedback
                                </Label>
                                <Textarea
                                    id="question-feedback"
                                    placeholder="Provide feedback specifically for this essay question..."
                                    className="mt-2 min-h-[80px]"
                                    value={activeEval.feedback}
                                    onChange={(e) => onFeedbackChange(activeQuestion.id, e.target.value)}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export { GradingQuestionPane };
