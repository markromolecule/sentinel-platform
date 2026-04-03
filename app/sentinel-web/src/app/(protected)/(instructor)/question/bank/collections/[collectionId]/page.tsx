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
import { ArrowLeft } from "lucide-react";
import { QuestionsTable } from "@/app/(protected)/(instructor)/question/bank/_components/questions-table";
import type { QuestionTableItem } from "@/app/(protected)/(instructor)/question/bank/_components/columns";

export default function CollectionQuestionsPage() {
    const router = useRouter();
    const params = useParams<{ collectionId: string }>();
    const { data: collection, isLoading } = useQuestionBankCollectionQuery(params.collectionId);
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

    const handleDeleteCollection = async () => {
        if (!collection) {
            return;
        }

        const confirmed = window.confirm(
            `Delete "${collection.name}"? This removes the collection only and keeps the questions in the bank.`,
        );

        if (!confirmed) {
            return;
        }

        await deleteCollectionMutation.mutateAsync(collection.id);
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
                        <Button
                            variant="outline"
                            onClick={() => void handleDeleteCollection()}
                            disabled={deleteCollectionMutation.isPending}
                        >
                            {deleteCollectionMutation.isPending ? "Deleting..." : "Delete Collection"}
                        </Button>
                    ) : null}
                </div>
            </PageHeader>

            <Separator />

            <QuestionsTable questions={collectionQuestions} readOnly isLoading={isLoading} />
        </div>
    );
}
