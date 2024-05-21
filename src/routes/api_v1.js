import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { config } from "../config.js";
import { logError, logInfo } from "../utils/logger.js";
import dataValidator from "../utils/dataValidator.js";
import generateUniqueId from '../utils/generateUniqueId.js';
import apiHelpers from '../utils/apiHelpers.js';
import usersRoute from "./api/v1/usersRoute.js";
import postsRoute from "./api/v1/postsRoute.js";
import commentsRoute from "./api/v1/commentsRoute.js";

const logger = { logError, logInfo };
const router = Router();
export default (DBManager, translationManager) => {

    const Helpers = apiHelpers(DBManager);
    const utils = {
        rateLimit,
        getMissingFields: Helpers.getMissingFields,
        stripSensitiveFields: Helpers.stripSensitiveFields,
        sendMissingFieldsResponse: Helpers.sendMissingFieldsResponse,
        checkUserAuthentication: Helpers.checkUserAuthentication,
        checkUserRole: Helpers.checkUserRole,
        convertToBoolean: Helpers.convertToBoolean,
        tryParseJSON: Helpers.tryParseJSON,
        generateUniqueId,
        dataValidator,
        translationManager,
    };

    /* USERS ROUTER */
    usersRoute(router, config, logger, utils, DBManager);

    /* POSTS ROUTER */
    postsRoute(router, config, logger, utils, DBManager);

    /* COMMENTS ROUTER */
    commentsRoute(router, config, logger, utils, DBManager);

    return router;
}