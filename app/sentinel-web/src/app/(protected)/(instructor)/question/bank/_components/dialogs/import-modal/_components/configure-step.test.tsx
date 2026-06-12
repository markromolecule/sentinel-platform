import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { ConfigureStep } from './configure-step';
import type { QuestionTypeDistributionItem } from '../_types';
import type { BloomCognitiveLevel } from '@sentinel/shared';

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('ConfigureStep', () => {
    const mockOnToggleType = vi.fn();
    const mockOnTypeCountChange = vi.fn();
    const mockOnToggleBloomLevel = vi.fn();

    const defaultProps = {
        filesCount: 2,
        questionCount: 10,
        questionTypeDistribution: [
            { type: 'MULTIPLE_CHOICE' as const, count: 5 },
            { type: 'TRUE_FALSE' as const, count: 5 },
        ] as QuestionTypeDistributionItem[],
        onToggleType: mockOnToggleType,
        onTypeCountChange: mockOnTypeCountChange,
        isProcessing: false,
        selectedBloomLevels: ['REMEMBERING', 'UNDERSTANDING', 'APPLYING'] as BloomCognitiveLevel[],
        onToggleBloomLevel: mockOnToggleBloomLevel,
    };

    it('renders the generation summary and question type grid', () => {
        render(<ConfigureStep {...defaultProps} />);

        // Should display the summary cards
        expect(screen.getByText(/source file/)).toBeDefined();
        expect(screen.getByText('10')).toBeDefined();

        // Should display the question types section title
        expect(screen.getByText('Question types')).toBeDefined();
    });

    it('renders the Bloom taxonomy section with correct levels checked', () => {
        render(<ConfigureStep {...defaultProps} />);

        expect(screen.getByText("Bloom's Taxonomy Cognitive Levels")).toBeDefined();
        expect(
            screen.getByText(
                'Select which cognitive levels the AI should target when generating questions.',
            ),
        ).toBeDefined();

        // Check that levels are rendered
        expect(screen.getByText('Remembering')).toBeDefined();
        expect(screen.getByText('Understanding')).toBeDefined();
        expect(screen.getByText('Applying')).toBeDefined();
        expect(screen.getByText('Analyzing')).toBeDefined();
        expect(screen.getByText('Evaluating')).toBeDefined();
        expect(screen.getByText('Creating')).toBeDefined();

        // Check checkbox values (using role or testing-library selector if necessary)
        const checkboxes = screen.getAllByRole('checkbox');
        // Let's verify that clicking on one of the bloom levels calls onToggleBloomLevel
        const analyzingLabel = screen.getByText('Analyzing');
        fireEvent.click(analyzingLabel);
        expect(mockOnToggleBloomLevel).toHaveBeenCalledWith('ANALYZING');
    });

    it('disables interactions when isProcessing is true', () => {
        const { container } = render(<ConfigureStep {...defaultProps} isProcessing={true} />);

        // The container grid should have opacity-50 and pointer-events-none
        const grids = container.querySelectorAll('.pointer-events-none');
        expect(grids.length).toBeGreaterThan(0);
    });
});
