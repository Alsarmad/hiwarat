export default async (router, config, logger, utils, DBManager) => {
    const { logError } = logger;
    try {

        const {
            translationManager,
            tryParseJSON,
            getElapsedTime
        } = utils;

        const { postsDBManager, usersDBManager, reportsDBManager } = DBManager;
        let lang = config.defaultLang;

        router.get('/create-post', async (req, res) => {
            try {

                const session = req?.session;
                if (!session) {
                    return res.redirect("/login");
                }

                const options = {
                    getElapsedTime: getElapsedTime,
                };
                return res.status(200).render("create-post", options);

            } catch (error) {
                logError("An error occurred while processing the request", error);
                return res.status(500).json({ message: `${error}` });
            }
        });

        router.get('/posts/:post_id', async (req, res) => {
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
                // التأكد من أن الكائن views موجود داخل الكوكيز، وإذا لم يكن موجوداً فإننا نقوم بإنشائه ككائن فارغ
                if (!req.cookies?.views) {
                    req.cookies.views = {};
                    res.cookie('views', {}, { httpOnly: true });

                }

                // التحقق من وجود المفتاح post_id في الكائن views، وإذا لم يكن موجوداً فإننا نقوم بإعداده إلى true
                if (!req.cookies.views[post_id]) {
                    req.cookies.views[post_id] = true;
                    // تحديث الكوكي views في الاستجابة
                    res.cookie('views', req.cookies.views, { httpOnly: true });
                    // زيادة عدد المشاهدات في قاعدة البيانات
                    postsDBManager.incrementViewCount(post_id);
                }


                const postDB = {
                    ...post,
                    hashtags: tryParseJSON(post?.hashtags)
                }

                const user = usersDBManager.findRecord("users", { user_id: post.user_id });
                if (!user) {
                    const message = translationManager.translate('user_not_found', {}, lang);
                    return res.status(404).json({
                        success: false,
                        message: message
                    });
                }
                const totalLikes = postsDBManager.countRecords('likes', { post_id: post_id });
                const totalComments = postsDBManager.countRecords('comments', { post_id: post_id });
                const totalViews = postsDBManager.findRecord('views', { post_id: post_id });
                const totalReports = reportsDBManager.countRecords('reports', { reported_item_id: post_id });

                const options = {
                    postDB: postDB,
                    userDB: user,
                    statisticsDB: {
                        likes: totalLikes || 0,
                        comments: totalComments || 0,
                        views: totalViews?.view_count || 0,
                        reports: totalReports || 0,
                    }
                };
                return res.status(200).render("posts", options);

            } catch (error) {
                logError("An error occurred while processing the request", error);
                return res.status(500).json({ message: `${error}` });
            }
        });
    } catch (error) {
        logError("An error occurred while processing the request", error);
    }
}