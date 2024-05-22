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
        const { postsDBManager } = DBManager;
        const lang = config.defaultLang;

        // إنشاء إعجاب جديد
        router.post('/create-likes', async (req, res) => {
            try {

                const { body, headers } = req;
                const authResult = await checkUserAuthentication({ username: headers["username"], password: headers["password"] });
                if (!authResult.success) {
                    return res.status(401).json(authResult);
                }

                const isBanned = convertToBoolean(authResult.user.is_banned);
                if (isBanned) {
                    const message = translationManager.translate('user_banned_create_like', { requester: authResult.user.username }, lang);
                    return res.status(403).json({
                        success: false,
                        message: message
                    });
                }

                const missingFields = getMissingFields(body, ["post_id"]);
                if (missingFields.length > 0) {
                    return sendMissingFieldsResponse(res, missingFields);
                }

                // التحقق من البيانات المدخلة
                const validation = dataValidator.validate(body);
                if (!validation.success) {
                    return res.status(400).json({
                        success: false,
                        message: validation.message,
                    });
                }

                // التحقق من وجود المنشور
                const post = postsDBManager.findRecord("posts", { post_id: body.post_id });
                if (!post) {
                    const message = translationManager.translate('post_not_found', {}, lang);
                    return res.status(404).json({
                        success: false,
                        message: message
                    });
                }

                // معرف فريد للإعجاب
                const like_id = generateUniqueId(35);
                // الوقت الحالي
                const currentTime = new Date().toISOString();
                const dataLike = {
                    like_id: like_id,
                    post_id: body.post_id,
                    user_id: authResult.user.user_id,
                    created_at: currentTime,
                }
                postsDBManager.insertRecord("likes", dataLike);

                const message = translationManager.translate('like_created', { like_id: like_id }, lang);
                res.status(200).json({
                    success: true,
                    like: dataLike,
                    message: message
                });

            } catch (error) {
                logError("An error occurred while processing the request", error);
                return res.status(500).json({ message: `${error}` });
            }
        });

        // الحصول على إعجاب بواسطة المعرف
        router.get('/likes/:like_id', async (req, res) => {
            try {
                const { like_id } = req.params;
                if (like_id && like_id.length > 50) {
                    const message = translationManager.translate('like_id_too_long', { length: 50 }, lang);
                    return res.status(422).json({
                        success: false,
                        message: message,
                    });
                }
                // التحقق من وجود الإعجاب
                const like = await postsDBManager.findRecord("likes", { like_id });
                if (!like) {
                    const message = translationManager.translate('like_not_found', {}, lang);
                    return res.status(404).json({
                        success: false,
                        message: message
                    });
                }

                res.status(200).json({
                    success: true,
                    like: like
                });

            } catch (error) {
                logError("An error occurred while processing the request", error);
                return res.status(500).json({ message: `${error}` });
            }
        });

        // الحصول على إعجاب بواسطة معرف المنشور
        router.get('/likes/:post_id', async (req, res) => {
            try {
                const { post_id } = req.params;

                if (post_id && post_id.length > 50) {
                    const message = translationManager.translate('post_id_too_long', { length: 50 }, lang);
                    return res.status(422).json({
                        success: false,
                        message: message,
                    });
                }

                // التحقق من وجود المنشور
                const post = await postsDBManager.findRecord("posts", { post_id });
                if (!post) {
                    const message = translationManager.translate('post_not_found', {}, lang);
                    return res.status(404).json({
                        success: false,
                        message: message
                    });
                }

                // الحصول على جميع الإعجابات المرتبطة بالمنشور
                const likes = await postsDBManager.findRecordAll("likes", "post_id", post_id);
                if (!likes || likes.length === 0) {
                    const message = translationManager.translate('no_likes_found', {}, lang);
                    return res.status(404).json({
                        success: false,
                        message: message
                    });
                }

                res.status(200).json({
                    success: true,
                    likes: likes
                });

            } catch (error) {
                logError("An error occurred while processing the request", error);
                return res.status(500).json({ message: `${error}` });
            }
        });


        // حذف إعجاب بواسطة المعرف
        router.delete('/likes/:like_id', async (req, res) => {
            try {

                const { headers, params } = req;
                const { like_id } = params;

                const authResult = await checkUserAuthentication({ username: headers["username"], password: headers["password"] });
                if (!authResult.success) {
                    return res.status(401).json(authResult);
                }

                const isBanned = convertToBoolean(authResult.user.is_banned);
                if (isBanned) {
                    const message = translationManager.translate('user_banned_delete_like', { requester: authResult.user.username }, lang);
                    return res.status(403).json({
                        success: false,
                        message: message
                    });
                }

                if (like_id && like_id.length > 50) {
                    const message = translationManager.translate('like_id_too_long', { length: 50 }, lang);
                    return res.status(422).json({
                        success: false,
                        message: message,
                    });
                }
                // التحقق من وجود الإعجاب
                const like = await postsDBManager.findRecord("likes", { like_id });
                if (!like) {
                    const message = translationManager.translate('like_not_found', {}, lang);
                    return res.status(404).json({
                        success: false,
                        message: message
                    });
                }

                // التحقق من صلاحية المستخدم لتحديث بينات المنشور
                const isOwner = authResult.user.user_id === like.user_id;

                if (!isOwner) {
                    const message = translationManager.translate('not_authorized_delete_like', {}, lang);
                    return res.status(403).json({
                        success: false,
                        message: message
                    });
                }

                // حذف الإعجاب
                await postsDBManager.deleteRecord("likes", { like_id });

                const message = translationManager.translate('like_deleted', { like_id: like_id }, lang);
                res.status(200).json({
                    success: true,
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
