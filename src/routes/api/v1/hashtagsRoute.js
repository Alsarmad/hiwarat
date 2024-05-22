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
        const MAX_HASHTAGS_PER_PAGE = 20;
        const lang = config.defaultLang;

        // الحصول على كل الهاشتاجات بدون تكرارات
        router.get('/hashtags', (req, res) => {
            try {
                const lang = config.defaultLang;
                const { page = 1, limit = 20 } = req.query;

                // التحقق من الحد الأقصى لعدد الهاشتاجات في كل صفحة
                if (parseInt(limit) > MAX_HASHTAGS_PER_PAGE) {
                    const message = translationManager.translate('max_hashtags_per_page_exceeded', { max_hashtags_per_page: MAX_HASHTAGS_PER_PAGE }, lang);
                    return res.status(400).json({
                        success: false,
                        message: message,
                    });
                }

                const offset = (page - 1) * limit;

                // استعلام قاعدة البيانات لاسترجاع الهاشتاجات بدون تكرار
                const statement = `SELECT DISTINCT hashtag_text FROM hashtags ORDER BY ROWID DESC LIMIT ? OFFSET ?`;
                const hashtags = postsDBManager.db.prepare(statement).all(limit, offset);

                if (hashtags.length === 0) {
                    const message = translationManager.translate('no_records_found', {}, lang);
                    return res.status(404).json({
                        success: false,
                        message: message
                    });
                }

                return res.status(200).json({
                    success: true,
                    hashtags: hashtags.map(tag => tag.hashtag_text)
                });
            } catch (error) {
                logError(error);
                return res.status(500).json({ message: `${error}` });
            }
        });

        // الحصول على هاشتاج بواسطة اسم الهاشتاق hashtag_text مع دعم الفلترة والترتيب
        router.get('/hashtags/:hashtag_text', (req, res) => {
            try {
                const { hashtag_text } = req.params;
                const { page = 1, limit = 20 } = req.query;
                const lang = config.defaultLang;

                const pageNum = parseInt(page);
                const limitNum = Math.min(parseInt(limit), MAX_HASHTAGS_PER_PAGE);
                if (parseInt(req.query.limit) > MAX_HASHTAGS_PER_PAGE) {
                    const message = translationManager.translate('max_hashtags_per_page_exceeded', { max_hashtags_per_page: MAX_HASHTAGS_PER_PAGE }, lang);
                    return res.status(400).json({
                        success: false,
                        message: message,
                    });
                }
                const offset = (pageNum - 1) * limitNum;

                // استعلام قاعدة البيانات لاسترجاع الهاشتاجات بالترتيب الصحيح والفلترة
                const statement = "SELECT h.*, p.*\nFROM hashtags h\nLEFT JOIN posts p ON h.post_id = p.post_id\nWHERE h.hashtag_text = ? \nORDER BY h.ROWID DESC\nLIMIT ?\nOFFSET ?"
                const hashtagsPosts = postsDBManager.db.prepare(statement).all(hashtag_text, limitNum, offset);
                if (hashtagsPosts.length === 0) {
                    const message = translationManager.translate('hashtag_not_found', {}, lang);
                    return res.status(404).json({
                        success: false,
                        message: message
                    });
                }

                return res.status(200).json({
                    success: true,
                    hashtagsPosts: hashtagsPosts
                });
            } catch (error) {
                logError(error);
                return res.status(500).json({ message: `${error}` });
            }
        });



        // حذف هاشتاج بواسطة نص الهاشتاج
        router.delete('/hashtags/:hashtag_text', async (req, res) => {
            try {
                const { headers, params } = req;
                const { hashtag_text } = params;

                if (hashtag_text && hashtag_text.length > 50) {
                    const message = translationManager.translate('hashtag_id_too_long', { length: 50 }, lang);
                    return res.status(422).json({
                        success: false,
                        message: message,
                    });
                }

                const authResult = await checkUserAuthentication({ username: headers["username"], password: headers["password"] });
                if (!authResult.success) {
                    return res.status(401).json(authResult);
                }

                const isAdmin = checkUserRole(authResult.user, ["admin"]);

                if (!isAdmin) {
                    const message = translationManager.translate('not_authorized_delete_hashtag', {}, lang);
                    return res.status(403).json({
                        success: false,
                        message: message
                    });
                }

                // التحقق من وجود الهاشتاج بالنص
                const hashtagRecords = postsDBManager.findRecordAll("hashtags", "hashtag_text", hashtag_text);
                if (hashtagRecords.length === 0) {
                    const message = translationManager.translate('hashtag_not_found', {}, lang);
                    return res.status(404).json({
                        success: false,
                        message: message
                    });
                }

                // حذف جميع الهاشتاجات بالنص المحدد
                postsDBManager.deleteRecord("hashtags", { hashtag_text: hashtag_text });

                // حذف جميع المنشورات والتعليقات المرتبطة بالهاشتاج
                const postIdsToDelete = [];
                hashtagRecords.forEach(hashtagRecord => {
                    const posts = postsDBManager.findRecord("posts", { post_id: hashtagRecord.post_id });
                    if (posts) {
                        postIdsToDelete.push(hashtagRecord.post_id);
                        postsDBManager.deleteRecord("posts", { post_id: hashtagRecord.post_id });
                        postsDBManager.deleteRecord("comments", { post_id: hashtagRecord.post_id });
                        postsDBManager.deleteRecord("hashtags", { post_id: hashtagRecord.post_id });
                    }
                });

                const message = translationManager.translate('hashtag_and_related_posts_and_comments_deleted', {}, lang);
                return res.status(200).json({
                    success: true,
                    message: message,
                    deleted_post_ids: postIdsToDelete
                });
            } catch (error) {
                const message = translationManager.translate('error_while_deleting_hashtag', {}, lang);
                logError(message, error);
                return res.status(500).json({ message: `${message} ${error}` });
            }
        });

    } catch (error) {
        logError(error);
    }
}
