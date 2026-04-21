import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_TELEMETRY_SETTINGS } from '@sentinel/shared';
import { TelemetrySettingsForm } from './telemetry-settings-form';

const settingsRecord = {
    category: 'telemetry',
    key: 'telemetry.global.settings',
    description: 'Telemetry settings',
    updatedAt: '2026-04-22T00:00:00.000Z',
    updatedBy: 'Support Operator',
    value: DEFAULT_TELEMETRY_SETTINGS,
};

describe('TelemetrySettingsForm', () => {
    it('starts clean, becomes dirty after editing, and submits the full payload', () => {
        const onSubmit = vi.fn();

        render(
            <TelemetrySettingsForm
                record={settingsRecord as any}
                isPending={false}
                onSubmit={onSubmit}
            />,
        );

        const saveButton = screen.getByRole('button', { name: /save telemetry settings/i });
        const resetButton = screen.getByRole('button', { name: /reset/i });

        expect((saveButton as HTMLButtonElement).disabled).toBe(true);
        expect((resetButton as HTMLButtonElement).disabled).toBe(true);

        const dedupeInput = screen.getByLabelText(/dedupe window \(seconds\)/i);
        fireEvent.change(dedupeInput, { target: { value: '240' } });

        expect((saveButton as HTMLButtonElement).disabled).toBe(false);
        expect((resetButton as HTMLButtonElement).disabled).toBe(false);

        fireEvent.click(saveButton);

        expect(onSubmit).toHaveBeenCalledWith(
            expect.objectContaining({
                operations: expect.objectContaining({
                    dedupeWindowSeconds: 240,
                }),
            }),
        );
    });

    it('shows metadata and resets dirty state back to the persisted record', () => {
        render(
            <TelemetrySettingsForm
                record={settingsRecord as any}
                isPending={false}
                onSubmit={vi.fn()}
            />,
        );

        expect(screen.getByText(/settings metadata/i)).toBeTruthy();
        expect(screen.getByText(/support operator/i)).toBeTruthy();

        const saveButton = screen.getByRole('button', { name: /save telemetry settings/i });
        const resetButton = screen.getByRole('button', { name: /reset/i });
        const batchWindowInput = screen.getByLabelText(/batch window \(ms\)/i);

        fireEvent.change(batchWindowInput, { target: { value: '6000' } });
        expect((saveButton as HTMLButtonElement).disabled).toBe(false);

        fireEvent.click(resetButton);
        expect((saveButton as HTMLButtonElement).disabled).toBe(true);
    });
});
