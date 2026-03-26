"use client";

import { useState } from "react";
import { PageHeader } from "@sentinel/ui";
import { Button, Separator } from "@sentinel/ui";
import { Plus } from "lucide-react";
import { useQuestionBank } from "@/features/questions/store/use-question-bank";
import { QuestionsTable } from "./bank/_components/questions-table";
import { QuestionTypeSelectorDialog } from "@/features/exams/builder/_components/question-type-selector-dialog";
import { type QuestionType } from "@sentinel/shared/types";

export default function QuestionBankPage() {
    const { questions } = useQuestionBank();
    const [isTypeSelectorOpen, setIsTypeSelectorOpen] = useState(false);

    const handleSelectQuestionType = (type: QuestionType) => {
        setIsTypeSelectorOpen(false);
        // Note: Real implementation would navigate to a creation form
        console.log("Selected type for new bank question:", type);
    };

    return (
        <div className="flex flex-col gap-6 md:p-6 p-4">
            <PageHeader
                title="Question Bank"
                description="Repository of all questions recorded across your exams."
            >
                <Button
                    onClick={() => setIsTypeSelectorOpen(true)}
                    className="bg-[#323d8f] hover:bg-[#323d8f]/90 text-white"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Question
                </Button>
            </PageHeader>

            <Separator />

            <div className="flex-1">
                <QuestionsTable questions={questions} />
            </div>

            <QuestionTypeSelectorDialog
                open={isTypeSelectorOpen}
                onOpenChange={setIsTypeSelectorOpen}
                onSelect={handleSelectQuestionType}
            />
        </div>
    );
}
