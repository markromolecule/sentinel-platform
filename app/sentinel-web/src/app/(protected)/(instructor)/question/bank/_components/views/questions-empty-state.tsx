'use client';

import { 
    Button,
    EmptyState 
} from '@sentinel/ui';
import { Plus, Upload } from 'lucide-react';

export interface QuestionsEmptyStateProps {
    onCreate?: () => void;
    onImport?: () => void;
    title?: string;
    description?: string;
}

export function QuestionsEmptyState({
    onCreate,
    onImport,
    title = "No questions found",
    description = "This list is currently empty. Start by creating a new question manually or importing from a document."
}: QuestionsEmptyStateProps) {
    return (
        <EmptyState
            icon="📝"
            title={title}
            description={description}
            action={
                <div className="flex gap-2 justify-center">
                    {onCreate ? (
                        <Button
                            onClick={onCreate}
                            className="bg-[#323d8f] text-white hover:bg-[#323d8f]/90"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Create Question
                        </Button>
                    ) : null}
                    {onImport ? (
                        <Button
                            variant="outline"
                            onClick={onImport}
                            className="gap-2"
                        >
                            <Upload className="h-4 w-4" />
                            Import / Upload
                        </Button>
                    ) : null}
                </div>
            }
            className="animate-in fade-in-50"
        />
    );
}
