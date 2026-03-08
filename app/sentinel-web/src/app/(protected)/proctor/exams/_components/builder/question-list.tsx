"use client";

import * as React from "react";
import { useState } from "react";
import { useExamBuilderStore } from "../../_stores/use-exam-builder-store";
import { QuestionCard } from "./question-card";
import { Button } from "@sentinel/ui";
import { PlusCircle, Type, ImageIcon, Video, Section } from "lucide-react";
import { QuestionType } from "@sentinel/shared/types";

export function QuestionList() {
    const { questions, addQuestion } = useExamBuilderStore();
    const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);

    // Default to the first question being active if none is selected, or let user click to activate
    React.useEffect(() => {
        if (questions.length > 0 && !activeQuestionId) {
            setActiveQuestionId(questions[0].id);
        } else if (questions.length === 0) {
            setActiveQuestionId(null);
        }
    }, [questions, activeQuestionId]);

    const handleAddClick = (type: QuestionType) => {
        addQuestion(type);
        // Automatically make the newly added question active
        setTimeout(() => {
            const state = useExamBuilderStore.getState();
            const lastQ = state.questions[state.questions.length - 1];
            if (lastQ) setActiveQuestionId(lastQ.id);
        }, 50);
    };

    return (
        <div className="relative flex gap-6 mt-4 pb-24">
            {/* Main Content Area */}
            <div className="flex-1 space-y-4">
                {questions.map((question) => (
                    <QuestionCard
                        key={question.id}
                        question={question}
                        isActive={activeQuestionId === question.id}
                        onActivate={() => setActiveQuestionId(question.id)}
                    />
                ))}
            </div>

            {/* Floating Action Toolbar (Google Forms Style) */}
            <div className="hidden lg:flex flex-col gap-2 rounded-lg bg-white shadow-md border p-2 sticky top-[100px] h-fit">
                <Button
                    variant="ghost"
                    size="icon"
                    title="Add Question"
                    onClick={() => handleAddClick('MULTIPLE_CHOICE')}
                >
                    <PlusCircle className="w-5 h-5 text-blue-600" />
                </Button>
                <div className="h-[1px] bg-slate-200 my-1 mx-2" />
                <Button variant="ghost" size="icon" title="Add Title and Description">
                    <Type className="w-5 h-5 text-slate-500" />
                </Button>
                <Button variant="ghost" size="icon" title="Add Image">
                    <ImageIcon className="w-5 h-5 text-slate-500" />
                </Button>
                <Button variant="ghost" size="icon" title="Add Video">
                    <Video className="w-5 h-5 text-slate-500" />
                </Button>
                <Button variant="ghost" size="icon" title="Add Section">
                    <Section className="w-5 h-5 text-slate-500" />
                </Button>
            </div>

            {/* Mobile Bottom Bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t flex justify-around shadow-lg z-50">
                <Button
                    variant="ghost"
                    size="sm"
                    className="flex-col gap-1 h-auto"
                    onClick={() => handleAddClick('MULTIPLE_CHOICE')}
                >
                    <PlusCircle className="w-5 h-5 text-blue-600" />
                    <span className="text-xs">Add</span>
                </Button>
            </div>
        </div>
    );
}
