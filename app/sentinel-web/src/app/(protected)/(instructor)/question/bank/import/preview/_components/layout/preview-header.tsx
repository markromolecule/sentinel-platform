'use client';

import { useRouter } from 'next/navigation';
import { Button, PageHeader } from "@sentinel/ui";
import { Save } from "lucide-react";

interface PreviewHeaderProps {
    selectedCount: number;
    isSaving: boolean;
    onSave: () => void;
}

export function PreviewHeader({ selectedCount, isSaving, onSave }: PreviewHeaderProps) {
    const router = useRouter();

    return (
        <PageHeader
            title="Review Imports"
            description="Review and edit the generated questions before importing them."
        >
            <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={() => router.push('/question/bank')}>
                    Discard
                </Button>
                <Button 
                    size="sm"
                    disabled={isSaving || selectedCount === 0}
                    onClick={onSave}
                    className="bg-[#323d8f] hover:bg-[#323d8f]/90 text-white shadow-md min-w-[140px] gap-2"
                >
                    {isSaving ? (
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Saving...
                        </div>
                    ) : (
                        <>
                            <Save className="w-4 h-4" />
                            Import {selectedCount} Questions
                        </>
                    )}
                </Button>
            </div>
        </PageHeader>
    );
}
