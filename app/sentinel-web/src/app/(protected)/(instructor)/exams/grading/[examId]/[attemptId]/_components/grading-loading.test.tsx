import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GradingLoading } from './grading-loading';

describe('GradingLoading', () => {
    it('renders the loading state elements correctly', () => {
        render(<GradingLoading />);
        expect(screen.getByText('Loading submission details...')).toBeTruthy();
    });
});
