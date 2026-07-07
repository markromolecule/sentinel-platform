import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_AUDIO_ANOMALY_CONFIG, type AudioAnomalySettingsRecord } from '@sentinel/shared';
import { AudioCalibrationForm } from './audio-calibration-form';

const record: AudioAnomalySettingsRecord = {
    category: 'audio',
    key: 'audio_anomaly_config',
    description: 'Audio anomaly calibration settings',
    updatedAt: '2026-05-11T10:00:00.000Z',
    updatedBy: 'Support Operator',
    value: {
        ...DEFAULT_AUDIO_ANOMALY_CONFIG,
        thresholds: {
            ...DEFAULT_AUDIO_ANOMALY_CONFIG.thresholds,
            TALKING: 0.8,
        },
        enabledAnomalyTypes: [...DEFAULT_AUDIO_ANOMALY_CONFIG.enabledAnomalyTypes],
    },
};

describe('AudioCalibrationForm', () => {
    it('renders persisted values and metadata from the audio settings record', () => {
        render(<AudioCalibrationForm record={record} isPending={false} onSubmit={vi.fn()} />);

        expect(screen.getByText(/audio anomaly calibration/i)).toBeTruthy();
        expect(screen.getByText(/support operator/i)).toBeTruthy();
        expect(screen.getAllByText(/base 0.80/i)).not.toHaveLength(0);
        expect(
            screen.getByText(
                /higher values lower the effective threshold and make detection more sensitive/i,
            ),
        ).toBeTruthy();
    });

    it('updates the effective threshold display when sensitivity changes', async () => {
        render(<AudioCalibrationForm record={record} isPending={false} onSubmit={vi.fn()} />);

        const sensitivityThumb = screen.getAllByRole('slider')[0];
        sensitivityThumb.focus();
        fireEvent.keyDown(sensitivityThumb, { key: 'ArrowRight' });

        expect(await screen.findAllByText(/effective 0.73/i)).not.toHaveLength(0);
    });

    it('blocks invalid submissions and shows validation feedback', async () => {
        const onSubmit = vi.fn();
        render(<AudioCalibrationForm record={record} isPending={false} onSubmit={onSubmit} />);

        fireEvent.change(screen.getByLabelText(/consecutive frame threshold/i), {
            target: { value: '0' },
        });
        fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

        expect(onSubmit).not.toHaveBeenCalled();
    });

    it('submits the shared defaults when reset to defaults is clicked', () => {
        const onSubmit = vi.fn();
        render(<AudioCalibrationForm record={record} isPending={false} onSubmit={onSubmit} />);

        fireEvent.click(screen.getByRole('button', { name: /reset to defaults/i }));

        expect(onSubmit).toHaveBeenCalledWith({
            ...DEFAULT_AUDIO_ANOMALY_CONFIG,
            thresholds: { ...DEFAULT_AUDIO_ANOMALY_CONFIG.thresholds },
            enabledAnomalyTypes: [...DEFAULT_AUDIO_ANOMALY_CONFIG.enabledAnomalyTypes],
        });
    });
});
