'use client';

import { Separator, Alert, AlertTitle, AlertDescription, Badge } from '@sentinel/ui';
import { AlertCircle } from 'lucide-react';
import { PreviewHeader } from '../layout/preview-header';
import { PreviewPagination } from '../layout/preview-pagination';
import { QuestionImportTable } from '../tables/question-import-table';
import { GenerateQuestionPreviewResponse } from '@sentinel/shared';
import { PreviewQuestion } from '../../_types';
import { QUESTIONS_PER_PAGE } from '../../_constants';

interface PreviewListViewProps {
    previewData: GenerateQuestionPreviewResponse;
    isSaving: boolean;
    isDiscarding: boolean;
    selectedQuestions: Set<number>;
    currentPage: number;
    paginatedQuestions: PreviewQuestion[];
    totalPages: number;
    onPageChange: (page: number) => void;
    onToggleSelect: (index: number) => void;
    onToggleSelectAll: () => void;
    onEdit: (index: number) => void;
    onDelete: (index: number) => void;
    onDiscard: () => void;
    onSave: () => void;
}

export function PreviewListView({
    previewData,
    isSaving,
    isDiscarding,
    selectedQuestions,
    currentPage,
    paginatedQuestions,
    totalPages,
    onPageChange,
    onToggleSelect,
    onToggleSelectAll,
    onEdit,
    onDelete,
    onDiscard,
    onSave,
}: PreviewListViewProps) {
    const pageStartIndex = (currentPage - 1) * QUESTIONS_PER_PAGE;

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <PreviewHeader
                selectedCount={selectedQuestions.size}
                isSaving={isSaving}
                isDiscarding={isDiscarding}
                onDiscard={onDiscard}
                onSave={onSave}
            />

            <Separator />

            <p className="text-muted-foreground px-2 text-sm">
                Source file:{' '}
                <span className="text-foreground font-semibold">{previewData.sourceFile.name}</span>{' '}
                <span className="text-xs">({previewData.pageCount} pages analyzed)</span>
            </p>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-lg font-semibold">
                        Questions List
                        <Badge
                            variant="secondary"
                            className="border-none bg-[#323d8f]/10 font-medium text-[#323d8f]"
                        >
                            {selectedQuestions.size} of {previewData.questions.length} Selected
                        </Badge>
                    </h2>
                    <p className="text-muted-foreground text-sm">
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

            <Alert className="border-[#323d8f]/20 bg-[#323d8f]/5">
                <AlertCircle className="h-4 w-4 text-[#323d8f]" />
                <AlertTitle className="text-sm font-bold text-[#323d8f]">
                    Action Required
                </AlertTitle>
                <AlertDescription className="text-muted-foreground text-xs leading-relaxed">
                    Please review each question carefully. You can click on any question to edit its
                    content, options, and difficulty. Changes made here will be saved when you click
                    the &quot;Import&quot; button.
                </AlertDescription>
            </Alert>
        </div>
    );
}
