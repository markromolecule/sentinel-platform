import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { QuestionSectionCard } from './question-section-card';

describe('QuestionSectionCard', () => {
    it('notifies callers when section instructions change', () => {
        const handleDescriptionChange = vi.fn();

        render(
            <QuestionSectionCard
                section={{
                    id: 'section-1',
                    title: 'Part I',
                    description: 'Initial instructions.',
                    orderIndex: 0,
                    isCollapsed: false,
                }}
                questionCount={0}
                totalPoints={0}
                isSectionDragging={false}
                isSectionDropTarget={false}
                onSectionDragStart={vi.fn()}
                onSectionDragEnter={vi.fn()}
                onSectionDragOver={vi.fn()}
                onSectionDrop={vi.fn()}
                onSectionDragEnd={vi.fn()}
                onSectionTitleChange={vi.fn()}
                onSectionDescriptionChange={handleDescriptionChange}
                onToggleCollapse={vi.fn()}
                onImportQuestions={vi.fn()}
                onAddQuestion={vi.fn()}
            />,
        );

        fireEvent.change(screen.getByLabelText('Part I instructions'), {
            target: { value: 'Use complete sentences.' },
        });

        expect(handleDescriptionChange).toHaveBeenCalledWith('Use complete sentences.');
    });
});
