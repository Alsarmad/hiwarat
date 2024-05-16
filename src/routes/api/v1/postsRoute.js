export default async (router, config, logger) => {
    const { logError } = logger;
    try {
        // الحصول على كل المنشورات
        router.get('/posts', PostsController.getAllPosts);

        // إنشاء منشور جديد
        router.post('/posts', PostsController.createPost);

        // الحصول على منشور بواسطة المعرف
        router.get('/posts/:id', PostsController.getPostById);

        // تحديث منشور بواسطة المعرف
        router.put('/posts/:id', PostsController.updatePost);

        // حذف منشور بواسطة المعرف
        router.delete('/posts/:id', PostsController.deletePost);
    } catch (error) {
        logError(error);
    }
}
