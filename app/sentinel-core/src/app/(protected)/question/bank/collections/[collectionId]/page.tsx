'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    useQuestionBankCollectionQuery,
    useRemoveQuestionBankCollectionQuestionsMutation,
    useStableValue,
} from '@sentinel/hooks';
import { Badge, Button, PageHeader, Separator } from '@sentinel/ui';
import { ArrowLeft, Upload } from 'lucide-react';
import { QuestionsTable } from '@/app/(protected)/question/bank/_components/tables/questions-table';
import { ImportModal } from '@/app/(protected)/question/bank/_components/dialogs/import-modal';
import { DeleteCollectionDialog } from '../_components/dialogs/delete-collection-dialog';
import { EditCollectionDialog } from '../_components/dialogs/edit-collection-dialog';
import { QuestionsEmptyState } from '@/app/(protected)/question/bank/_components/views/questions-empty-state';
import type { QuestionTableItem } from '@/app/(protected)/question/bank/_components/tables/columns';

export default function CollectionQuestionsPage() {
    const router = useRouter();
    const params = useParams<{ collectionId: string }>();
    const { data: collection, isLoading } = useQuestionBankCollectionQuery(params.collectionId);
    const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
    const { mutateAsync: removeQuestions, isPending: isDeleting } =
        useRemoveQuestionBankCollectionQuestionsMutation();

    const collectionQuestions = useStableValue<QuestionTableItem[]>(() => {
        if (!collection) {
            return [];
        }

        return collection.questions;
    }, [collection]);

    const handleDeleteSelected = async (selectedQuestions: QuestionTableItem[]) => {
        if (!collection?.id) return;

        await removeQuestions({
            id: collection.id,
            payload: {
                questionIds: selectedQuestions.map((q) => q.id),
            },
        });
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
                        onClick={() => router.push('/question/bank/collections')}
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
                    onClick={() => router.push('/question/bank/collections')}
                    className="gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Collections
                </Button>
            </div>

            <PageHeader
                title={collection?.name ?? 'Collection'}
                description={collection?.description || 'Questions saved inside this collection.'}
            >
                <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="px-3 py-1 font-medium">
                        {collectionQuestions.length} questions
                    </Badge>
                    {collection ? (
                        <Button
                            variant="default"
                            onClick={() => setIsImportModalOpen(true)}
                            className="gap-2 bg-[#323d8f] px-5 font-semibold text-white shadow-sm transition-all hover:bg-[#323d8f]/90 hover:shadow-md active:scale-95"
                        >
                            <Upload className="h-4 w-4" />
                            Import / Upload
                        </Button>
                    ) : null}
                </div>
            </PageHeader>

            <Separator />

            {isLoading || collectionQuestions.length > 0 ? (
                <QuestionsTable
                    questions={collectionQuestions}
                    isLoading={isLoading}
                    onDeleteSelected={handleDeleteSelected}
                    isDeleting={isDeleting}
                />
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

            <EditCollectionDialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                collectionId={collection?.id}
                initialName={collection?.name}
                initialDescription={collection?.description}
            />

            <DeleteCollectionDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                collectionId={collection?.id}
                onSuccess={() => router.push('/question/bank/collections')}
            />
        </div>
    );
}
