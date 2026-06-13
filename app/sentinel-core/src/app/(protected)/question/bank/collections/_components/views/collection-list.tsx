'use client';

import { CollectionCard } from './collection-card';
import { CollectionListItem } from './collection-list-item';
import { CollectionDraftCard } from './collection-draft-card';
import { ViewMode, Collection } from '../../_types';
import { CollectionsEmptyState } from './collections-empty-state';

export interface CollectionListProps {
    collections: (
        | Collection
        | {
              id: string;
              name: string;
              lastUpdated: string;
              questionCount: number;
              isPublic: boolean;
          }
    )[];
    view: ViewMode;
    onOpen: (id: string) => void;
    onDelete: (id: string) => void;
    onEdit: (collection: Collection) => void;

    // Draft props
    hasDraft: boolean;
    draftName: string;
    onDraftNameChange: (name: string) => void;
    onDraftSave: () => void;
    onDraftCancel: () => void;
    isSavingDraft: boolean;
    onAddCollection: () => void;
}

export function CollectionList({
    collections,
    view,
    onOpen,
    onDelete,
    onEdit,
    hasDraft,
    draftName,
    onDraftNameChange,
    onDraftSave,
    onDraftCancel,
    isSavingDraft,
    onAddCollection,
}: CollectionListProps) {
    if (collections.length === 0 && !hasDraft) {
        return <CollectionsEmptyState onCreateCollection={onAddCollection} />;
    }

    return (
        <div
            className={
                view === 'grid'
                    ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                    : 'flex flex-col gap-2'
            }
        >
            {collections.map((collection) => {
                if (collection.id === '__draft__') {
                    return (
                        <CollectionDraftCard
                            key="__draft__"
                            name={draftName}
                            view={view}
                            onNameChange={onDraftNameChange}
                            onSave={onDraftSave}
                            onCancel={onDraftCancel}
                            isSaving={isSavingDraft}
                        />
                    );
                }

                return view === 'grid' ? (
                    <CollectionCard
                        key={collection.id}
                        collection={collection as Collection}
                        onClick={() => onOpen(collection.id)}
                        onDelete={onDelete}
                        onEdit={onEdit}
                    />
                ) : (
                    <CollectionListItem
                        key={collection.id}
                        collection={collection as Collection}
                        onOpen={() => onOpen(collection.id)}
                        onDelete={onDelete}
                        onEdit={onEdit}
                    />
                );
            })}
        </div>
    );
}
