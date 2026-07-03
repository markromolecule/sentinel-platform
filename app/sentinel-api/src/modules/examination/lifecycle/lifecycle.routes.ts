import { OpenAPIHono } from '@hono/zod-openapi';
import { type HonoEnv } from '../../../types/hono';
import {
    closeExamAttemptRoute,
    closeExamAttemptRouteHandler,
} from './controllers/close-exam-attempt.controller';
import {
    finalizeExamAttemptScoreRoute,
    finalizeExamAttemptScoreRouteHandler,
} from './controllers/finalize-exam-attempt-score.controller';
import {
    grantMakeupExamWindowRoute,
    grantMakeupExamWindowRouteHandler,
} from './controllers/grant-makeup-exam-window.controller';
import {
    grantRetakeExamWindowRoute,
    grantRetakeExamWindowRouteHandler,
} from './controllers/grant-retake-exam-window.controller';
import {
    lockExamAttemptRoute,
    lockExamAttemptRouteHandler,
} from './controllers/lock-exam-attempt.controller';
import {
    reopenExamAttemptRoute,
    reopenExamAttemptRouteHandler,
} from './controllers/reopen-exam-attempt.controller';
import {
    resetExamAttemptRoute,
    resetExamAttemptRouteHandler,
} from './controllers/reset-exam-attempt.controller';
import {
    reviseFinalizedAttemptScoreRoute,
    reviseFinalizedAttemptScoreRouteHandler,
} from './controllers/revise-finalized-attempt-score.controller';

/**
 * Registers additive exam lifecycle routes on the exams router.
 */
export function registerLifecycleRoutes(app: OpenAPIHono<HonoEnv>) {
    app.openapi(lockExamAttemptRoute, lockExamAttemptRouteHandler);
    app.openapi(reopenExamAttemptRoute, reopenExamAttemptRouteHandler);
    app.openapi(resetExamAttemptRoute, resetExamAttemptRouteHandler);
    app.openapi(closeExamAttemptRoute, closeExamAttemptRouteHandler);
    app.openapi(finalizeExamAttemptScoreRoute, finalizeExamAttemptScoreRouteHandler);
    app.openapi(reviseFinalizedAttemptScoreRoute, reviseFinalizedAttemptScoreRouteHandler);
    app.openapi(grantMakeupExamWindowRoute, grantMakeupExamWindowRouteHandler);
    app.openapi(grantRetakeExamWindowRoute, grantRetakeExamWindowRouteHandler);
}
