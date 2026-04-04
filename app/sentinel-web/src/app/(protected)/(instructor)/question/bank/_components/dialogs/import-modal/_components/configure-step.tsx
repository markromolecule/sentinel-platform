"use client";

import { Input, Label, Checkbox, Card, CardContent } from "@sentinel/ui";
import { ListChecks, Settings2 } from "lucide-react";
import { QUESTION_TYPE_OPTIONS } from "@sentinel/shared/constants";

interface ConfigureStepProps {
    questionCount: number;
    setQuestionCount: (count: number) => void;
    selectedTypes: string[];
    setSelectedTypes: (types: string[]) => void;
}

const ALLOWED_IMPORT_TYPES = [
    "MULTIPLE_CHOICE",
    "TRUE_FALSE",
    "MULTIPLE_RESPONSE",
    "ESSAY",
];

const QUESTION_TYPES = QUESTION_TYPE_OPTIONS.filter((type) =>
    ALLOWED_IMPORT_TYPES.includes(type.value)
);

export function ConfigureStep({
    questionCount,
    setQuestionCount,
    selectedTypes,
    setSelectedTypes,
}: ConfigureStepProps) {
    const toggleType = (typeValue: string) => {
        if (selectedTypes.includes(typeValue)) {
            setSelectedTypes(selectedTypes.filter((value) => value !== typeValue));
        } else {
            setSelectedTypes([...selectedTypes, typeValue]);
        }
    };

    return (
        <div className="space-y-6 py-2">
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Settings2 className="w-4 h-4" />
                    <span>General Settings</span>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="questionCount">Number of questions to generate</Label>
                    <Input
                        id="questionCount"
                        type="number"
                        min={1}
                        max={100}
                        value={questionCount}
                        onChange={(e) => setQuestionCount(parseInt(e.target.value) || 0)}
                        className="max-w-[200px]"
                    />
                    <p className="text-[0.8rem] text-muted-foreground">
                        Specify how many questions you want to extract or generate from the document.
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <ListChecks className="w-4 h-4" />
                    <span>Question Types</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    {QUESTION_TYPES.map((type) => (
                        <Card
                            key={type.value}
                            className={`cursor-pointer transition-all border-2 ${selectedTypes.includes(type.value)
                                    ? "border-[#323d8f] bg-[#323d8f]/5"
                                    : "border-transparent hover:bg-muted"
                                }`}
                            onClick={() => toggleType(type.value)}
                        >
                            <CardContent className="flex items-center gap-3 p-3">
                                <Checkbox
                                    id={type.value}
                                    checked={selectedTypes.includes(type.value)}
                                    onCheckedChange={() => toggleType(type.value)}
                                    className="data-[state=checked]:bg-[#323d8f] data-[state=checked]:border-[#323d8f]"
                                />
                                <Label
                                    htmlFor={type.value}
                                    className="flex-1 cursor-pointer font-medium"
                                >
                                    {type.label}
                                </Label>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
