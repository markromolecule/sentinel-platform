"use client";

import { Separator } from "@sentinel/ui";
import { useState } from "react";
import { toast } from "sonner";
import { ImportModal } from "@/app/(protected)/(instructor)/question/bank/_components/import-modal";
import { useQuestionBank } from "@/features/questions/store/use-question-bank";
import {
    CollectionHeader,
    CollectionViewControls,
    CollectionCard,
    CollectionListItem,
} from "@/app/(protected)/(instructor)/question/bank/collections/_components";
import { ViewMode } from "@/app/(protected)/(instructor)/question/bank/collections/_types";

export default function CollectionsPage() {
    const [view, setView] = useState<ViewMode>("grid");
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const { collections } = useQuestionBank();

    const handleImport = () => setIsImportModalOpen(true);
    const handleAddCollection = () => toast.info("New Collection feature coming soon!");
    const handleAddQuestion = () => toast.info("Create Question flow coming soon!");
    const handleOpenCollection = (id: string) => toast.info(`Opening collection ${id}`);

    return (
        <div className="flex flex-col gap-6 md:p-6 p-4">
            <CollectionHeader
                onImport={handleImport}
                onAddCollection={handleAddCollection}
                onAddQuestion={handleAddQuestion}
            />

            <Separator />

            <CollectionViewControls
                view={view}
                onViewChange={setView}
            />

            <div className={view === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                : "flex flex-col gap-2"
            }>
                {collections.map((collection) => (
                    view === "grid" ? (
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
                    )
                ))}
            </div>

            <ImportModal
                open={isImportModalOpen}
                onOpenChange={setIsImportModalOpen}
            />
        </div>
    );
}
