import { render, fireEvent, cleanup } from '@testing-library/react';
import { describe, expect, it, vi, afterEach } from 'vitest';
import { AttemptReportActions } from './attempt-report-actions';
import React from 'react';

afterEach(() => {
    cleanup();
});

describe('AttemptReportActions', () => {
    it('renders nothing when not editable or has no submit handler', () => {
        const { container } = render(
            <AttemptReportActions
                editable={false}
                hasSubmitHandler={true}
                isSubmitting={false}
                onSaveOverrides={vi.fn()}
                onSaveAndFinalize={vi.fn()}
            />
        );
        expect(container.firstChild).toBeNull();
    });

    it('renders save overrides and save & finalize buttons when editable and not finalized', () => {
        const onSaveOverrides = vi.fn();
        const onSaveAndFinalize = vi.fn();

        const { getByText } = render(
            <AttemptReportActions
                editable={true}
                hasSubmitHandler={true}
                isSubmitting={false}
                onSaveOverrides={onSaveOverrides}
                onSaveAndFinalize={onSaveAndFinalize}
                isFinalized={false}
            />
        );

        const saveBtn = getByText('Save Overrides');
        const finalizeBtn = getByText('Save & Finalize Report');

        expect(saveBtn).toBeTruthy();
        expect(finalizeBtn).toBeTruthy();

        fireEvent.click(saveBtn);
        expect(onSaveOverrides).toHaveBeenCalledOnce();

        fireEvent.click(finalizeBtn);
        expect(onSaveAndFinalize).toHaveBeenCalledOnce();
    });

    it('renders read-only finalized badge and message when finalized', () => {
        const { getByText, queryByText } = render(
            <AttemptReportActions
                editable={true}
                hasSubmitHandler={true}
                isSubmitting={false}
                onSaveOverrides={vi.fn()}
                onSaveAndFinalize={vi.fn()}
                isFinalized={true}
            />
        );

        expect(getByText('Report Finalized')).toBeTruthy();
        expect(getByText('This attempt report is locked and cannot be edited.')).toBeTruthy();
        expect(queryByText('Save Overrides')).toBeNull();
        expect(queryByText('Save & Finalize Report')).toBeNull();
    });
});
