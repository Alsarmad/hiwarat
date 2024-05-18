import { Router } from 'express';
import { config } from "../config.js";
import { logError, logInfo } from "../utils/logger.js";
import generateUniqueId from '../utils/generateUniqueId.js';
import {
    sendUnauthorizedResponse,
    getMissingFields,
    stripSensitiveFields,
    sendMissingFieldsResponse,
    checkUserAuthentication,
    checkUserRole,
    convertToBoolean,
    tryParseJSON
} from '../utils/apiHelpers.js';
import usersRoute from "./api/v1/usersRoute.js";
import postsRoute from "./api/v1/postsRoute.js";

const logger = { logError, logInfo };
const utils = {
    sendUnauthorizedResponse,
    getMissingFields,
    stripSensitiveFields,
    sendMissingFieldsResponse,
    checkUserAuthentication,
    checkUserRole,
    convertToBoolean,
    tryParseJSON,
    generateUniqueId
}
const router = Router();

export default (DBManager) => {
    /* USERS ROUTER */
    usersRoute(router, config, logger, utils, DBManager);

    /* POSTS ROUTER */
    postsRoute(router, config, logger, utils, DBManager);

    // /* ADVERTISEMENTS ROUTER */
    // advertisementsRoute(router, config, logger, utils, DBManager);

    return router;
}