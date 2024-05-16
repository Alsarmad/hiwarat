import { Router } from 'express';
import { config } from "../config.js";
import { logError, logInfo } from "../utils/logger.js";
import {
    sendUnauthorizedResponse,
    getMissingFields,
    stripSensitiveFields,
    sendMissingFieldsResponse,
    validateAPIKeys
} from '../utils/helpersApi.js';

const logger = { logError, logInfo };
const helpersApi = {
    sendUnauthorizedResponse,
    getMissingFields,
    stripSensitiveFields,
    sendMissingFieldsResponse,
    validateAPIKeys
}
const router = Router();

/* USERS ROUTER */
import usersRoute from "./api/v1/usersRoute.js";
usersRoute(router, config, logger, helpersApi);

// /* ADVERTISEMENTS ROUTER */
// import advertisementsRoute from "./api/v1/advertisementsRoute.js";
// advertisementsRoute(router, config, logger);

export default router;