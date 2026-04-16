'use client';

import { Card, SearchBar } from '@sentinel/ui';
import { type SubjectClassification } from '@sentinel/shared/types';
import { SubjectClassificationCard } from '../cards/subject-classification-card';
import { SubjectClassificationsEmptyState } from './subject-classifications-empty-state';

interface SubjectClassificationsListProps {
    classifications: SubjectClassification[];
    isLoading?: boolean;
    searchTerm?: string;
    onSearchChange?: (value: string) => void;
    onEdit?: (classification: SubjectClassification) => void;
    canCreate?: boolean;
    onCreate?: () => void;
    canDelete?: boolean;
}

export function SubjectClassificationsList({
    classifications,
    isLoading = false,
    searchTerm,
    onSearchChange,
    onEdit,
    canCreate = false,
    onCreate,
    canDelete = false,
}: SubjectClassificationsListProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div className="w-full max-w-sm">
                    <SearchBar
                        value={searchTerm}
                        onChange={(event) => onSearchChange?.(event.target.value)}
                        placeholder="Search groups..."
                    />
                </div>
                {!isLoading && classifications.length > 0 && (
                    <div className="text-muted-foreground hidden text-sm font-medium md:block">
                        Total: {classifications.length} Groups
                    </div>
                )}
            </div>

            {isLoading ? (
                <div className="grid auto-rows-fr gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <Card key={index} className="min-h-[188px] animate-pulse bg-muted/20" />
                    ))}
                </div>
            ) : classifications.length > 0 ? (
                <div className="grid auto-rows-fr gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {classifications.map((classification) => (
                        <SubjectClassificationCard
                            key={classification.id}
                            classification={classification}
                            onEdit={onEdit}
                            canDelete={canDelete}
                        />
                    ))}
                </div>
            ) : (
                <SubjectClassificationsEmptyState
                    searchTerm={searchTerm}
                    canCreate={canCreate}
                    onCreate={onCreate}
                />
            )}
        </div>
    );
}
