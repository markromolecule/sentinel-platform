import { useMemo, useState } from 'react';
import { DataTable } from '@sentinel/ui';
import {
    getQuestionColumns,
    QuestionTableItem,
} from '@/app/(protected)/(instructor)/question/bank/_components/columns';
import { QuestionPreviewSheet } from '@/app/(protected)/(instructor)/question/bank/_components/question-preview-sheet';
import { FloatingActionBar } from '@/app/(protected)/(instructor)/question/bank/_components/floating-action-bar';

interface QuestionsTableProps {
    questions: QuestionTableItem[];
    isLoading?: boolean;
    readOnly?: boolean;
    onEdit?: (question: QuestionTableItem) => void;
    onDuplicate?: (question: QuestionTableItem) => Promise<void>;
    onDelete?: (question: QuestionTableItem) => Promise<void>;
    onDeleteSelected?: (questions: QuestionTableItem[]) => Promise<void>;
}

export function QuestionsTable({
    questions,
    isLoading = false,
    readOnly = false,
    onEdit,
    onDuplicate,
    onDelete,
    onDeleteSelected,
}: QuestionsTableProps) {
    const columns = useMemo(() => getQuestionColumns(readOnly), [readOnly]);
    const [selectedQuestion, setSelectedQuestion] = useState<QuestionTableItem | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

    const handleRowClick = (question: QuestionTableItem) => {
        setSelectedQuestion(question);
        setIsPreviewOpen(true);
    };

    const selectedQuestions = useMemo(
        () =>
            Object.entries(rowSelection)
                .filter(([, isSelected]) => Boolean(isSelected))
                .map(([rowId]) => questions[Number(rowId)])
                .filter((question): question is QuestionTableItem => Boolean(question)),
        [questions, rowSelection],
    );

    const selectedCount = selectedQuestions.length;

    return (
        <>
            <DataTable
                columns={columns}
                data={questions}
                searchKey="prompt"
                searchPlaceholder="Search questions..."
                onRowClick={handleRowClick}
                isLoading={isLoading}
                facets={[
                    {
                        columnKey: 'type',
                        title: 'Type',
                        options: [
                            { label: 'Multiple Choice', value: 'MULTIPLE_CHOICE' },
                            { label: 'Multiple Response', value: 'MULTIPLE_RESPONSE' },
                            { label: 'True/False', value: 'TRUE_FALSE' },
                            { label: 'Identification', value: 'IDENTIFICATION' },
                            { label: 'Matching', value: 'MATCHING' },
                            { label: 'Essay', value: 'ESSAY' },
                            { label: 'Fill in the Blanks', value: 'FILL_BLANK' },
                            { label: 'Enumeration', value: 'ENUMERATION' },
                        ],
                    },
                    {
                        columnKey: 'difficulty',
                        title: 'Difficulty',
                        options: [
                            { label: 'Easy', value: 'EASY' },
                            { label: 'Moderate', value: 'MODERATE' },
                            { label: 'Hard', value: 'HARD' },
                        ],
                    },
                ]}
                rowSelection={rowSelection}
                onRowSelectionChange={setRowSelection}
                meta={{
                    rowSelection,
                    setRowSelection,
                    onEdit,
                    onDelete,
                }}
            />

            <QuestionPreviewSheet
                question={selectedQuestion}
                open={isPreviewOpen}
                onOpenChange={setIsPreviewOpen}
                onEdit={onEdit}
                onDuplicate={onDuplicate}
                onDelete={onDelete}
            />

            {!readOnly ? (
                <FloatingActionBar
                    selectedCount={selectedCount}
                    onClear={() => setRowSelection({})}
                    onAddToExam={() => console.log('Add to exam:', selectedQuestions)}
                    onBulkEditTags={() => console.log('Bulk edit tags:', selectedQuestions)}
                    onDelete={() => void onDeleteSelected?.(selectedQuestions)}
                />
            ) : null}
        </>
    );
}
