import { OpenAPIHono } from '@hono/zod-openapi';
import { authMiddleware } from '../../../middleware/auth';
import { type HonoEnv } from '../../../types/hono';
import {
    addQuestionBankCollectionQuestionsRoute,
    addQuestionBankCollectionQuestionsRouteHandler,
} from './controllers/add-question-bank-collection-questions.controller';
import {
    createQuestionBankCollectionRoute,
    createQuestionBankCollectionRouteHandler,
} from './controllers/create-question-bank-collection.controller';
import {
    deleteQuestionBankCollectionRoute,
    deleteQuestionBankCollectionRouteHandler,
} from './controllers/delete-question-bank-collection.controller';
import {
    getQuestionBankCollectionRoute,
    getQuestionBankCollectionRouteHandler,
} from './controllers/get-question-bank-collection.controller';
import {
    getQuestionBankCollectionsRoute,
    getQuestionBankCollectionsRouteHandler,
} from './controllers/get-question-bank-collections.controller';
import {
    getQuestionCollectionSharesRoute,
    getQuestionCollectionSharesRouteHandler,
    shareQuestionCollectionRoute,
    shareQuestionCollectionRouteHandler,
} from '../question-collection/controllers/share-question-collection.controller';
import {
    removeQuestionBankCollectionQuestionsRoute,
    removeQuestionBankCollectionQuestionsRouteHandler,
} from './controllers/remove-question-bank-collection-questions.controller';
import {
    updateQuestionBankCollectionRoute,
    updateQuestionBankCollectionRouteHandler,
} from './controllers/update-question-bank-collection.controller';
import {
    getTosMatrixRoute,
    getTosMatrixRouteHandler,
} from './controllers/get-tos-matrix.controller';

const questionBankRoutes = new OpenAPIHono<HonoEnv>();

questionBankRoutes.use('*', authMiddleware);

questionBankRoutes
    .openapi(getQuestionBankCollectionsRoute, getQuestionBankCollectionsRouteHandler)
    .openapi(getQuestionBankCollectionRoute, getQuestionBankCollectionRouteHandler)
    .openapi(createQuestionBankCollectionRoute, createQuestionBankCollectionRouteHandler)
    .openapi(updateQuestionBankCollectionRoute, updateQuestionBankCollectionRouteHandler)
    .openapi(
        addQuestionBankCollectionQuestionsRoute,
        addQuestionBankCollectionQuestionsRouteHandler,
    )
    .openapi(
        removeQuestionBankCollectionQuestionsRoute,
        removeQuestionBankCollectionQuestionsRouteHandler,
    )
    .openapi(getQuestionCollectionSharesRoute, getQuestionCollectionSharesRouteHandler)
    .openapi(shareQuestionCollectionRoute, shareQuestionCollectionRouteHandler)
    .openapi(deleteQuestionBankCollectionRoute, deleteQuestionBankCollectionRouteHandler)
    .openapi(getTosMatrixRoute, getTosMatrixRouteHandler);

export default questionBankRoutes;
