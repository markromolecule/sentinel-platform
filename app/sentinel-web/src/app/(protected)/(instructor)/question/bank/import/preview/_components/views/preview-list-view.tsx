'use client';

import { Separator, Alert, AlertTitle, AlertDescription, Badge } from "@sentinel/ui";
import { AlertCircle } from "lucide-react";
import { PreviewHeader } from "../layout/preview-header";
import { PreviewPagination } from "../layout/preview-pagination";
import { QuestionImportTable } from "../tables/question-import-table";
import { GenerateQuestionPreviewResponse } from "@sentinel/shared";
import { PreviewQuestion } from "../../_types";
import { QUESTIONS_PER_PAGE } from "../../_constants";

interface PreviewListViewProps {
    previewData: GenerateQuestionPreviewResponse;
    isSaving: boolean;
    selectedQuestions: Set<number>;
    currentPage: number;
    paginatedQuestions: PreviewQuestion[];
    totalPages: number;
    onPageChange: (page: number) => void;
    onToggleSelect: (index: number) => void;
    onToggleSelectAll: () => void;
    onEdit: (index: number) => void;
    onDelete: (index: number) => void;
    onSave: () => void;
}

export function PreviewListView({
    previewData,
    isSaving,
    selectedQuestions,
    currentPage,
    paginatedQuestions,
    totalPages,
    onPageChange,
    onToggleSelect,
    onToggleSelectAll,
    onEdit,
    onDelete,
    onSave,
}: PreviewListViewProps) {
    const pageStartIndex = (currentPage - 1) * QUESTIONS_PER_PAGE;

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <PreviewHeader
                selectedCount={selectedQuestions.size}
                isSaving={isSaving}
                onSave={onSave}
            />

            <Separator />

            <p className="px-2 text-sm text-muted-foreground">
                Source file:
                {' '}
                <span className="font-semibold text-foreground">{previewData.sourceFile.name}</span>
            </p>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        Questions List
                        <Badge variant="secondary" className="bg-[#323d8f]/10 text-[#323d8f] border-none font-medium">
                            {selectedQuestions.size} of {previewData.questions.length} Selected
                        </Badge>
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                    </p>
                </div>

                <QuestionImportTable
                    questions={paginatedQuestions}
                    selectedQuestions={selectedQuestions}
                    onToggleSelect={onToggleSelect}
                    onToggleSelectAll={onToggleSelectAll}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    pageStartIndex={pageStartIndex}
                />

                <PreviewPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalQuestions={previewData.questions.length}
                    onPageChange={onPageChange}
                />
            </div>

            <Alert className="bg-[#323d8f]/5 border-[#323d8f]/20">
                <AlertCircle className="h-4 w-4 text-[#323d8f]" />
                <AlertTitle className="text-[#323d8f] font-bold text-sm">Action Required</AlertTitle>
                <AlertDescription className="text-muted-foreground text-xs leading-relaxed">
                    Please review each question carefully. You can click on any question to edit its content, options, and difficulty. Changes made here will be saved when you click the &quot;Import&quot; button.
                </AlertDescription>
            </Alert>
        </div>
    );
}
