import { Router } from 'express';
import { config } from "../config.js";
import { logError, logInfo } from "../utils/logger.js";
import getElapsedTime from "../utils/getElapsedTime.js";
import apiHelpers from '../utils/apiHelpers.js';
import indexRoute from './forum/indexRoute.js';
import loginRoute from './forum/loginRoute.js';
import registerRoute from './forum/registerRoute.js';
import postsRoute from './forum/postsRoute.js';

export default (DBManager, translationManager, sessionManager) => {
    const router = Router();
    const logger = { logError, logInfo };
    const Helpers = apiHelpers(DBManager, translationManager, config);
    const utils = {
        translationManager,
        getElapsedTime,
        checkUserAuthentication: Helpers.checkUserAuthentication,
        tryParseJSON: Helpers.tryParseJSON,
        sessionManager
    }

    /* INDEX (HOME PAGE) ROUTER */
    indexRoute(router, config, logger, utils, DBManager);

    /* LOGIN ROUTER */
    loginRoute(router, config, logger, utils, DBManager);

    /* REGISTER ROUTER */
    registerRoute(router, config, logger, utils, DBManager);

    /* POSTS ROUTER */
    postsRoute(router, config, logger, utils, DBManager);

    return router;
}