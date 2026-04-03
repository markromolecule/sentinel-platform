"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Separator } from "@sentinel/ui";
import { toast } from "sonner";
import { ImportModal } from "@/app/(protected)/(instructor)/question/bank/_components/import-modal";
import { useQuestionBank } from "@/features/questions/store/use-question-bank";
import {
    CollectionCard,
    CollectionDraftCard,
    CollectionHeader,
    CollectionListItem,
    CollectionsPagination,
    CollectionViewControls,
} from "@/app/(protected)/(instructor)/question/bank/collections/_components";
import { ViewMode } from "@/app/(protected)/(instructor)/question/bank/collections/_types";

const COLLECTIONS_PER_PAGE = 8;

export default function CollectionsPage() {
    const router = useRouter();
    const [view, setView] = useState<ViewMode>("grid");
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [draftCollectionName, setDraftCollectionName] = useState("");
    const [hasDraftCollection, setHasDraftCollection] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const { collections, addCollection } = useQuestionBank();

    const handleImport = () => setIsImportModalOpen(true);

    const handleAddCollection = () => {
        if (hasDraftCollection) {
            return;
        }

        setHasDraftCollection(true);
        setDraftCollectionName("");
        setCurrentPage(1);
    };

    const handleSaveCollection = () => {
        const trimmedName = draftCollectionName.trim();

        if (!trimmedName) {
            toast.error("Collection title is required.");
            return;
        }

        addCollection({
            name: trimmedName,
            questionIds: [],
            isPublic: false,
        });
        setHasDraftCollection(false);
        setDraftCollectionName("");
        setCurrentPage(1);
        toast.success(`"${trimmedName}" was created.`);
    };

    const handleCancelDraftCollection = () => {
        setHasDraftCollection(false);
        setDraftCollectionName("");
    };

    const handleOpenCollection = (id: string) => {
        router.push(`/question/bank/collections/${id}`);
    };

    const collectionsWithDraft = useMemo(() => {
        if (!hasDraftCollection) {
            return collections;
        }

        return [
            {
                id: "__draft__",
                name: draftCollectionName,
                questionIds: [],
                lastUpdated: "",
                isPublic: false,
            },
            ...collections,
        ];
    }, [collections, draftCollectionName, hasDraftCollection]);

    const totalPages = Math.max(1, Math.ceil(collectionsWithDraft.length / COLLECTIONS_PER_PAGE));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const paginatedCollections = useMemo(() => {
        const start = (safeCurrentPage - 1) * COLLECTIONS_PER_PAGE;
        return collectionsWithDraft.slice(start, start + COLLECTIONS_PER_PAGE);
    }, [collectionsWithDraft, safeCurrentPage]);

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <CollectionHeader
                onImport={handleImport}
                onAddCollection={handleAddCollection}
            />

            <Separator />

            <CollectionViewControls
                view={view}
                onViewChange={setView}
            />

            <div
                className={view === "grid"
                    ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    : "flex flex-col gap-2"
                }
            >
                {paginatedCollections.map((collection) => {
                    if (collection.id === "__draft__") {
                        return (
                            <CollectionDraftCard
                                key="__draft__"
                                name={draftCollectionName}
                                view={view}
                                onNameChange={setDraftCollectionName}
                                onSave={handleSaveCollection}
                                onCancel={handleCancelDraftCollection}
                            />
                        );
                    }

                    return view === "grid" ? (
                        <CollectionCard
                            key={collection.id}
                            collection={collection}
                            onClick={() => handleOpenCollection(collection.id)}
                        />
                    ) : (
                        <CollectionListItem
                            key={collection.id}
                            collection={collection}
                            onOpen={() => handleOpenCollection(collection.id)}
                        />
                    );
                })}
            </div>

            <CollectionsPagination
                currentPage={safeCurrentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />

            <ImportModal
                open={isImportModalOpen}
                onOpenChange={setIsImportModalOpen}
            />
        </div>
    );
}
