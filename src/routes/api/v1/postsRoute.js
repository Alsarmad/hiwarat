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
        const MAX_POSTS_PER_PAGE = 20;
        let lang = config.defaultLang;

        // إعداد المحدد للطلبات مع رسالة مخصصة
        const createPostLimiter = rateLimit({
            windowMs: 24 * 60 * 60 * 1000, // 24 ساعة
            max: 20, // الحد الأقصى لعدد الطلبات لكل IP خلال نافذة الوقت المحددة
            handler: (req, res) => {
                const message = translationManager.translate('post_rate_limit_exceeded', {}, lang);
                res.status(429).json({
                    success: false,
                    message: message,
                });
            },
            headers: true,
        });

        // جلب المنشورات مع دعم تقسيم الصفحات وعرض المنشورات المثبتة في جميع الصفحات.
        router.get('/posts', async (req, res) => {
            try {
                const { query } = req;

                if (query?.lang) {
                    lang = query?.lang
                }
                const page = parseInt(query.page) || 1;
                let limit = parseInt(query.limit) || MAX_POSTS_PER_PAGE;
                limit = Math.min(limit, MAX_POSTS_PER_PAGE);

                if (parseInt(query.limit) > MAX_POSTS_PER_PAGE) {
                    const message = translationManager.translate('max_posts_per_page_exceeded', { max_posts_per_page: MAX_POSTS_PER_PAGE }, lang);
                    return res.status(400).json({
                        success: false,
                        message: message,
                    });
                }

                const offset = (page - 1) * limit;

                // جلب المنشورات المثبتة
                const pinnedPosts = postsDBManager.getPinnedPosts();

                // جلب المنشورات غير المثبتة مع تطبيق التصفية والصفحات
                const nonPinnedPosts = postsDBManager.getNonPinnedPosts(limit, offset);

                // دمج المنشورات المثبتة مع المنشورات غير المثبتة
                const allPosts = [...pinnedPosts, ...nonPinnedPosts];

                if (allPosts.length === 0) {
                    const message = translationManager.translate('no_records_found', {}, lang);
                    return res.status(404).json({
                        success: false,
                        posts: [],
                        message: message
                    });
                }

                return res.status(200).json({
                    success: true,
                    posts: allPosts.map(post => {
                        return {
                            ...post,
                            hashtags: tryParseJSON(post?.hashtags),
                            is_pinned: convertToBoolean(post?.is_pinned)
                        }
                    })
                });
            } catch (error) {
                logError("An error occurred while processing the request", error);
                return res.status(500).json({ message: `${error}` });
            }
        });

        // إنشاء منشور جديد
        router.post('/create-posts', createPostLimiter, async (req, res) => {
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
                    const message = translationManager.translate('user_banned_create_post', { requester: authResult.user.username }, lang);
                    return res.status(403).json({
                        success: false,
                        message: message
                    });
                }

                const missingFields = getMissingFields(body, ["post_title", "post_content", "hashtags"]);
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

                // التحقق من الصلاحيات لتثبيت المنشور
                if (body?.is_pinned && !checkUserRole(authResult.user, ["admin", "moderator"])) {
                    const message = translationManager.translate('not_authorized_pin_post', {}, lang);
                    return res.status(403).json({
                        success: false,
                        message: message
                    });
                }

                // التحقق وتنظيف الهاشتاجات المكررة
                const hashtags = body.hashtags.map(tag => tag?.toString()?.trim()?.toLowerCase()?.replace(/\s+/g, '_'));
                const uniqueHashtags = [...new Set(hashtags)].slice(0, 10);
                // معرف فريد للمنشور
                const post_id = generateUniqueId(35);
                // الوقت الحالي
                const currentTime = new Date().toISOString();
                // عملية التحويل من ماركداون إلى HTML
                const htmlContent = marked(body.post_content);
                // تحويل HTML إلى نص عادي
                const plainTextContent = convert(htmlContent, { wordwrap: false });
                let post_title = convert(body.post_title, { wordwrap: false })
                post_title = post_title.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
                const dataPost = {
                    post_id,
                    user_id: authResult.user.user_id,
                    post_title: post_title,
                    post_content: htmlContent || body.post_content,
                    post_content_raw: plainTextContent || htmlContent,
                    hashtags: uniqueHashtags,
                    is_pinned: convertToBoolean(body?.is_pinned) ? 1 : 0,
                    created_at: currentTime,
                    updated_at: currentTime,
                }

                postsDBManager.insertRecord("posts", dataPost);

                for (const hashtag of uniqueHashtags) {
                    const hashtag_id = generateUniqueId(35);
                    postsDBManager.insertRecord("hashtags", {
                        hashtag_id,
                        post_id,
                        hashtag_text: hashtag,
                        created_at: currentTime
                    });
                }

                const message = translationManager.translate('post_created', { post_id: post_id }, lang);
                res.status(200).json({
                    success: true,
                    post: {
                        ...dataPost,
                        is_pinned: convertToBoolean(body?.is_pinned)
                    },
                    message: message
                });
            } catch (error) {
                logError("An error occurred while processing the request", error);
                return res.status(500).json({ message: `${error}` });
            }
        });

        // الحصول على منشور بواسطة المعرف
        router.get('/posts/:post_id', (req, res) => {
            try {

                const { query, params } = req;
                const { post_id } = params;

                if (query?.lang) {
                    lang = query?.lang
                }

                if (post_id && post_id.length > 50) {
                    const message = translationManager.translate('post_id_too_long', { length: 50 }, lang);
                    return res.status(422).json({
                        success: false,
                        message: message,
                    });
                }

                const post = postsDBManager.findRecord("posts", { post_id });
                if (!post) {
                    const message = translationManager.translate('post_not_found', {}, lang);
                    return res.status(404).json({
                        success: false,
                        message: message
                    });
                }

                // التحقق من وجود سجل للمشاهدات في الجلسة
                if (!req.cookies.views) {
                    res.cookie('views', {}, { httpOnly: true });
                }

                // التحقق مما إذا كان المنشور قد تمت مشاهدته في هذه الجلسة
                if (!req.cookies.views[post_id]) {
                    req.cookies.views[post_id] = true;
                    res.cookie('views', req.cookies.views, { httpOnly: true });

                    // زيادة عدد المشاهدات في قاعدة البيانات
                    postsDBManager.incrementViewCount(post_id);
                }

                return res.status(200).json({
                    success: true,
                    post: {
                        ...post,
                        hashtags: tryParseJSON(post?.hashtags)
                    },

                });
            } catch (error) {
                logError("An error occurred while processing the request", error);
                return res.status(500).json({ message: `${error}` });
            }
        });

        // الحصول على التعليقات الخاصة بالمنشور بواسطة نعرف المنشور
        router.get('/posts/:post_id/comments', (req, res) => {
            try {

                const { query, params } = req;
                const { post_id } = params;

                if (query?.lang) {
                    lang = query?.lang
                }

                if (post_id && post_id.length > 50) {
                    const message = translationManager.translate('post_id_too_long', { length: 50 }, lang);
                    return res.status(422).json({
                        success: false,
                        message: message,
                    });
                }

                const post = postsDBManager.findRecord("posts", { post_id });
                if (!post) {
                    const message = translationManager.translate('post_not_found', {}, lang);
                    return res.status(404).json({
                        success: false,
                        message: message
                    });
                }

                const comments = postsDBManager.findRecordAll("comments", { post_id: post_id });

                return res.status(200).json({
                    success: true,
                    comments: comments.reverse()

                });
            } catch (error) {
                logError("An error occurred while processing the request", error);
                return res.status(500).json({ message: `${error}` });
            }
        });

        // تحديث منشور بواسطة المعرف
        router.put('/posts/:post_id', async (req, res) => {
            try {
                const { headers, body, params, query } = req;
                const { post_id } = params;

                if (query?.lang) {
                    lang = query?.lang
                }

                if (post_id && post_id.length > 50) {
                    const message = translationManager.translate('post_id_too_long', { length: 50 }, lang);
                    return res.status(422).json({
                        success: false,
                        message: message,
                    });
                }

                const authResult = await checkUserAuthentication({ username: headers["username"], password: headers["password"] }, { session: req.session, lang: lang });
                if (!authResult.success) {
                    return res.status(401).json(authResult);
                }

                // التحقق من وجود المنشور
                const post = postsDBManager.findRecord("posts", { post_id });
                if (!post) {
                    const message = translationManager.translate('post_not_found', {}, lang);
                    return res.status(404).json({
                        success: false,
                        message: message
                    });
                }

                // التحقق من صلاحية المستخدم لتحديث بينات المنشور
                const isOwner = authResult.user.user_id === post.user_id;
                const isModeratorOrAdmin = checkUserRole(authResult.user, ["admin", "moderator"]);
                const isBanned = convertToBoolean(authResult.user.is_banned); // تأكد من حالة الحظر للمستخدم

                // تحقق من حالة الحظر أولاً
                if (isBanned) {
                    const message = translationManager.translate('user_banned_update_post', { requester: authResult.user.username }, lang);
                    return res.status(403).json({
                        success: false,
                        message: message
                    });
                }

                if (!(isOwner || isModeratorOrAdmin)) {
                    const message = translationManager.translate('not_authorized_update_post', {}, lang);
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

                // التحقق من الصلاحيات لتثبيت المنشور
                if (body?.is_pinned && !isModeratorOrAdmin) {
                    const message = translationManager.translate('not_authorized_pin_post', {}, lang);
                    return res.status(403).json({
                        success: false,
                        message: message
                    });
                }

                const currentTime = new Date().toISOString();

                // الهاشتاقات الجديدة لإضافتها
                // const newHashtags = body?.hashtags?.slice(0, 10) || tryParseJSON(post.hashtags);
                const newHashtags = (body?.hashtags?.map(tag => tag?.toString()?.trim()?.toLowerCase()?.replace(/\s+/g, '_')) || tryParseJSON(post.hashtags))?.slice(0, 10);

                // الهاشتاقات القديمة في المنشور
                const oldHashtags = tryParseJSON(post.hashtags)

                // حفظ الهاشتاقات الجديدة في قاعدة البيانات
                for (const hashtag of newHashtags) {
                    if (!oldHashtags.includes(hashtag)) {
                        const existingHashTag = postsDBManager.findRecord("hashtags", { post_id, hashtag_text: hashtag });
                        if (!existingHashTag) {
                            const hashtag_id = generateUniqueId(35);
                            postsDBManager.insertRecord("hashtags", {
                                hashtag_id,
                                post_id,
                                hashtag_text: hashtag,
                                created_at: currentTime
                            });
                        }
                    }
                }

                // حذف الهاشتاقات التي تمت إزالتها من المنشور
                for (const hashtag of oldHashtags) {
                    if (!newHashtags.includes(hashtag)) {
                        const existingHashTag = postsDBManager.findRecord("hashtags", { post_id, hashtag_text: hashtag });
                        if (existingHashTag) {
                            postsDBManager.deleteRecord("hashtags", { post_id, hashtag_text: hashtag });
                        }
                    }
                }

                // عملية التحويل من ماركداون إلى HTML
                const htmlContent = marked(body?.post_content ? body.post_content : post.post_content);
                // تحويل HTML إلى نص عادي
                const plainTextContent = convert(htmlContent, { wordwrap: false });
                const updatedPost = {
                    post_content: htmlContent || post.post_content,
                    post_content_raw: plainTextContent || post.post_content_raw,
                    hashtags: newHashtags,
                    is_pinned: convertToBoolean(body?.is_pinned) ? 1 : convertToBoolean(post?.is_pinned) ? 1 : 0,
                    updated_at: currentTime,
                }

                // تحديث المنشور بالبيانات الجديدة
                postsDBManager.updateRecord("posts", { post_id: post_id }, updatedPost);

                const message = translationManager.translate('post_updated', { post_id: post_id }, lang);
                res.status(200).json({
                    success: true,
                    post: {
                        ...post,
                        ...updatedPost
                    },
                    message: message
                });

            } catch (error) {
                logError("An error occurred while processing the request", error);
                return res.status(500).json({ message: `${error}` });
            }
        });

        // حذف منشور بواسطة المعرف
        router.delete('/posts/:post_id', async (req, res) => {
            try {
                const { headers, params, query } = req;
                const { post_id } = params;

                if (query?.lang) {
                    lang = query?.lang
                }

                if (post_id && post_id.length > 50) {
                    const message = translationManager.translate('post_id_too_long', { length: 50 }, lang);
                    return res.status(422).json({
                        success: false,
                        message: message,
                    });
                }

                const authResult = await checkUserAuthentication({ username: headers["username"], password: headers["password"] }, { session: req.session, lang: lang });
                if (!authResult.success) {
                    return res.status(401).json(authResult);
                }

                // التحقق من وجود المنشور
                const post = postsDBManager.findRecord("posts", { post_id });
                if (!post) {
                    const message = translationManager.translate('post_not_found', {}, lang);
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
                    const message = translationManager.translate('user_banned_delete_post', { requester: authResult.user.username }, lang);
                    return res.status(403).json({
                        success: false,
                        message: message
                    });
                }

                if (!(isOwner || isAdmin)) {
                    const message = translationManager.translate('not_authorized_delete_post', {}, lang);
                    return res.status(403).json({
                        success: false,
                        message: message
                    });
                }

                // حذف الهاشتاقات المرتبطة بالمنشور من قاعدة البيانات
                postsDBManager.deleteRecord("hashtags", { post_id });
                // حذف المنشور من قاعدة البيانات
                postsDBManager.deleteRecord("posts", { post_id });
                // حذف التعليقات المرتبطة بالمنشور من قاعدة البيانات
                postsDBManager.deleteRecord("comments", { post_id });

                const message = translationManager.translate('post_deleted', { post_id: post_id }, lang);
                res.status(200).json({
                    success: true,
                    post: post,
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