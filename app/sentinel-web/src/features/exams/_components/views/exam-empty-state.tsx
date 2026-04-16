'use client';

import { Button, EmptyState } from '@sentinel/ui';
import { Plus } from 'lucide-react';
import { ExamEmptyStateProps } from '@sentinel/shared/types';

const EMPTY_STATE_CONTENT: Record<
    NonNullable<ExamEmptyStateProps['variant']>,
    {
        icon: string;
        title: string;
        description: string;
        showCreateAction: boolean;
    }
> = {
    all: {
        icon: '📝',
        title: 'No exams yet',
        description:
            "You haven't created any exams yet. Use the button below to create your first draft.",
        showCreateAction: true,
    },
    published: {
        icon: '🚀',
        title: 'No published exams',
        description: 'Published exams will appear here once you publish a draft.',
        showCreateAction: false,
    },
    drafts: {
        icon: '🗂️',
        title: 'No draft exams',
        description: 'Start a new exam draft to prepare your next assessment.',
        showCreateAction: true,
    },
    archived: {
        icon: '🗃️',
        title: 'No archived exams',
        description: 'Archived exams will appear here when you move old exams out of circulation.',
        showCreateAction: false,
    },
};

export function ExamEmptyState({
    isSearching,
    onCreateClick,
    variant = 'all',
}: ExamEmptyStateProps) {
    const content = EMPTY_STATE_CONTENT[variant];

    return (
        <EmptyState
            icon={isSearching ? '🔎' : content.icon}
            title={isSearching ? 'No exams found' : content.title}
            description={
                isSearching ? 'No results found. Try a different search term.' : content.description
            }
            action={
                !isSearching && content.showCreateAction ? (
                    <Button onClick={onCreateClick} className="bg-[#323d8f] hover:bg-[#323d8f]/90">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Exam
                    </Button>
                ) : undefined
            }
            className="animate-in fade-in-50 h-full min-h-[320px] border-dashed"
        />
    );
}
