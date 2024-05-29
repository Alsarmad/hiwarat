export default async (router, config, logger, utils, DBManager) => {
    const { logError } = logger;
    try {
        const {
            translationManager,
            rateLimit,
            getMissingFields,
            sendMissingFieldsResponse,
            checkUserAuthentication,
            convertToBoolean,
            generateUniqueId,
            dataValidator
        } = utils;
        const { postsDBManager, reportsDBManager } = DBManager;
        let lang = config.defaultLang;
        const MAX_REPORTS_PER_PAGE = 20;

        // إعداد المحدد للطلبات مع رسالة مخصصة
        const createReportLimiter = rateLimit({
            windowMs: 24 * 60 * 60 * 1000, // 24 ساعة
            max: 20, // الحد الأقصى لعدد الطلبات لكل IP خلال نافذة الوقت المحددة
            handler: (req, res) => {
                const { query } = req;

                if (query?.lang) {
                    lang = query?.lang
                }

                const message = translationManager.translate('report_rate_limit_exceeded', {}, lang);
                res.status(429).json({
                    success: false,
                    message: message,
                });
            },
            headers: true,
        });

        // الحصول على كل البلاغات
        router.get('/reports', async (req, res) => {
            try {

                const { query } = req;

                if (query?.lang) {
                    lang = query?.lang
                }

                const page = parseInt(query.page) || 1;
                let limit = parseInt(query.limit) || MAX_REPORTS_PER_PAGE;
                limit = Math.min(limit, MAX_REPORTS_PER_PAGE);
                if (parseInt(query.limit) > MAX_REPORTS_PER_PAGE) {
                    const message = translationManager.translate('max_reports_per_page_exceeded', { max_reports_per_page: MAX_REPORTS_PER_PAGE }, lang);
                    return res.status(400).json({
                        success: false,
                        message: message,
                    });
                }
                const offset = (page - 1) * limit;
                const reports = reportsDBManager.getRecordsPaginated("reports", limit, offset);

                if (reports.length === 0) {
                    const message = translationManager.translate('no_records_found', {}, lang);
                    return res.status(404).json({
                        success: false,
                        reports: [],
                        message: message
                    });
                }
                return res.status(200).json({
                    success: true,
                    reports: reports
                });

            } catch (error) {
                logError("An error occurred while processing the request", error);
                return res.status(500).json({ message: `${error}` });
            }
        });

        // إنشاء بلاغ جديد
        router.post('/create-reports', createReportLimiter, async (req, res) => {
            try {
                const { query, body, headers } = req;

                if (query?.lang) {
                    lang = query?.lang
                }

                const authResult = await checkUserAuthentication({ username: headers["username"], password: headers["password"] }, { session: req.session, lang: lang });
                if (!authResult.success) {
                    return res.status(401).json(authResult);
                }

                const isBanned = convertToBoolean(authResult.user.is_banned);
                if (isBanned) {
                    const message = translationManager.translate('user_banned_create_report', { requester: authResult.user.username }, lang);
                    return res.status(403).json({
                        success: false,
                        message: message
                    });
                }

                const missingFields = getMissingFields(body, ["reported_item_type", "reported_item_id", "report_type", "report_description"]);
                if (missingFields.length > 0) {
                    return sendMissingFieldsResponse(res, missingFields, lang);
                }

                // التحقق من البيانات المدخلة
                const validation = dataValidator(body, translationManager, lang);
                if (!validation.success) {
                    return res.status(400).json({
                        success: false,
                        message: validation.message,
                    });
                }

                const reported_item_type = body.reported_item_type?.toLowerCase();

                if (reported_item_type === "post") {
                    const post = postsDBManager.findRecord("posts", { post_id: body.reported_item_id });
                    if (!post) {
                        const message = translationManager.translate('post_not_found', {}, lang);
                        return res.status(404).json({
                            success: false,
                            message: message
                        });
                    }
                }

                if (reported_item_type === "comment") {
                    const comment = postsDBManager.findRecord("comments", { comment_id: body.reported_item_id });
                    if (!comment) {
                        const message = translationManager.translate('comment_not_found', {}, lang);
                        return res.status(404).json({
                            success: false,
                            message: message
                        });
                    }
                }

                // معرف فريد للبلاغ
                const report_id = generateUniqueId(35);
                // الوقت الحالي
                const currentTime = new Date().toISOString();
                const dataReport = {
                    report_id: report_id,
                    user_id: authResult.user.user_id,
                    reported_item_type: reported_item_type,
                    reported_item_id: body.reported_item_id,
                    report_type: body.report_type?.trim()?.toLowerCase(),
                    report_description: body.report_description,
                    created_at: currentTime,
                }

                reportsDBManager.insertRecord("reports", dataReport);
                const message = translationManager.translate('report_created', { report_id: report_id }, lang);
                res.status(200).json({
                    success: true,
                    report: dataReport,
                    message: message
                });

            } catch (error) {
                logError("An error occurred while processing the request", error);
                return res.status(500).json({ message: `${error}` });
            }
        });

        // الحصول على بلاغ بواسطة المعرف
        router.get('/reports/:report_id', async (req, res) => {
            try {

                const { query, params } = req;
                const { report_id } = params;

                if (query?.lang) {
                    lang = query?.lang
                }

                if (report_id && report_id.length > 50) {
                    const message = translationManager.translate('report_id_too_long', { length: 50 }, lang);
                    return res.status(422).json({
                        success: false,
                        message: message,
                    });
                }

                // التحقق من وجود البلاغ
                const report = await reportsDBManager.findRecord("reports", { report_id });
                if (!report) {
                    const message = translationManager.translate('report_not_found', {}, lang);
                    return res.status(404).json({
                        success: false,
                        message: message
                    });
                }

                res.status(200).json({
                    success: true,
                    report: report
                });

            } catch (error) {
                logError("An error occurred while processing the request", error);
                return res.status(500).json({ message: `${error}` });
            }
        });

        // حذف بلاغ بواسطة المعرف
        router.delete('/reports/:report_id', async (req, res) => {
            try {

                const { query, params, headers } = req;
                const { report_id } = params;

                if (query?.lang) {
                    lang = query?.lang
                }

                if (report_id && report_id.length > 50) {
                    const message = translationManager.translate('report_id_too_long', { length: 50 }, lang);
                    return res.status(422).json({
                        success: false,
                        message: message,
                    });
                }

                const authResult = await checkUserAuthentication({ username: headers["username"], password: headers["password"] }, { session: req.session, lang: lang });
                if (!authResult.success) {
                    return res.status(401).json(authResult);
                }

                const isBanned = convertToBoolean(authResult.user.is_banned);
                if (isBanned) {
                    const message = translationManager.translate('user_banned_delete_report', { requester: authResult.user.username }, lang);
                    return res.status(403).json({
                        success: false,
                        message: message
                    });
                }

                const isModeratorOrAdmin = checkUserRole(authResult.user, ["admin", "moderator"]);
                if (!isModeratorOrAdmin) {
                    const message = translationManager.translate('not_authorized_delete_report', {}, lang);
                    return res.status(403).json({
                        success: false,
                        message: message
                    });
                }

                // التحقق من وجود البلاغ
                const report = await reportsDBManager.findRecord("reports", { report_id });
                if (!report) {
                    const message = translationManager.translate('report_not_found', {}, lang);
                    return res.status(404).json({
                        success: false,
                        message: message
                    });
                }

                // حذف البلاغ
                reportsDBManager.deleteRecord("reports", { report_id });

                const message = translationManager.translate('report_deleted', { report_id: report_id }, lang);
                res.status(200).json({
                    success: true,
                    report: report,
                    message: message
                });

            } catch (error) {
                logError("An error occurred while processing the request", error);
                return res.status(500).json({ message: `${error}` });
            }
        });

    } catch (error) {
        logError("An error occurred while processing the request", error);
    }
}
