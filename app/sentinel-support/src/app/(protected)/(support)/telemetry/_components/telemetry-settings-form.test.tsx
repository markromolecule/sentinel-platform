import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ApiProvider } from '@sentinel/hooks';
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
    function renderForm(
        overrides?: Partial<ComponentProps<typeof TelemetrySettingsForm>>,
        apiClient = vi.fn(),
    ) {
        return render(
            <ApiProvider apiClient={apiClient}>
                <TelemetrySettingsForm
                    record={settingsRecord as any}
                    isPending={false}
                    onSubmit={vi.fn()}
                    {...overrides}
                />
            </ApiProvider>,
        );
    }

    it('starts clean, becomes dirty after editing, and submits the full payload', () => {
        const onSubmit = vi.fn();

        renderForm({ onSubmit });

        const saveButton = screen.getByRole('button', { name: /sync settings/i });
        const resetButton = screen.getByRole('button', { name: /discard changes/i });

        expect((saveButton as HTMLButtonElement).disabled).toBe(true);
        expect((resetButton as HTMLButtonElement).disabled).toBe(true);

        const dedupeInput = screen.getByLabelText(/dedupe window \(s\)/i);
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
        renderForm();

        expect(screen.getByText(/all synced/i)).toBeTruthy();

        const saveButton = screen.getByRole('button', { name: /sync settings/i });
        const resetButton = screen.getByRole('button', { name: /discard changes/i });
        const batchWindowInput = screen.getByLabelText(/batch window \(ms\)/i);

        fireEvent.change(batchWindowInput, { target: { value: '6000' } });
        expect((saveButton as HTMLButtonElement).disabled).toBe(false);

        fireEvent.click(resetButton);
        expect((saveButton as HTMLButtonElement).disabled).toBe(true);
    });

    it('shows review interpretation guidance in the rule overrides section', () => {
        renderForm();

        fireEvent.click(screen.getByRole('button', { name: /rule overrides/i }));

        expect(screen.getByText(/threshold triggered/i)).toBeTruthy();
        expect(screen.getByText(/repeat escalated/i)).toBeTruthy();
        expect(screen.getByText(/operator note/i)).toBeTruthy();
    });

    it('renders the live MediaPipe sandbox workspace and telemetry preview panel', () => {
        renderForm();

        fireEvent.click(screen.getByRole('button', { name: /mediapipe sandbox/i }));

        expect(screen.getByText(/live calibration workspace/i)).toBeTruthy();
        expect(screen.getByText(/telemetry preview/i)).toBeTruthy();
        expect(screen.getByText(/supported signals/i)).toBeTruthy();
        expect(screen.getByText(/optional ingestion dry run/i)).toBeTruthy();
    });

    it('surfaces MediaPipe warning states when sandbox is enabled without rollout toggles', () => {
        renderForm({
            record: {
                ...settingsRecord,
                value: {
                    ...DEFAULT_TELEMETRY_SETTINGS,
                    mediaPipeSandbox: {
                        ...DEFAULT_TELEMETRY_SETTINGS.mediaPipeSandbox,
                        enabled: true,
                        captureDuringCheckup: false,
                        emitDuringExam: false,
                    },
                },
            } as any,
        });

        expect(screen.getByText(/mediapipe enabled but not emitting/i)).toBeTruthy();
    });
});
