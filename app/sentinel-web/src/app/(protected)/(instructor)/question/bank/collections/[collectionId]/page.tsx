"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import {
    useDeleteQuestionBankCollectionMutation,
    useQuestionBankCollectionQuery,
} from "@sentinel/hooks";
import {
    Badge,
    Button,
    PageHeader,
    Separator,
} from "@sentinel/ui";
import { ArrowLeft, Upload } from "lucide-react";
import { QuestionsTable } from "@/app/(protected)/(instructor)/question/bank/_components/tables/questions-table";
import { ImportModal } from "@/app/(protected)/(instructor)/question/bank/_components/dialogs/import-modal";
import { DeleteCollectionDialog } from "../_components/dialogs/delete-collection-dialog";
import { QuestionsEmptyState } from "../../_components/views/questions-empty-state";
import type { QuestionTableItem } from "@/app/(protected)/(instructor)/question/bank/_components/tables/columns";

export default function CollectionQuestionsPage() {
    const router = useRouter();
    const params = useParams<{ collectionId: string }>();
    const { data: collection, isLoading } = useQuestionBankCollectionQuery(params.collectionId);
    const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

    const deleteCollectionMutation = useDeleteQuestionBankCollectionMutation({
        onSuccess: () => {
            router.push("/question/bank/collections");
        },
    });

    const collectionQuestions = React.useMemo<QuestionTableItem[]>(() => {
        if (!collection) {
            return [];
        }

        return collection.questions;
    }, [collection]);

    const handleDeleteCollection = () => {
        if (!collection) return;
        setIsDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!collection) return;
        await deleteCollectionMutation.mutateAsync(collection.id);
        setIsDeleteDialogOpen(false);
    };

    if (!isLoading && !collection) {
        return (
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    title="Collection Not Found"
                    description="The collection you are trying to open does not exist anymore."
                >
                    <Button
                        variant="outline"
                        onClick={() => router.push("/question/bank/collections")}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Collections
                    </Button>
                </PageHeader>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <div className="flex items-center">
                <Button
                    variant="ghost"
                    onClick={() => router.push("/question/bank/collections")}
                    className="gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Collections
                </Button>
            </div>

            <PageHeader
                title={collection?.name ?? "Collection"}
                description={collection?.description || "Questions saved inside this collection."}
            >
                <div className="flex items-center gap-2">
                    <Badge variant="secondary">{collectionQuestions.length} questions</Badge>
                    {collection ? (
                        <>
                            <Button
                                variant="ghost"
                                onClick={() => setIsImportModalOpen(true)}
                                className="gap-2"
                            >
                                <Upload className="w-4 h-4" />
                                Import / Upload
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => void handleDeleteCollection()}
                                disabled={deleteCollectionMutation.isPending}
                            >
                                {deleteCollectionMutation.isPending ? "Deleting..." : "Delete Collection"}
                            </Button>
                        </>
                    ) : null}
                </div>
            </PageHeader>

            <Separator />

            {collectionQuestions.length > 0 || isLoading ? (
                <QuestionsTable questions={collectionQuestions} readOnly isLoading={isLoading} />
            ) : (
                <QuestionsEmptyState
                    onImport={() => setIsImportModalOpen(true)}
                    description="This collection is currently empty. Start by importing questions from a document."
                />
            )}

            <ImportModal
                open={isImportModalOpen}
                onOpenChange={setIsImportModalOpen}
                collectionId={collection?.id}
                collectionName={collection?.name}
            />

            <DeleteCollectionDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={handleConfirmDelete}
                isDeleting={deleteCollectionMutation.isPending}
            />
        </div>
    );
}
