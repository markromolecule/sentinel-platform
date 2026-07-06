import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_EXAMINATION_GLOBAL_SETTINGS } from '@sentinel/shared/constants';
import { resolveExaminationGlobalSettings } from './resolve-examination-global-settings.service';
import { getGlobalExaminationSettingsData } from '../data/get-global-settings';

vi.mock('../data/get-global-settings', () => ({
    getGlobalExaminationSettingsData: vi.fn(),
}));

describe('resolveExaminationGlobalSettings', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('falls back to shared defaults when the settings row is missing', async () => {
        vi.mocked(getGlobalExaminationSettingsData).mockResolvedValue(undefined);

        await expect(resolveExaminationGlobalSettings({} as any)).resolves.toEqual({
            ...DEFAULT_EXAMINATION_GLOBAL_SETTINGS,
        });
    });

    it('parses object JSON values from system settings', async () => {
        vi.mocked(getGlobalExaminationSettingsData).mockResolvedValue({
            setting_value: {
                ...DEFAULT_EXAMINATION_GLOBAL_SETTINGS,
                defaultPassingScore: 60,
            },
        } as any);

        await expect(resolveExaminationGlobalSettings({} as any)).resolves.toMatchObject({
            defaultPassingScore: 60,
        });
    });

    it('parses stringified JSON values from system settings', async () => {
        vi.mocked(getGlobalExaminationSettingsData).mockResolvedValue({
            setting_value: JSON.stringify({
                ...DEFAULT_EXAMINATION_GLOBAL_SETTINGS,
                defaultLobbyAdmissionMode: 'INSTRUCTOR_GATED',
            }),
        } as any);

        await expect(resolveExaminationGlobalSettings({} as any)).resolves.toMatchObject({
            defaultLobbyAdmissionMode: 'INSTRUCTOR_GATED',
        });
    });

    it('falls back to shared defaults when the stored value is malformed', async () => {
        vi.mocked(getGlobalExaminationSettingsData).mockResolvedValue({
            setting_value: '{"defaultPassingScore":"oops"}',
        } as any);

        await expect(resolveExaminationGlobalSettings({} as any)).resolves.toEqual({
            ...DEFAULT_EXAMINATION_GLOBAL_SETTINGS,
        });
    });

    it('falls back to shared defaults when only partial settings are stored', async () => {
        vi.mocked(getGlobalExaminationSettingsData).mockResolvedValue({
            setting_value: {
                defaultPassingScore: 55,
            },
        } as any);

        await expect(resolveExaminationGlobalSettings({} as any)).resolves.toEqual({
            ...DEFAULT_EXAMINATION_GLOBAL_SETTINGS,
        });
    });
});
