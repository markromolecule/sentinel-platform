import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenAPIHono } from '@hono/zod-openapi';
import {
    getExaminationConfigurationDefaultsRoute,
    getExaminationConfigurationDefaultsRouteHandler,
} from './get-examination-configuration-defaults.controller';
import { ConfigurationService } from '../configuration.service';

vi.mock('../configuration.service', () => ({
    ConfigurationService: {
        getExaminationConfigurationDefaults: vi.fn(),
    },
}));

function createApp(activePermissionKeys: string[] = ['examinations:create']) {
    const app = new OpenAPIHono();

    app.use('*', async (c, next) => {
        c.set('dbClient', {} as any);
        c.set('user', { id: 'user-1' } as any);
        c.set('institutionId', 'institution-1');
        c.set('supabaseUser', {
            user_metadata: {
                role: 'instructor',
            },
        } as any);
        c.set('role', 'instructor');
        c.set('activePermissionKeys', activePermissionKeys as any);
        await next();
    });

    app.openapi(
        getExaminationConfigurationDefaultsRoute,
        getExaminationConfigurationDefaultsRouteHandler,
    );

    return app;
}

describe('getExaminationConfigurationDefaultsRouteHandler', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(ConfigurationService.getExaminationConfigurationDefaults).mockResolvedValue({
            defaultDurationMinutes: 60,
            defaultPassingScore: 70,
            defaultShuffleQuestions: false,
            defaultShowCorrectAnswers: false,
            defaultAllowReview: false,
            defaultRandomizeChoices: false,
            defaultLobbyAdmissionMode: 'AUTOMATIC',
            defaultMaxReconnectAttempts: 3,
            defaultStrictMode: true,
            defaultCameraRequired: true,
            defaultMicRequired: true,
            defaultScreenLock: true,
            defaultAutoSubmitTimeoutMinutes: 5,
            defaultAiRules: {
                gaze_tracking: true,
                face_detection: true,
                audio_anomaly_detection: true,
                multiple_faces_detection: true,
            },
            defaultWebSecurity: {
                tab_switching_monitor: true,
                full_screen_required: true,
                clipboard_control: true,
                right_click_disable: true,
                print_screen_disable: true,
            },
            defaultMobileSecurity: {
                app_pinning_required: true,
                prevent_backgrounding: true,
                notification_block: true,
                screenshot_block: true,
                root_jailbreak_detection: true,
            },
        });
    });

    it('allows callers with exam-create permission', async () => {
        const app = createApp(['examinations:create']);
        const response = await app.request('/defaults');

        expect(response.status).toBe(200);
        expect(ConfigurationService.getExaminationConfigurationDefaults).toHaveBeenCalledWith(
            expect.anything(),
        );
    });

    it('allows callers with exam-update permission', async () => {
        const app = createApp(['examinations:update']);
        const response = await app.request('/defaults');

        expect(response.status).toBe(200);
    });

    it('rejects callers without exam-create or exam-update permission', async () => {
        const app = createApp(['examinations:view']);
        const response = await app.request('/defaults');

        expect(response.status).toBe(403);
        expect(ConfigurationService.getExaminationConfigurationDefaults).not.toHaveBeenCalled();
    });
});
