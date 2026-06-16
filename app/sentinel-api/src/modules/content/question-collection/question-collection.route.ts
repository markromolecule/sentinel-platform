import { OpenAPIHono } from '@hono/zod-openapi';
import { authMiddleware } from '../../../middleware/auth';
import { type HonoEnv } from '../../../types/hono';
import {
    addQuestionCollectionQuestionsRoute,
    addQuestionCollectionQuestionsRouteHandler,
} from './controllers/add-question-collection-questions.controller';
import {
    createQuestionCollectionRoute,
    createQuestionCollectionRouteHandler,
} from './controllers/create-question-collection.controller';
import {
    deleteQuestionCollectionRoute,
    deleteQuestionCollectionRouteHandler,
} from './controllers/delete-question-collection.controller';
import {
    getQuestionCollectionRoute,
    getQuestionCollectionRouteHandler,
} from './controllers/get-question-collection.controller';
import {
    getQuestionCollectionsRoute,
    getQuestionCollectionsRouteHandler,
} from './controllers/get-question-collections.controller';
import {
    removeQuestionCollectionQuestionsRoute,
    removeQuestionCollectionQuestionsRouteHandler,
} from './controllers/remove-question-collection-questions.controller';
import {
    getQuestionCollectionSharesRoute,
    getQuestionCollectionSharesRouteHandler,
    shareQuestionCollectionRoute,
    shareQuestionCollectionRouteHandler,
} from './controllers/share-question-collection.controller';
import {
    updateQuestionCollectionRoute,
    updateQuestionCollectionRouteHandler,
} from './controllers/update-question-collection.controller';

const questionCollectionRoutes = new OpenAPIHono<HonoEnv>();

questionCollectionRoutes.use('*', authMiddleware);

questionCollectionRoutes
    .openapi(getQuestionCollectionsRoute, getQuestionCollectionsRouteHandler)
    .openapi(getQuestionCollectionRoute, getQuestionCollectionRouteHandler)
    .openapi(createQuestionCollectionRoute, createQuestionCollectionRouteHandler)
    .openapi(updateQuestionCollectionRoute, updateQuestionCollectionRouteHandler)
    .openapi(addQuestionCollectionQuestionsRoute, addQuestionCollectionQuestionsRouteHandler)
    .openapi(removeQuestionCollectionQuestionsRoute, removeQuestionCollectionQuestionsRouteHandler)
    .openapi(getQuestionCollectionSharesRoute, getQuestionCollectionSharesRouteHandler)
    .openapi(shareQuestionCollectionRoute, shareQuestionCollectionRouteHandler)
    .openapi(deleteQuestionCollectionRoute, deleteQuestionCollectionRouteHandler);

export default questionCollectionRoutes;
