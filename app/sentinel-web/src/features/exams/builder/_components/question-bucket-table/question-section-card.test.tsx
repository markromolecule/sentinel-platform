import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { QuestionSectionCard } from './question-section-card';

describe('QuestionSectionCard', () => {
    it('reveals the instruction editor on demand and updates the description', () => {
        const handleDescriptionChange = vi.fn();

        render(
            <QuestionSectionCard
                section={{
                    id: 'section-1',
                    title: 'Part I',
                    description: '',
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

        expect(screen.queryByLabelText('Part I instructions')).toBeNull();

        fireEvent.click(screen.getByRole('button', { name: /add instruction/i }));

        const instructions = screen.getByLabelText('Part I instructions');
        expect(instructions).toBeTruthy();

        fireEvent.change(instructions, {
            target: { value: 'Use complete sentences.' },
        });

        expect(handleDescriptionChange).toHaveBeenCalledWith('Use complete sentences.');
    });
});
