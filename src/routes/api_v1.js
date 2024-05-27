import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { config } from "../config.js";
import { logError, logInfo } from "../utils/logger.js";
import DataValidator from "../utils/dataValidator.js";
import getElapsedTime from "../utils/getElapsedTime.js";
import generateUniqueId from '../utils/generateUniqueId.js';
import apiHelpers from '../utils/apiHelpers.js';
import usersRoute from "./api/v1/usersRoute.js";
import postsRoute from "./api/v1/postsRoute.js";
import commentsRoute from "./api/v1/commentsRoute.js";
import hashtagsRoute from "./api/v1/hashtagsRoute.js";
import likesRoute from "./api/v1/likesRoute.js";
import reportsRoute from "./api/v1/reportsRoute.js";
import statisticsRoute from "./api/v1/statisticsRoute.js";
import utilsRoute from "./api/v1/utilsRoute.js";



export default (DBManager, translationManager) => {
    const router = Router();
    const logger = { logError, logInfo };
    const dataValidator = new DataValidator(config, translationManager);
    const Helpers = apiHelpers(DBManager, translationManager, config);
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
        getElapsedTime
    };

    /* USERS ROUTER */
    usersRoute(router, config, logger, utils, DBManager);

    /* POSTS ROUTER */
    postsRoute(router, config, logger, utils, DBManager);

    /* COMMENTS ROUTER */
    commentsRoute(router, config, logger, utils, DBManager);

    /* HASHTAGS ROUTER */
    hashtagsRoute(router, config, logger, utils, DBManager);

    /* LIKES ROUTER */
    likesRoute(router, config, logger, utils, DBManager);

    /* REPORTS ROUTER */
    reportsRoute(router, config, logger, utils, DBManager);

    /* STATISTICS ROUTER */
    statisticsRoute(router, config, logger, utils, DBManager);

    /* UTILS ROUTER */
    utilsRoute(router, config, logger, utils, DBManager);


    // Handle undefined routes (404)
    router.use((req, res, next) => {
        const message = translationManager.translate('invalid_link_try_again', {}, config.defaultLang);
        res.status(404).json({
            success: false,
            message: message
        });
    });

    return router;
}