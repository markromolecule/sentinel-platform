"use client";

import { Button, Input, Label } from "@sentinel/ui";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import type { ExamQuestionContent } from "@sentinel/shared/types";

interface MatchingFormProps {
    content: ExamQuestionContent;
    onChange: (content: ExamQuestionContent) => void;
}

export function MatchingForm({ content, onChange }: MatchingFormProps) {
    const pairs = content.pairs ?? [{ left: "", right: "" }];

    const handleAddPair = () => {
        onChange({
            ...content,
            pairs: [...pairs, { left: "", right: "" }],
        });
    };

    const handleRemovePair = (index: number) => {
        onChange({
            ...content,
            pairs: pairs.filter((_, i) => i !== index),
        });
    };

    const handlePairChange = (index: number, side: "left" | "right", value: string) => {
        const nextPairs = [...pairs];
        nextPairs[index] = {
            ...nextPairs[index],
            [side]: value,
        };
        onChange({
            ...content,
            pairs: nextPairs,
        });
    };

    return (
        <div className="space-y-4 pt-6 border-t border-border/60">
            <Label className="text-sm font-medium">Matching Pairs</Label>
            <div className="space-y-3">
                {pairs.map((pair, idx) => (
                    <div key={idx} className="flex items-center gap-3 group">
                        <Input
                            placeholder="Term"
                            className="flex-1"
                            value={pair.left}
                            onChange={(e) => handlePairChange(idx, "left", e.target.value)}
                        />
                        <ArrowLeft className="h-4 w-4 text-muted-foreground rotate-180 shrink-0" />
                        <div className="flex-1 relative flex gap-2 items-center">
                            <Input
                                placeholder="Definition"
                                className="flex-1"
                                value={pair.right}
                                onChange={(e) => handlePairChange(idx, "right", e.target.value)}
                            />
                            {idx > 0 && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                    onClick={() => handleRemovePair(idx)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <Button
                variant="outline"
                className="w-full border-dashed"
                onClick={handleAddPair}
            >
                <Plus className="h-4 w-4" /> Add Pair
            </Button>
        </div>
    );
}
