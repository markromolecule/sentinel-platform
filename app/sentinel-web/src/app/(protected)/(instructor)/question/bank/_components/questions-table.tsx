import { useState } from "react";
import { DataTable } from "@sentinel/ui";
import { columns, QuestionWithTags } from "@/app/(protected)/(instructor)/question/bank/_components/columns";
import { QuestionPreviewSheet } from "@/app/(protected)/(instructor)/question/bank/_components/question-preview-sheet";
import { FloatingActionBar } from "@/app/(protected)/(instructor)/question/bank/_components/floating-action-bar";

interface QuestionsTableProps {
    questions: QuestionWithTags[];
}

export function QuestionsTable({ questions }: QuestionsTableProps) {
    const [selectedQuestion, setSelectedQuestion] = useState<QuestionWithTags | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [rowSelection, setRowSelection] = useState({});

    const handleRowClick = (question: QuestionWithTags) => {
        setSelectedQuestion(question);
        setIsPreviewOpen(true);
    };

    const selectedCount = Object.keys(rowSelection).length;

    return (
        <>
            <DataTable
                columns={columns}
                data={questions}
                searchKey="prompt"
                searchPlaceholder="Search questions..."
                onRowClick={handleRowClick}
                facets={[
                    {
                        columnKey: "type",
                        title: "Type",
                        options: [
                            { label: "Multiple Choice", value: "MULTIPLE_CHOICE" },
                            { label: "Multiple Response", value: "MULTIPLE_RESPONSE" },
                            { label: "True/False", value: "TRUE_FALSE" },
                            { label: "Identification", value: "IDENTIFICATION" },
                            { label: "Matching", value: "MATCHING" },
                            { label: "Essay", value: "ESSAY" },
                            { label: "Fill in the Blanks", value: "FILL_BLANK" },
                            { label: "Enumeration", value: "ENUMERATION" },
                        ],
                    },
                ]}
                rowSelection={rowSelection}
                onRowSelectionChange={setRowSelection}
                meta={{
                    rowSelection,
                    setRowSelection,
                }}
            />

            <QuestionPreviewSheet
                question={selectedQuestion}
                open={isPreviewOpen}
                onOpenChange={setIsPreviewOpen}
            />

            <FloatingActionBar
                selectedCount={selectedCount}
                onClear={() => setRowSelection({})}
                onAddToExam={() => console.log("Add to exam:", rowSelection)}
                onBulkEditTags={() => console.log("Bulk edit tags:", rowSelection)}
                onDelete={() => console.log("Delete questions:", rowSelection)}
            />
        </>
    );
}
