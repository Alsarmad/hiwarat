import { marked } from 'marked';
import { convert } from 'html-to-text';

export default async (router, config, logger, utils, DBManager) => {
    const { logError } = logger;
    try {

        const {
            translationManager,
            rateLimit,
            getMissingFields,
            sendMissingFieldsResponse,
            checkUserAuthentication,
            tryParseJSON,
            checkUserRole,
            convertToBoolean,
            generateUniqueId,
            dataValidator
        } = utils;

        const { postsDBManager } = DBManager;
        const MAX_COMMENTS_PER_PAGE = 20;
        let lang = config.defaultLang;

        // إعداد المحدد للطلبات مع رسالة مخصصة
        const createCommentsLimiter = rateLimit({
            windowMs: 24 * 60 * 60 * 1000, // 24 ساعة
            max: 300, // الحد الأقصى لعدد الطلبات لكل IP خلال نافذة الوقت المحددة
            handler: (req, res) => {
                const message = translationManager.translate('comment_rate_limit_exceeded', {}, lang);
                res.status(429).json({
                    success: false,
                    message: message,
                });
            },
            headers: true,

        });
        // الحصول على كل التعليقات
        router.get('/comments', (req, res) => {
            try {
                const { query } = req;
                if (query?.lang) {
                    lang = query?.lang
                }
                const page = parseInt(query.page) || 1;
                let limit = parseInt(query.limit) || MAX_COMMENTS_PER_PAGE;
                limit = Math.min(limit, MAX_COMMENTS_PER_PAGE);
                if (parseInt(query.limit) > MAX_COMMENTS_PER_PAGE) {
                    const message = translationManager.translate('max_comments_per_page_exceeded', { max_comments_per_page: MAX_COMMENTS_PER_PAGE }, lang);
                    return res.status(400).json({
                        success: false,
                        message: message,
                    });
                }
                const offset = (page - 1) * limit;

                const comments = postsDBManager.getRecordsPaginated("comments", limit, offset);

                if (comments.length === 0) {
                    const message = translationManager.translate('no_records_found', {}, lang);
                    return res.status(404).json({
                        success: false,
                        comments: [],
                        message: message
                    });
                }
                return res.status(200).json({
                    success: true,
                    comments: comments
                });
            } catch (error) {
                logError("An error occurred while processing the request", error);
                return res.status(500).json({ message: `${error}` });
            }
        });

        // إنشاء تعليق جديد
        router.post('/create-comments', createCommentsLimiter, async (req, res) => {
            try {
                const { body, headers, query } = req;
                if (query?.lang) {
                    lang = query?.lang
                }
                const missingFields = getMissingFields(body, ["post_id", "comment_content"]);

                if (missingFields.length > 0) {
                    return sendMissingFieldsResponse(res, missingFields, lang);
                }

                const authResult = await checkUserAuthentication({ username: headers["username"], password: headers["password"] }, { session: req.session, lang: lang });
                if (!authResult.success) {
                    return res.status(401).json(authResult);
                }

                const isBanned = convertToBoolean(authResult.user.is_banned);
                if (isBanned) {
                    const message = translationManager.translate('user_banned_create_comment', { requester: authResult.user.username }, lang);
                    return res.status(403).json({
                        success: false,
                        message: message
                    });
                }

                const validation = dataValidator(body, translationManager, lang);
                if (!validation.success) {
                    return res.status(400).json({
                        success: false,
                        message: validation.message,
                    });
                }

                const existingPost = postsDBManager.findRecord("posts", { post_id: body.post_id });
                if (!existingPost) {
                    const message = translationManager.translate('post_not_found', {}, lang);
                    return res.status(401).json({
                        success: false,
                        message: message
                    });
                }

                const comment_id = generateUniqueId(35);
                const currentTime = new Date().toISOString();
                // عملية التحويل من ماركداون إلى HTML
                const htmlContent = marked(body.comment_content);
                // تحويل HTML إلى نص عادي
                const plainTextContent = convert(htmlContent, { wordwrap: false });

                const dataComment = {
                    comment_id,
                    post_id: body.post_id,
                    user_id: authResult.user.user_id,
                    comment_content: htmlContent,
                    comment_content_raw: plainTextContent || body.comment_content,
                    created_at: currentTime,
                    updated_at: currentTime,
                };
                postsDBManager.insertRecord("comments", dataComment);

                const message = translationManager.translate('comment_created', { comment_id: comment_id }, lang);
                res.status(200).json({
                    success: true,
                    comment: dataComment,
                    message: message
                });
            } catch (error) {
                logError("An error occurred while processing the request", error);
                return res.status(500).json({ message: `${error}` });
            }
        });

        // الحصول على تعليق بواسطة المعرف
        router.get('/comments/:comment_id', (req, res) => {
            try {
                const { query, params } = req;
                const { comment_id } = params;
                if (query?.lang) {
                    lang = query?.lang
                }
                if (comment_id && comment_id.length > 50) {
                    const message = translationManager.translate('comment_id_too_long', { length: 50 }, lang);
                    return res.status(422).json({
                        success: false,
                        message: message,
                    });
                }

                const comment = postsDBManager.findRecord("comments", { comment_id: comment_id });
                if (!comment) {
                    const message = translationManager.translate('comment_not_found', {}, lang);
                    return res.status(404).json({
                        success: false,
                        message: message
                    });
                }
                return res.status(200).json({
                    success: true,
                    comment: comment
                });
            } catch (error) {
                logError("An error occurred while processing the request", error);
                return res.status(500).json({ message: `${error}` });
            }
        });

        // تحديث تعليق بواسطة المعرف
        router.put('/comments/:comment_id', async (req, res) => {
            try {
                const { query, params, body, headers } = req;
                const { comment_id } = params;
                if (query?.lang) {
                    lang = query?.lang
                }
                if (comment_id && comment_id.length > 50) {
                    const message = translationManager.translate('comment_id_too_long', { length: 50 }, lang);
                    return res.status(422).json({
                        success: false,
                        message: message,
                    });
                }

                const authResult = await checkUserAuthentication({ username: headers["username"], password: headers["password"] }, { session: req.session, lang: lang });
                if (!authResult.success) {
                    return res.status(401).json(authResult);
                }

                const comment = postsDBManager.findRecord("comments", { comment_id: comment_id });
                if (!comment) {
                    const message = translationManager.translate('comment_not_found', {}, lang);
                    return res.status(404).json({
                        success: false,
                        message: message
                    });
                }

                // التحقق من صلاحية المستخدم لتحديث بينات المنشور
                const isOwner = authResult.user.user_id === comment.user_id;
                const isModeratorOrAdmin = checkUserRole(authResult.user, ["admin", "moderator"]);
                const isBanned = convertToBoolean(authResult.user.is_banned); // تأكد من حالة الحظر للمستخدم

                // تحقق من حالة الحظر أولاً
                if (isBanned) {
                    const message = translationManager.translate('user_banned_update_comment', { requester: authResult.user.username }, lang);
                    return res.status(403).json({
                        success: false,
                        message: message
                    });
                }

                if (!(isOwner || isModeratorOrAdmin)) {
                    const message = translationManager.translate('not_authorized_update_comment', {}, lang);
                    return res.status(403).json({
                        success: false,
                        message: message
                    });
                }

                const validation = dataValidator(body, translationManager, lang);
                if (!validation.success) {
                    return res.status(400).json({
                        success: false,
                        message: validation.message,
                    });
                }

                // عملية التحويل من ماركداون إلى HTML
                const htmlContent = marked(body?.comment_content ? body.comment_content : comment.comment_content);
                // تحويل HTML إلى نص عادي
                const plainTextContent = convert(htmlContent, { wordwrap: false });

                const updatedComment = {
                    comment_id: comment.comment_id,
                    post_id: comment.post_id,
                    user_id: comment.user_id,
                    comment_content: htmlContent,
                    comment_content_raw: plainTextContent,
                    created_at: comment.created_at,
                    updated_at: new Date().toISOString()
                };

                postsDBManager.updateRecord("comments", { comment_id: comment_id }, updatedComment);
                const message = translationManager.translate('comment_updated', { comment_id: comment_id }, lang);
                return res.status(200).json({
                    success: true,
                    comment: {
                        ...comment,
                        ...updatedComment
                    },
                    message: message
                });
            } catch (error) {
                logError("An error occurred while processing the request", error);
                return res.status(500).json({ message: `${error}` });
            }
        });

        // حذف تعليق بواسطة المعرف
        router.delete('/comments/:comment_id', async (req, res) => {
            try {
                const { headers, params, query } = req;
                const { comment_id } = params;

                if (query?.lang) {
                    lang = query?.lang
                }

                if (comment_id && comment_id.length > 50) {
                    const message = translationManager.translate('comment_id_too_long', { length: 50 }, lang);
                    return res.status(422).json({
                        success: false,
                        message: message,
                    });
                }

                const authResult = await checkUserAuthentication({ username: headers["username"], password: headers["password"] }, { session: req.session, lang: lang });
                if (!authResult.success) {
                    return res.status(401).json(authResult);
                }

                const comment = postsDBManager.findRecord("comments", { comment_id: comment_id });
                if (!comment) {
                    const message = translationManager.translate('comment_not_found', {}, lang);
                    return res.status(404).json({
                        success: false,
                        message: message
                    });
                }

                const isOwner = authResult.user.user_id === post.user_id;
                const isAdmin = checkUserRole(authResult.user, ["admin"]);
                const isBanned = convertToBoolean(authResult.user.is_banned); // تأكد من حالة الحظر للمستخدم

                // تحقق من حالة الحظر أولاً
                if (isBanned) {
                    const message = translationManager.translate('user_banned_delete_comment', { requester: authResult.user.username }, lang);
                    return res.status(403).json({
                        success: false,
                        message: message
                    });
                }

                if (!(isOwner || isAdmin)) {
                    const message = translationManager.translate('not_authorized_delete_comment', {}, lang);
                    return res.status(403).json({
                        success: false,
                        message: message
                    });
                }

                postsDBManager.deleteRecord("comments", { comment_id: comment_id });
                const message = translationManager.translate('comment_deleted', { comment_id: comment_id }, lang);
                return res.status(200).json({
                    success: true,
                    comment: comment,
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