import { OpenAPIHono } from '@hono/zod-openapi';
import { type HonoEnv } from '@/types/hono';
import { authMiddleware } from '@/middleware/auth';

import {
    createStudentRoute,
    createStudentRouteHandler,
} from './controllers/create-student.controller';
import {
    getOnboardingDepartmentsRoute,
    getOnboardingDepartmentsRouteHandler,
} from './controllers/get-departments.controller';
import {
    getOnboardingCoursesRoute,
    getOnboardingCoursesRouteHandler,
} from './controllers/get-courses.controller';
import {
    getOnboardingInstitutionsRoute,
    getOnboardingInstitutionsRouteHandler,
} from './controllers/get-institutions.controller';
import {
    getInstitutionRoute,
    getInstitutionRouteHandler,
} from './controllers/get-institution.controller';

const onboardingRoutes = new OpenAPIHono<HonoEnv>();

// Apply auth middleware to all onboarding routes
onboardingRoutes.use('*', authMiddleware);

// Traffic Director
onboardingRoutes
    .openapi(createStudentRoute, createStudentRouteHandler)
    .openapi(getOnboardingDepartmentsRoute, getOnboardingDepartmentsRouteHandler)
    .openapi(getOnboardingInstitutionsRoute, getOnboardingInstitutionsRouteHandler)
    .openapi(getOnboardingCoursesRoute, getOnboardingCoursesRouteHandler)
    .openapi(getInstitutionRoute, getInstitutionRouteHandler);

export default onboardingRoutes;
