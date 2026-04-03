"use client";

import { useState } from "react";
import { PageHeader } from "@sentinel/ui";
import { Button, Separator } from "@sentinel/ui";
import { Upload } from "lucide-react";
import { useQuestionBank } from "@/features/questions/store/use-question-bank";
import { QuestionsTable } from "./_components/questions-table";
import { ImportModal } from "./_components/import-modal";

export default function QuestionBankPage() {
    const { questions } = useQuestionBank();
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    return (
        <div className="flex flex-col gap-6 md:p-6 p-4">
            <PageHeader
                title="Question Bank"
                description="Repository of all questions recorded across your exams."
            >
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setIsImportModalOpen(true)}
                        className="gap-2"
                    >
                        <Upload className="w-4 h-4" />
                        Import / Upload
                    </Button>
                </div>
            </PageHeader>

            <Separator />

            <div className="flex-1">
                <QuestionsTable questions={questions} />
            </div>
            <ImportModal 
                open={isImportModalOpen} 
                onOpenChange={setIsImportModalOpen} 
            />
        </div>
    );
}
