import { Router } from 'express';
import { config } from "../config.js";
import { logError, logInfo } from "../utils/logger.js";
import getElapsedTime from "../utils/getElapsedTime.js";
import indexRoute from './forum/indexRoute.js';
import loginRoute from './forum/loginRoute.js';
import registerRoute from './forum/registerRoute.js';

export default (DBManager, translationManager) => {
    const router = Router();
    const logger = { logError, logInfo };
    const utils = {
        translationManager,
        getElapsedTime
    }

    /* INDEX (HOME PAGE) ROUTER */
    indexRoute(router, config, logger, utils, DBManager);

    /* LOGIN ROUTER */
    loginRoute(router, config, logger, utils, DBManager);

    /* REGISTER ROUTER */
    registerRoute(router, config, logger, utils, DBManager);

    return router;
}