import { convert } from 'html-to-text';

export default async (router, config, logger, utils, DBManager) => {
    const { logError } = logger;
    try {
        const {
            sendUnauthorizedResponse,
            getMissingFields,
            sendMissingFieldsResponse,
            validateAPIKeys,
            tryParseJSON,
            generateUniqueId
        } = utils;

        const { postsDBManager, usersDBManager } = DBManager;

        // الحصول على كل المنشورات
        router.get('/posts', (req, res) => {
            try {
                const { headers } = req;

                if (!validateAPIKeys({ config }, headers)) {
                    return sendUnauthorizedResponse(res);
                }
                const posts = postsDBManager.getRecordsAll("posts");

                if (posts.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: `لايوجد سجلات (قاعدة البيانات فارغة) ❌`
                    });
                }

                return res.status(200).json({
                    success: true,
                    posts: posts.map(post => {
                        return {
                            ...post,
                            hashtags: tryParseJSON(post?.hashtags)
                        }
                    })
                });
            } catch (error) {
                logError(error);
                return res.status(500).json({ message: `${error}` });
            }
        });

        // إنشاء منشور جديد
        router.post('/create-posts', (req, res) => {
            try {
                const { body, headers } = req;
                const missingFields = getMissingFields(body, ["user_id", "post_content", "hashtags"]);

                if (missingFields.length > 0) {
                    return sendMissingFieldsResponse(res, missingFields);
                }


                const existingUser = usersDBManager.findRecord("users", { user_id: body.user_id });
                if (!existingUser) {
                    return res.status(401).json({
                        success: false,
                        message: `العضو غير موجود: لايوجد لدينا عضو بهذا المعرف ${body.user_id}. ❌`
                    });
                }

                if (!validateAPIKeys({ user: existingUser }, headers)) {
                    return sendUnauthorizedResponse(res);
                }

                // التحقق إذا كان body.hashtags مصفوفة
                if (!Array.isArray(body?.hashtags)) {
                    return res.status(400).json({
                        success: false,
                        message: `الرجاء توفير الهشتاقات في شكل مصفوفة ["tag1", "tag2", "tag3"]. ❌`
                    });
                }

                // التحقق وتنظيف الهاشتاقات المكررة
                const uniqueHashtags = [...new Set(body.hashtags)].slice(0, 10);
                // معرف فريد للمنشور
                const post_id = generateUniqueId(35);
                // الوقت الحالي
                const currentTime = new Date().toISOString();
                postsDBManager.insertRecord("posts", {
                    ...body,
                    post_id,
                    user_id: body.user_id,
                    hashtags: uniqueHashtags,
                    post_content_raw: convert(body.post_content, { wordwrap: false }),
                    created_at: currentTime,
                    updated_at: currentTime,
                });

                for (const hashtag of uniqueHashtags) {
                    const hashtag_id = generateUniqueId(35);
                    postsDBManager.insertRecord("hashtags", {
                        hashtag_id,
                        post_id,
                        hashtag_text: hashtag,
                        created_at: currentTime
                    });
                }

                res.status(200).json({
                    success: true,
                    ...body,
                    message: `تم إنشاء المنشور بالمعرف: ${post_id} ✔️`
                });
            } catch (error) {
                logError(error);
                return res.status(500).json({ message: `${error}` });
            }
        });

        // الحصول على منشور بواسطة المعرف
        router.get('/posts/:post_id', (req, res) => {
            try {
                const { post_id } = req.params;
                const post = postsDBManager.findRecord("posts", { post_id });

                if (!post) {
                    return res.status(404).json({
                        success: false,
                        message: `المنشور المطلوب غير موجود. ❌`
                    });
                }

                return res.status(200).json({
                    success: true,
                    ...post,
                    hashtags: tryParseJSON(post?.hashtags)
                });
            } catch (error) {
                logError(error);
                return res.status(500).json({ message: `${error}` });
            }
        });

        // تحديث منشور بواسطة المعرف
        router.put('/posts/:post_id', (req, res) => {
            try {
                const { headers, body, params } = req;
                const { post_id } = params;

                // التحقق من وجود المنشور
                const post = postsDBManager.findRecord("posts", { post_id });
                if (!post) {
                    return res.status(404).json({
                        success: false,
                        message: `المنشور المطلوب غير موجود. ❌`
                    });
                }

                // التحقق من وجود العضو
                const existingUser = usersDBManager.findRecord("users", { user_id: body.user_id });
                if (!existingUser) {
                    return res.status(401).json({
                        success: false,
                        message: `العضو غير موجود: لا يوجد لدينا عضو بهذا المعرف ${body.user_id}. ❌`
                    });
                }

                // التحقق من صحة المفاتيح الخاصة بالواجهة البرمجية
                if (!validateAPIKeys({ user: existingUser }, headers)) {
                    return sendUnauthorizedResponse(res);
                }

                const currentTime = new Date().toISOString();

                // الهاشتاقات الجديدة لإضافتها
                const newHashtags = body?.hashtags?.slice(0, 10) || tryParseJSON(post.hashtags);

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

                // تحديث المنشور بالبيانات الجديدة
                postsDBManager.updateRecord("posts", "post_id", post_id, {
                    post_content: body.post_content || post.post_content,
                    post_content_raw: convert(body.post_content || post.post_content, { wordwrap: false }),
                    hashtags: newHashtags,
                    updated_at: currentTime,
                });

                res.status(200).json({
                    success: true,
                    message: `تم تحديث المنشور بنجاح: ${post_id} ✔️`
                });

            } catch (error) {
                logError(error);
                return res.status(500).json({ message: `${error}` });
            }
        });

        // حذف منشور بواسطة المعرف
        router.delete('/posts/:post_id', (req, res) => {
            try {
                const { headers, params, body } = req;
                const { post_id } = params;

                // التحقق من وجود المنشور
                const post = postsDBManager.findRecord("posts", { post_id });
                if (!post) {
                    return res.status(404).json({
                        success: false,
                        message: `المنشور المطلوب غير موجود. ❌`
                    });
                }

                const missingFields = getMissingFields(body, ["user_id"]);
                if (missingFields.length > 0) {
                    return sendMissingFieldsResponse(res, missingFields);
                }

                const user = usersDBManager.findRecord("users", { user_id: body?.user_id });
                if (!user) {
                    return res.status(404).json({
                        success: false,
                        message: `المستخدم بالمعرف ${body?.user_id} غير موجود`
                    });
                }

                if (!validateAPIKeys({ user }, headers)) {
                    return sendUnauthorizedResponse(res);
                }
                // حذف الهاشتاقات المرتبطة بالمنشور من قاعدة البيانات
                postsDBManager.deleteRecord("hashtags", { post_id });

                // حذف المنشور من قاعدة البيانات
                postsDBManager.deleteRecord("posts", { post_id });

                res.status(200).json({
                    success: true,
                    message: `تم حذف المنشور بنجاح: ${post_id} ✔️`
                });

            } catch (error) {
                logError(error);
                return res.status(500).json({ message: `${error}` });
            }
        });

    } catch (error) {
        logError(error);
    }
}