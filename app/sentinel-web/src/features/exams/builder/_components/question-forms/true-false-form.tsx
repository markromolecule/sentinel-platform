"use client";

import { Button, Label } from "@sentinel/ui";
import { CheckCircle2 } from "lucide-react";
import type { ExamQuestionContent } from "@sentinel/shared/types";
import { cn } from "@/lib/utils";

interface TrueFalseFormProps {
    content: ExamQuestionContent;
    onChange: (content: ExamQuestionContent) => void;
}

export function TrueFalseForm({ content, onChange }: TrueFalseFormProps) {
    const correctBoolean = typeof content.correctAnswer === "boolean" ? content.correctAnswer : true;

    return (
        <div className="space-y-3 pt-6 border-t border-border/60">
            <Label className="text-sm font-medium">Correct Answer</Label>
            <div className="flex gap-3">
                <Button
                    variant={correctBoolean ? "default" : "outline"}
                    className="flex-1"
                    onClick={() =>
                        onChange({
                            ...content,
                            correctAnswer: true,
                        })
                    }
                >
                    <CheckCircle2
                        className={cn(
                            "h-4 w-4",
                            correctBoolean ? "" : "text-muted-foreground",
                        )}
                    />
                    True
                </Button>
                <Button
                    variant={!correctBoolean ? "default" : "outline"}
                    className="flex-1"
                    onClick={() =>
                        onChange({
                            ...content,
                            correctAnswer: false,
                        })
                    }
                >
                    <CheckCircle2
                        className={cn(
                            "h-4 w-4",
                            !correctBoolean ? "" : "text-muted-foreground",
                        )}
                    />
                    False
                </Button>
            </div>
        </div>
    );
}
