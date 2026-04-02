import { OpenAPIHono } from '@hono/zod-openapi';
import { type HonoEnv } from '@/types/hono';
import { authMiddleware } from '../../middleware/auth';
import {
    getStudentWhitelistRoute,
    getStudentWhitelistRouteHandler,
} from './controllers/get-student-whitelist.controller';
import {
    createStudentWhitelistRoute,
    createStudentWhitelistRouteHandler,
} from './controllers/create-student-whitelist.controller';
import {
    bulkImportStudentWhitelistRoute,
    bulkImportStudentWhitelistRouteHandler,
} from './controllers/bulk-import-student-whitelist.controller';
import {
    deleteStudentWhitelistRoute,
    deleteStudentWhitelistRouteHandler,
} from './controllers/delete-student-whitelist.controller';
import {
    purgeStudentWhitelistRoute,
    purgeStudentWhitelistRouteHandler,
} from './controllers/purge-student-whitelist.controller';
import {
    updateStudentWhitelistRoute,
    updateStudentWhitelistRouteHandler,
} from './controllers/update-student-whitelist.controller';

const studentWhitelistRoutes = new OpenAPIHono<HonoEnv>();

studentWhitelistRoutes.use('*', authMiddleware);

studentWhitelistRoutes
    .openapi(getStudentWhitelistRoute, getStudentWhitelistRouteHandler)
    .openapi(createStudentWhitelistRoute, createStudentWhitelistRouteHandler)
    .openapi(bulkImportStudentWhitelistRoute, bulkImportStudentWhitelistRouteHandler)
    .openapi(purgeStudentWhitelistRoute, purgeStudentWhitelistRouteHandler)
    .openapi(updateStudentWhitelistRoute, updateStudentWhitelistRouteHandler)
    .openapi(deleteStudentWhitelistRoute, deleteStudentWhitelistRouteHandler);

export default studentWhitelistRoutes;
