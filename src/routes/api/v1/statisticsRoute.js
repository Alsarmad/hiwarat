export default async (router, config, logger, utils, DBManager) => {
    const { logError } = logger;
    try {
        const {
            translationManager,
        } = utils;
        const { postsDBManager, reportsDBManager, usersDBManager } = DBManager;
        const lang = config.defaultLang;

        // الحصول على كل الإحصائيات
        router.get('/statistics', async (req, res) => {
            try {
                const totalUsers = usersDBManager.countAllRecords('users');
                const totalPosts = postsDBManager.countAllRecords('posts');
                const totalPinnedPosts = postsDBManager.countRecords('posts', { is_pinned: 1 });
                const totalComments = postsDBManager.countAllRecords('comments');
                const totalHashtags = postsDBManager.countAllRecords('hashtags');
                const totalReports = reportsDBManager.countAllRecords('reports');

                return res.status(200).json({
                    totalUsers: totalUsers || 0,
                    totalPosts: totalPosts || 0,
                    totalPinnedPosts: totalPinnedPosts || 0,
                    totalComments: totalComments || 0,
                    totalHashtags: totalHashtags || 0,
                    totalReports: totalReports || 0
                });
            } catch (error) {
                logError("An error occurred while processing the request", error);
                return res.status(500).json({ message: `${error}` });
            }
        });

        // الحصول على إحصائيات منشور معين
        router.get('/statistics/:post_id', async (req, res) => {
            try {
                const { post_id } = req.params;

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

                const totalLikes = postsDBManager.countRecords('likes', { post_id: post_id });
                const totalComments = postsDBManager.countRecords('comments', { post_id: post_id });
                const totalViews = postsDBManager.countRecords('views', { post_id: post_id });
                const totalReports = reportsDBManager.countRecords('reports', { reported_item_id: post_id });

                return res.status(200).json({
                    success: true,
                    likes: totalLikes || 0,
                    comments: totalComments || 0,
                    views: totalViews || 0,
                    reports: totalReports || 0,
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
