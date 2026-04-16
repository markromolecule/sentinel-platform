'use client';

import { Button, PageHeader } from '@sentinel/ui';
import { Loader2, Save } from 'lucide-react';

interface PreviewHeaderProps {
    selectedCount: number;
    isSaving: boolean;
    isDiscarding: boolean;
    onDiscard: () => void;
    onSave: () => void;
}

export function PreviewHeader({
    selectedCount,
    isSaving,
    isDiscarding,
    onDiscard,
    onSave,
}: PreviewHeaderProps) {
    return (
        <PageHeader
            title="Review Imports"
            description="Review and edit the generated questions before importing them."
        >
            <div className="flex items-center gap-3">
                <Button
                    variant="outline"
                    size="sm"
                    disabled={isSaving || isDiscarding}
                    onClick={onDiscard}
                >
                    {isDiscarding ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Discarding...
                        </>
                    ) : (
                        'Discard'
                    )}
                </Button>
                <Button
                    size="sm"
                    disabled={isSaving || isDiscarding || selectedCount === 0}
                    onClick={onSave}
                    className="min-w-[140px] gap-2 bg-[#323d8f] text-white shadow-md hover:bg-[#323d8f]/90"
                >
                    {isSaving ? (
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Saving...
                        </div>
                    ) : (
                        <>
                            <Save className="h-4 w-4" />
                            Import {selectedCount} Questions
                        </>
                    )}
                </Button>
            </div>
        </PageHeader>
    );
}
